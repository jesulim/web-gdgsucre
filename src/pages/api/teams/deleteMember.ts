import type { APIRoute } from "astro"

import { deleteMember } from "@/lib/services/teamService"
import { createUserClient } from "@/lib/supabase"

// DELETE /api/teams/deleteMember?registrationId=527&eventId=3
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const supabase = await createUserClient(cookies)
  const url = new URL(request.url)
  const rawRegistrationId = url.searchParams.get("registrationId")
  const rawEventId = url.searchParams.get("eventId")

  const target_registration_id = Number(rawRegistrationId)
  const event_id = Number(rawEventId)

  if (
    !rawRegistrationId ||
    !Number.isInteger(target_registration_id) ||
    target_registration_id <= 0
  )
    return new Response("registrationId debe ser un entero positivo", { status: 400 })
  if (!rawEventId || !Number.isInteger(event_id) || event_id <= 0)
    return new Response("eventId debe ser un entero positivo", { status: 400 })

  try {
    const result = await deleteMember(supabase, target_registration_id, event_id)
    return Response.json(result)
  } catch (error: any) {
    return new Response(error.message, { status: 400 })
  }
}
