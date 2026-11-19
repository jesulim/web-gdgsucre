import assert from "node:assert/strict"
import { test } from "node:test"
import type { SupabaseClient } from "@supabase/supabase-js"
import {
  fetchRaffleEvents,
  getRaffleParticipants,
  hasConfirmedRafflePayment,
  RaffleConfigurationError,
} from "../src/lib/services/raffleService"
import { RaffleFiltersSchema } from "../src/lib/validators/raffle"

test("payment confirmation uses existing confirmed status and excludes missing / exempt packages", () => {
  assert.equal(hasConfirmedRafflePayment("confirmed", "Gold"), true)
  for (const value of [null, undefined, "", "  ", "Sin Paquete (0 Bs)", "  sin paquete  ", 123]) {
    assert.equal(hasConfirmedRafflePayment("confirmed", value), false)
  }
  assert.equal(hasConfirmedRafflePayment("pending", "Gold"), false)
  assert.equal(hasConfirmedRafflePayment("confirmed", "Invitado", "invitado"), false)
})

test("query filters reject missing event and invalid booleans / roles", () => {
  assert.equal(RaffleFiltersSchema.safeParse({}).success, false)
  assert.equal(RaffleFiltersSchema.safeParse({ eventSlug: " " }).success, false)
  assert.equal(
    RaffleFiltersSchema.safeParse({ eventSlug: "devfest", paymentConfirmed: "yes" }).success,
    false
  )
  assert.equal(
    RaffleFiltersSchema.safeParse({ eventSlug: "devfest", role: "admin" }).success,
    false
  )
  assert.deepEqual(RaffleFiltersSchema.parse({ eventSlug: "devfest", paymentConfirmed: "true" }), {
    eventSlug: "devfest",
    paymentConfirmed: true,
  })
})

type Row = Record<string, unknown>
function fakeClient(tables: Record<string, Row[]>, failTable?: string) {
  const queries: Array<{ table: string; filters: Array<[string, unknown]> }> = []
  const client = {
    from(table: string) {
      let rows = [...(tables[table] ?? [])]
      const filters: Array<[string, unknown]> = []
      queries.push({ table, filters })
      const query = {
        select() {
          return query
        },
        eq(key: string, value: unknown) {
          filters.push([key, value])
          rows = rows.filter(row => row[key] === value)
          return query
        },
        in(key: string, values: unknown[]) {
          rows = rows.filter(row => values.includes(row[key]))
          return query
        },
        order() {
          return query
        },
        range(from: number, to: number) {
          rows = rows.slice(from, to + 1)
          return query
        },
        maybeSingle() {
          return Promise.resolve({
            data: table === failTable ? null : (rows[0] ?? null),
            error: table === failTable ? { code: "42703" } : null,
          })
        },
        // biome-ignore lint/suspicious/noThenProperty: Supabase query builders are intentionally thenable.
        then(resolve: (result: { data: Row[]; error: object | null }) => unknown) {
          return Promise.resolve(resolve({ data: rows, error: table === failTable ? {} : null }))
        },
      }
      return query
    },
  }
  return { client: client as unknown as SupabaseClient, queries }
}

const registration = (id: number, overrides: Row = {}) => ({
  id,
  user_id: `user-${id}`,
  event_id: 1,
  status: "confirmed",
  package: "Gold",
  created_at: "2026-11-15",
  profiles: { first_name: "Ana", last_name: `${id}` },
  ...overrides,
})
const tables = (registrations: Row[]) => ({
  events: [
    { id: 1, slug: "devfest", name: "DevFest" },
    { id: 2, slug: "other", name: "Other" },
  ],
  event_form_fields: [{ event_id: 1, name: "package", exempt_option: "Invitado" }],
  organizers: [{ id: 1, event_id: 1, profile_id: "user-2" }],
  registrations,
})

test("event + package + role intersect, deduplicate people and expose only draw fields", async () => {
  const { client } = fakeClient(
    tables([
      registration(1),
      registration(2),
      registration(3, { status: "pending" }),
      registration(4, { package: "Invitado" }),
      registration(5, { event_id: 2 }),
      registration(6, { user_id: "user-1" }),
      registration(7, { profiles: null }),
    ])
  )
  const result = await getRaffleParticipants(client, {
    eventSlug: "devfest",
    paymentConfirmed: true,
    role: "Participante",
  })
  assert.deepEqual(
    result?.map(row => row.id),
    [1]
  )
  assert.deepEqual(
    Object.keys(result?.[0] ?? {}).sort(),
    ["id", "first_name", "last_name", "role", "status", "package", "created_at"].sort()
  )
})

test("paginates beyond 1000 without dropping participants", async () => {
  const { client, queries } = fakeClient(
    tables(Array.from({ length: 1101 }, (_, i) => registration(i + 1)))
  )
  const result = await getRaffleParticipants(client, {
    eventSlug: "devfest",
    paymentConfirmed: false,
  })
  assert.equal(result?.length, 1101)
  assert.equal(queries.filter(query => query.table === "registrations").length, 12)
  assert.ok(
    queries
      .filter(query => query.table === "registrations")
      .every(query => query.filters.some(([key, value]) => key === "event_id" && value === 1))
  )
})

test("restricted event list never expands an empty staff scope", async () => {
  const { client, queries } = fakeClient(tables([]))
  assert.deepEqual(await fetchRaffleEvents(client, []), [])
  assert.equal(queries.length, 0)
  assert.equal((await fetchRaffleEvents(client, ["devfest"])).length, 1)
})

test("database failures fail closed and unknown event has no participants", async () => {
  const { client } = fakeClient(tables([registration(1)]), "registrations")
  await assert.rejects(
    getRaffleParticipants(client, { eventSlug: "devfest", paymentConfirmed: false })
  )
  assert.equal(
    await getRaffleParticipants(client, { eventSlug: "missing", paymentConfirmed: false }),
    null
  )
})

test("unfiltered draw does not depend on payment configuration being migrated", async () => {
  const { client, queries } = fakeClient(tables([registration(1)]), "event_form_fields")
  const result = await getRaffleParticipants(client, {
    eventSlug: "devfest",
    paymentConfirmed: false,
  })
  assert.equal(result?.length, 1)
  assert.equal(
    queries.some(query => query.table === "event_form_fields"),
    false
  )
})

test("payment filter fails explicitly rather than including exempt people without configuration", async () => {
  const { client } = fakeClient(tables([registration(1)]), "event_form_fields")
  await assert.rejects(
    getRaffleParticipants(client, { eventSlug: "devfest", paymentConfirmed: true }),
    RaffleConfigurationError
  )
})
