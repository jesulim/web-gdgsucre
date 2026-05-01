import type { APIRoute } from "astro"

import { listMembers } from "@/lib/services/teamService"
import { createUserClient } from "@/lib/supabase"

const AUTH_ERRORS = [
  "No se pudo obtener el usuario",
  "No eres líder de este equipo",
  "Esta inscripción no te pertenece",
]

// GET /api/teams/members?teamId=1&registrationId=123
export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = await createUserClient(cookies)
  const url = new URL(request.url)
  const rawTeamId = url.searchParams.get("teamId")
  const rawRegistrationId = url.searchParams.get("registrationId")

  const team_id = Number(rawTeamId)
  const registration_id = Number(rawRegistrationId)

  if (!rawTeamId || !Number.isInteger(team_id) || team_id <= 0)
    return new Response("teamId debe ser un entero positivo", { status: 400 })
  if (!rawRegistrationId || !Number.isInteger(registration_id) || registration_id <= 0)
    return new Response("registrationId debe ser un entero positivo", { status: 400 })

  try {
    const members = await listMembers(supabase, team_id, registration_id)
    return Response.json(members)
  } catch (error: any) {
    if (AUTH_ERRORS.includes(error.message)) return new Response(error.message, { status: 403 })

    return new Response("Error interno del servidor", { status: 500 })
  }
}
