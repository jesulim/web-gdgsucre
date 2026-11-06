import type { SupabaseClient } from "@supabase/supabase-js"
import type { APIContext, APIRoute } from "astro"

import { getProfile } from "@/lib/services/profileService"
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
  body: unknown
) => Promise<number | null | undefined> | number | null | undefined

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
      const body = await context.request.clone().json()
      const eventId = await resolveEventId(auth, body)

      if (!eventId) return Response.json({ error: "No autorizado" }, { status: 403 })

      const { data: staff } = await supabase
        .from("event_staff")
        .select("id")
        .eq("user_id", profile.id)
        .eq("event_id", eventId)
        .maybeSingle()

      if (!staff) return Response.json({ error: "No autorizado" }, { status: 403 })
    }

    return handler({ ...context, auth: { supabase, profile } })
  }
}
