import type { SupabaseClient } from "@supabase/supabase-js"
import type { APIContext, APIRoute } from "astro"

import { getEvent } from "@/lib/services/eventService"
import { getProfile } from "@/lib/services/profileService"
import { getRegistrationEventId } from "@/lib/services/registrationService"
import { createUserClient } from "@/lib/supabase"

export type AuthContext = APIContext & {
  auth: {
    supabase: SupabaseClient
    profile: NonNullable<Awaited<ReturnType<typeof getProfile>>>
  }
}

type AuthHandler = (context: AuthContext) => Response | Promise<Response>

type EventIdResolver = (
  auth: AuthContext["auth"],
  body: unknown,
  context: APIContext
) => Promise<number | null | undefined> | number | null | undefined

export function eventFromSlugParam(param: string): EventIdResolver {
  return async ({ supabase }, _body, { url }) => {
    const slug = url.searchParams.get(param)
    if (!slug) return null

    const event = await getEvent(supabase, slug)
    return event?.id ?? null
  }
}

export function eventFromRegistrationId(
  getId: (body: unknown, context: APIContext) => unknown
): EventIdResolver {
  return async ({ supabase }, body, context) => {
    const registrationId = Number(getId(body, context))
    if (!Number.isInteger(registrationId) || registrationId <= 0) return null

    return getRegistrationEventId(supabase, registrationId)
  }
}

export const registrationIdFromBody = (body: unknown) =>
  (body as { registrationId?: unknown } | null)?.registrationId

export async function isEventStaff(supabase: SupabaseClient, userId: string, eventId: number) {
  const { data: staff } = await supabase
    .from("event_staff")
    .select("id")
    .eq("user_id", userId)
    .eq("event_id", eventId)
    .maybeSingle()

  return !!staff
}

async function readJsonBody(request: Request) {
  if (request.method === "GET" || request.method === "HEAD") return null

  return request
    .clone()
    .json()
    .catch(() => null)
}

export function withAdmin(handler: AuthHandler): APIRoute {
  return async context => {
    const supabase = await createUserClient(context.cookies)
    const profile = await getProfile(supabase)

    if (!profile) return Response.json({ error: "No autenticado" }, { status: 401 })
    if (!profile.is_admin) return Response.json({ error: "No autorizado" }, { status: 403 })

    return handler({ ...context, auth: { supabase, profile } })
  }
}

export function withStaffOrAdmin(resolveEventId: EventIdResolver, handler: AuthHandler): APIRoute {
  return async context => {
    const supabase = await createUserClient(context.cookies)
    const profile = await getProfile(supabase)

    if (!profile) return Response.json({ error: "No autenticado" }, { status: 401 })

    if (!profile.is_admin) {
      const auth = { supabase, profile }
      const body = await readJsonBody(context.request)
      const eventId = await resolveEventId(auth, body, context)

      if (!eventId || !(await isEventStaff(supabase, profile.id, eventId))) {
        return Response.json({ error: "No autorizado" }, { status: 403 })
      }
    }

    return handler({ ...context, auth: { supabase, profile } })
  }
}
