import { defineMiddleware } from "astro:middleware"

import { createSupabaseServerClient } from "@/lib/supabase"
import { deleteSupabaseCookies, setSupabaseCookies } from "@/lib/utils"

export const onRequest = defineMiddleware(async (context, next) => {
  const { cookies, request, url } = context
  const path = url.pathname
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host") || url.hostname

  if (host.includes("calendario.gdgsucre.com")) {
    if (path === "/") {
      return context.rewrite("/calendario")
    }
  }

  if ((host === "gdgsucre.com" || host === "www.gdgsucre.com") && path === "/calendario") {
    return context.redirect("https://calendario.gdgsucre.com", 301)
  }

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
      deleteSupabaseCookies(cookies)
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
