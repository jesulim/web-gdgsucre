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

  const { access_token, refresh_token, expires_at } = data.session

  cookies.set("sb-access-token", access_token, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    maxAge: sevenDays,
  })

  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    maxAge: Number(expires_at) - Math.floor(Date.now() / 1000),
  })

  return redirect(next)
}
