import type { APIRoute } from "astro"
import { supabase } from "@/lib/supabase"

export const GET: APIRoute = async ({ request, url, redirect }) => {
  const origin = request.headers.get("Referer") ?? url.origin
  const callbackRedirectUrl = new URL("api/auth/callback", origin)

  const next = url.searchParams?.get("next")
  if (next) {
    callbackRedirectUrl.searchParams.set("next", next)
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackRedirectUrl.toString(),
    },
  })

  if (error) {
    console.error(`Error signing in: ${error.message}`)
    return new Response(error.message, { status: 500 })
  }

  return redirect(data.url)
}
