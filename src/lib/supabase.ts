import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { APIContext } from "astro"

export const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY,
  {
    auth: { flowType: "pkce", persistSession: false },
  }
)

export const createUserClient = async (cookies: APIContext["cookies"]): Promise<SupabaseClient> => {
  const accessToken = cookies.get("sb-access-token")?.value

  const client = createClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_ANON_KEY, {
    global: {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    },
    auth: { persistSession: false },
  })

  return client
}
