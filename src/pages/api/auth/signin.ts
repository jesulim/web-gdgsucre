import { supabase } from "@/lib/supabase"
import type { APIRoute } from "astro"

export const GET: APIRoute = async ({ request, url, redirect }) => {
  const origin = request.headers.get("origin") ?? url.origin
  const callbackRedirectUrl = new URL(`${origin}/api/auth/callback`)

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
