import { supabase } from "@/lib/supabase"
import type { APIRoute } from "astro"

export const POST: APIRoute = async ({ request, redirect }) => {
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${origin}/api/auth/callback`,
    },
  })

  if (error) {
    console.error(error)
    return new Response(error.message, { status: 500 })
  }
  console.log("Logged in!", data.url)
  return redirect(data.url)
}
