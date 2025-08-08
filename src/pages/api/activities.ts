import type { APIRoute } from "astro"

import { getRegistrationsWithActivities } from "@/lib/services/registrationService"
import { createUserClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ url, cookies }) => {
  const slug = url.searchParams.get("slug")
  if (!slug) {
    return new Response("Event slug is required", { status: 400 })
  }

  try {
    const supabase = await createUserClient(cookies)
    const registrations = await getRegistrationsWithActivities(supabase, slug)

    return new Response(JSON.stringify(registrations), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ details: `Error fetching registrations: ${error}` }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
}
