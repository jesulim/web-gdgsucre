import type { SupabaseClient } from "@supabase/supabase-js"
import type { APIContext, APIRoute } from "astro"

import { getProfile } from "@/lib/services/profileService"
import { createUserClient } from "@/lib/supabase"

type Profile = NonNullable<Awaited<ReturnType<typeof getProfile>>>

export type AuthContext = APIContext & {
  auth: {
    supabase: SupabaseClient
    profile: Profile
  }
}

type AuthHandler = (context: AuthContext) => Response | Promise<Response>

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

async function getAuthContext(context: APIContext): Promise<AuthContext | null> {
  const supabase = await createUserClient(context.cookies)
  const profile = await getProfile(supabase)

  if (!profile) return null

  return { ...context, auth: { supabase, profile } }
}

export function withAuth(handler: AuthHandler): APIRoute {
  return async context => {
    const authContext = await getAuthContext(context)

    if (!authContext) return json({ error: "No autenticado" }, 401)

    return handler(authContext)
  }
}

export function withAdmin(handler: AuthHandler): APIRoute {
  return withAuth(context => {
    if (!context.auth.profile.is_admin) return json({ error: "No autorizado" }, 403)

    return handler(context)
  })
}
