import type { APIRoute } from "astro"

import { listMembers } from "@/lib/services/teamService"
import { createUserClient } from "@/lib/supabase"

const AUTH_ERRORS = [
  "No se pudo obtener el usuario",
  "Inscripción no encontrada o no te pertenece",
  "No pertenecés a ningún equipo",
  "Solo el líder puede ver los miembros del equipo",
]

// GET /api/teams/members?registrationId=123
export const GET: APIRoute = async ({ request, cookies }) => {
  const supabase = await createUserClient(cookies)
  const url = new URL(request.url)
  const rawRegistrationId = url.searchParams.get("registrationId")
  const registration_id = Number(rawRegistrationId)

  if (!rawRegistrationId || !Number.isInteger(registration_id) || registration_id <= 0)
    return new Response("registrationId debe ser un entero positivo", { status: 400 })

  try {
    const members = await listMembers(supabase, registration_id)
    return Response.json(members)
  } catch (error: any) {
    if (AUTH_ERRORS.includes(error.message)) return new Response(error.message, { status: 403 })

    return new Response("Error interno del servidor", { status: 500 })
  }
}
