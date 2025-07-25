import type { APIRoute } from "astro"

import { getRegistrationsByEvent } from "@/lib/services/registrationService"
import { createUserClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ url, cookies }) => {
  const slug = url.searchParams.get("slug")
  if (!slug) {
    return new Response("Event slug is required", { status: 400 })
  }

  const role = url.searchParams.get("role")

  try {
    const supabase = await createUserClient(cookies)
    const registrations = await getRegistrationsByEvent(supabase, slug, role)

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
