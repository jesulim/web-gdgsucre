import { supabase } from "@/lib/supabase"
import type { APIRoute } from "astro"

export const POST: APIRoute = async ({ request, redirect }) => {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin

  const callbackRedirectUrl = new URL(`${origin}/api/auth/callback`)

  const redirectTo = requestUrl.searchParams?.get("redirectTo")
  if (redirectTo) {
    callbackRedirectUrl.searchParams.set("redirectTo", redirectTo)
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callbackRedirectUrl.toString(),
    },
  })

  if (error) {
    console.error(error)
    return new Response(error.message, { status: 500 })
  }

  return redirect(data.url)
}
