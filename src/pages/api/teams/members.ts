import type { APIRoute } from "astro"

import { listMembers } from "@/lib/services/teamService"
import { createUserClient } from "@/lib/supabase"

// GET /api/teams/members?eventId=3
export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = await createUserClient(cookies)
  const url = new URL(request.url)
  const event_id = Number(url.searchParams.get("eventId"))

  if (!event_id) return new Response("eventId es requerido", { status: 400 })

  try {
    const members = await listMembers(supabase, event_id)
    return Response.json(members)
  } catch (error: any) {
    return new Response(error.message, { status: 400 })
  }
}
