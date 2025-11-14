import type { APIRoute } from "astro"

import { getRegistrationByToken } from "@/lib/services/registrationService"
import { createUserClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ url, cookies }) => {
  const token = url.searchParams.get("token")
  if (!token) {
    return new Response("Token is required", { status: 400 })
  }

  try {
    const supabase = await createUserClient(cookies)
    const registrations = await getRegistrationByToken(supabase, token)

    return new Response(JSON.stringify(registrations), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error fetching registrations ${error}`, {
      status: 500,
    })
  }
}
