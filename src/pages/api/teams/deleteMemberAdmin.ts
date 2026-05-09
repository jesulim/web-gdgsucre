import type { APIRoute } from "astro"

import { deleteMemberAsAdmin } from "@/lib/services/teamService"
import { createUserClient } from "@/lib/supabase"

const AUTH_ERRORS = [
  "No se pudo obtener el usuario",
  "Registro no encontrado o no pertenece a ningún equipo",
  "Solo el administrador o acreditador puede eliminar miembros del equipo",
  "No se puede eliminar al líder del equipo",
]

// DELETE /api/teams/deleteMemberAdmin?registrationId=527
export const DELETE: APIRoute = async ({ request, cookies }) => {
  const supabase = await createUserClient(cookies)
  const url = new URL(request.url)
  const rawRegistrationId = url.searchParams.get("registrationId")
  const target_registration_id = Number(rawRegistrationId)

  if (
    !rawRegistrationId ||
    !Number.isInteger(target_registration_id) ||
    target_registration_id <= 0
  ) {
    console.error("[DELETE] Invalid registrationId")
    return new Response("registrationId debe ser un entero positivo", { status: 400 })
  }

  try {
    // VVerificamos los roles de nuestro usuario
    const { data: userResponse, error: userError } = await supabase.auth.getUser()
    const user = userResponse?.user
    // console.log("[DELETE] User fetched:", user)

    if (userError || !user) {
      // console.error("[DELETE] Failed to fetch user", userError)
      return new Response("No se pudo obtener el usuario", { status: 403 })
    }

    // Eliminar miembro
    const result = await deleteMemberAsAdmin(supabase, target_registration_id)

    return Response.json(result)
  } catch (error: any) {
    if (AUTH_ERRORS.includes(error.message)) {
      return new Response(error.message, { status: 403 })
    }
    console.log(error)

    return new Response("Error interno del servidor", { status: 500 })
  }
}
