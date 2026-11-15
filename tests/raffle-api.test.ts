import { mock } from "bun:test"
import assert from "node:assert/strict"
import { test } from "node:test"
import type { APIContext } from "astro"

// Exercise the actual endpoint, withStaffOrAdmin, getProfile and event resolver.
// Only the external Supabase transport is replaced; no real sessions or database writes.
type Row = Record<string, unknown>
let currentUser: string | null = null
let tables: Record<string, Row[]> = {}
let queriedTables: string[] = []
const client = {
  auth: {
    getUser: async () => ({
      data: { user: currentUser ? { id: currentUser, user_metadata: {} } : null },
    }),
  },
  from(table: string) {
    queriedTables.push(table)
    let rows = [...(tables[table] ?? [])]
    const query = {
      select() {
        return query
      },
      eq(key: string, value: unknown) {
        rows = rows.filter(row => row[key] === value)
        return query
      },
      order() {
        return query
      },
      range(from: number, to: number) {
        rows = rows.slice(from, to + 1)
        return query
      },
      maybeSingle: async () => ({ data: rows[0] ?? null, error: null }),
      // biome-ignore lint/suspicious/noThenProperty: Model the real Supabase thenable transport.
      then(resolve: (result: { data: Row[]; error: null }) => unknown) {
        return Promise.resolve(resolve({ data: rows, error: null }))
      },
    }
    return query
  },
}
mock.module("../src/lib/supabase", () => ({ createUserClient: async () => client }))
const { GET } = await import("../src/pages/api/random-registrations")

function setup(user: string | null, admin = false, staffEvent?: number) {
  currentUser = user
  queriedTables = []
  tables = {
    profiles: user ? [{ id: user, is_admin: admin, first_name: "Staff", last_name: "User" }] : [],
    events: [
      { id: 1, slug: "devfest" },
      { id: 2, slug: "other" },
    ],
    event_staff: staffEvent ? [{ id: 1, user_id: user, event_id: staffEvent }] : [],
    event_form_fields: [],
    organizers: [],
    registrations: [
      {
        id: 42,
        event_id: 1,
        user_id: "participant",
        status: "confirmed",
        package: "Gold",
        created_at: "2026-11-15",
        profiles: { first_name: "Ana", last_name: "Perez" },
      },
    ],
  }
}

async function request(query = "eventSlug=devfest") {
  const url = new URL(`http://localhost/api/random-registrations?${query}`)
  return GET({ url, request: new Request(url), cookies: {} } as APIContext)
}

test("anonymous request is denied without reading participants", async () => {
  setup(null)
  assert.equal((await request()).status, 401)
  assert.equal(queriedTables.includes("registrations"), false)
})

test("ordinary member cannot access raffle participants", async () => {
  setup("member")
  assert.equal((await request()).status, 403)
  assert.equal(queriedTables.includes("registrations"), false)
})

test("staff of another event cannot access requested event", async () => {
  setup("staff", false, 2)
  assert.equal((await request()).status, 403)
  assert.equal(queriedTables.includes("registrations"), false)
})

test("staff can access their own event through the actual API authorization helper", async () => {
  setup("staff", false, 1)
  const response = await request()
  assert.equal(response.status, 200)
  assert.equal(response.headers.get("Cache-Control"), "private, no-store")
  assert.deepEqual(
    (await response.json()).data.map((row: { id: number }) => row.id),
    [42]
  )
})

test("admin can access an event without an event_staff entry", async () => {
  setup("admin", true)
  const response = await request()
  assert.equal(response.status, 200)
  assert.equal((await response.json()).count, 1)
})

test("missing event and invalid filters fail before querying data", async () => {
  setup("admin", true)
  assert.equal((await request("")).status, 400)
  assert.equal((await request("eventSlug=devfest&paymentConfirmed=invalid")).status, 400)
  assert.equal(queriedTables.length, 0)
})
