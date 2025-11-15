import type { APIRoute } from "astro"

import { getRegistrationByToken } from "@/lib/services/registrationService"
import { createUserClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ url, cookies }) => {
  const token = url.searchParams.get("token")
  const activity = url.searchParams.get("activity")

  if (!token || !activity) {
    return new Response("Token and activity are required", { status: 400 })
  }

  try {
    const supabase = await createUserClient(cookies)
    const response = await getRegistrationByToken(supabase, token, activity)

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error fetching registrations ${error}`, {
      status: 500,
    })
  }
}
