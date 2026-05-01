import type { APIRoute } from "astro"

import { deleteMember } from "@/lib/services/teamService"
import { createUserClient } from "@/lib/supabase"

const AUTH_ERRORS = [
  "No se pudo obtener el usuario",
  "Registro no encontrado o no pertenece a ningún equipo",
  "Solo el líder puede eliminar miembros del equipo",
  "No se puede eliminar al líder del equipo",
]

// DELETE /api/teams/deleteMember?registrationId=527
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const supabase = await createUserClient(cookies)
  const url = new URL(request.url)
  const rawRegistrationId = url.searchParams.get("registrationId")
  const target_registration_id = Number(rawRegistrationId)

  if (
    !rawRegistrationId ||
    !Number.isInteger(target_registration_id) ||
    target_registration_id <= 0
  )
    return new Response("registrationId debe ser un entero positivo", { status: 400 })

  try {
    const result = await deleteMember(supabase, target_registration_id)
    return Response.json(result)
  } catch (error: any) {
    if (AUTH_ERRORS.includes(error.message)) return new Response(error.message, { status: 403 })

    return new Response("Error interno del servidor", { status: 500 })
  }
}
