import type { APIRoute } from "astro"

import { deleteMember } from "@/lib/services/teamService"
import { createUserClient } from "@/lib/supabase"

// DELETE /api/teams/deleteMember?registrationId=527
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const supabase = await createUserClient(cookies)
  const url = new URL(request.url)
  const target_registration_id = Number(url.searchParams.get("registrationId"))

  if (!target_registration_id) {
    return new Response("registrationId es requerido", { status: 400 })
  }

  try {
    const result = await deleteMember(supabase, target_registration_id)
    return Response.json(result)
  } catch (error: any) {
    return new Response(error.message, { status: 400 })
  }
}
