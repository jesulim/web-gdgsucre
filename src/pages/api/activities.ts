import type { APIRoute } from "astro"

import {
  getRegistrationsWithActivities,
  updateRegistrationActivity,
} from "@/lib/services/registrationService"
import { createUserClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ url, cookies }) => {
  const slug = url.searchParams.get("slug")
  const role = url.searchParams.get("role") || "Todos"
  const packageName = url.searchParams.get("package")

  if (!slug) {
    return new Response("Event slug is required", { status: 400 })
  }

  try {
    const supabase = await createUserClient(cookies)
    const registrations = await getRegistrationsWithActivities(supabase, slug, role, packageName)

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

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { id, field, value } = body

    if (!id || !field || typeof value !== "boolean") {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createUserClient(cookies)
    const result = await updateRegistrationActivity(supabase, id, field, value)

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Error updating activity: ${error instanceof Error ? error.message : error}`,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      }
    )
  }
}
