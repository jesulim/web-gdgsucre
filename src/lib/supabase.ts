import { createServerClient } from "@supabase/ssr"
import { createClient, type SupabaseClient } from "@supabase/supabase-js"
import type { APIContext, AstroCookies } from "astro"

export const supabase = createClient(
  import.meta.env.SUPABASE_URL,
  import.meta.env.SUPABASE_ANON_KEY,
  {
    auth: { flowType: "pkce", persistSession: false },
  }
)

export function createSupabaseServerClient(context: { request: Request; cookies: AstroCookies }) {
  return createServerClient(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        const header = context.request.headers.get("cookie") ?? ""
        return header
          .split(";")
          .filter(Boolean)
          .map(cookie => {
            const [name, ...value] = cookie.trim().split("=")
            return { name, value: value.join("=") }
          })
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          context.cookies.set(name, value, {
            ...options,
            path: options?.path ?? "/",
          })
        }
      },
    },
  })
}

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
