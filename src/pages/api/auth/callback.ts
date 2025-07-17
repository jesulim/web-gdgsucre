import { supabase } from "@/lib/supabase"
import type { APIRoute } from "astro"

const sevenDays = 60 * 60 * 24 * 7

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const authCode = url.searchParams.get("code")
  const next = url.searchParams.get("next") ?? "/"

  if (!authCode) {
    return new Response("No code provided", { status: 400 })
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(authCode)

  if (error) {
    return new Response(error.message, { status: 500 })
  }

  const { access_token, refresh_token, expires_in } = data.session

  cookies.set("sb-access-token", access_token, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    maxAge: expires_in,
  })

  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    maxAge: sevenDays,
  })

  return redirect(next)
}
