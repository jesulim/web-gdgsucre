import { defineMiddleware } from "astro:middleware"

import { supabase } from "@/lib/supabase"
import { setSupabaseCookies } from "@/lib/utils"

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, url } = context
  const path = url.pathname

  if (path.startsWith("/api/auth")) return next()

  const accessToken = cookies.get("sb-access-token")?.value
  const refreshToken = cookies.get("sb-refresh-token")?.value

  if (!accessToken && refreshToken) {
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

  return next()
})
