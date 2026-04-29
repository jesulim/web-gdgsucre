import { defineMiddleware } from "astro:middleware"

import { createSupabaseServerClient } from "@/lib/supabase"
import { setSupabaseCookies } from "@/lib/utils"

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, request, url } = context
  const path = url.pathname

  if (path.startsWith("/api/auth")) return next()

  const accessToken = cookies.get("sb-access-token")?.value
  const refreshToken = cookies.get("sb-refresh-token")?.value

  if (!accessToken && refreshToken) {
    const supabase = createSupabaseServerClient({ request, cookies })
    const { data } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    })

    if (data?.session) {
      const { access_token, refresh_token, expires_in } = data.session
      setSupabaseCookies(cookies, access_token, refresh_token, expires_in)
    } else {
      cookies.delete("sb-access-token")
      cookies.delete("sb-refresh-token")
    }
  }

  // Registration pages need authentication
  if (path.startsWith("/registro")) {
    const sessionToken = cookies.get("sb-access-token")?.value
    if (!sessionToken) {
      return context.redirect(
        `/api/auth/signin?next=${encodeURIComponent(url.pathname + url.search)}`
      )
    }
  }

  return next()
})
