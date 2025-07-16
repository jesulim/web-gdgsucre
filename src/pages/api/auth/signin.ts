import { supabase } from "@/lib/supabase"
import type { APIRoute } from "astro"

export const POST: APIRoute = async ({ request, url, redirect }) => {
  const origin = request.headers.get("origin") ?? url.origin
  const callbackRedirectUrl = new URL(`${origin}/api/auth/callback`)

  const next = url.searchParams?.get("next")
  if (next) {
    callbackRedirectUrl.searchParams.set("next", next)
  }

  console.info(`callbackRedirectUrl: ${callbackRedirectUrl}`)

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

  console.info(`Redirecting to data.url ${data.url}`)
  return redirect(data.url)
}
