import type { APIRoute } from "astro"
import { createSupabaseServerClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ request, url, cookies, redirect }) => {
  const supabase = createSupabaseServerClient({ request, cookies })

  const rawHost = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? ""
  const host = rawHost.split(",")[0].trim()

  const rawProtocol = request.headers.get("x-forwarded-proto") ?? ""
  const protocol =
    rawProtocol.split(",")[0].trim() || (host.includes("localhost") ? "http" : "https")

  const origin = host ? `${protocol}://${host}` : url.origin

  const callbackRedirectUrl = new URL(`${origin}/api/auth/callback`)

  const next = url.searchParams?.get("next")
  if (next) {
    callbackRedirectUrl.searchParams.set("next", next)
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackRedirectUrl.toString(),
      queryParams: {
        prompt: "select_account",
      },
    },
  })

  if (error) {
    console.error(`Error signing in: ${error.message}`)
    return new Response(error.message, { status: 500 })
  }

  return redirect(data.url)
}
