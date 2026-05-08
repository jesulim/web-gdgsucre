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
  // console.log("[DELETE] Request received at /api/teams/deleteMemberAdmin")

  const supabase = await createUserClient(cookies)
  const url = new URL(request.url)
  const rawRegistrationId = url.searchParams.get("registrationId")
  const target_registration_id = Number(rawRegistrationId)

  // console.log("[DELETE] Raw registrationId:", rawRegistrationId)
  // console.log("[DELETE] Parsed registrationId:", target_registration_id)

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

    // Verificamos si se admin en profiles
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()

    if (profileError || !profile?.is_admin) {
      // console.error("[DELETE] User is not an admin", profileError)
      return new Response(
        "Solo el líder, administrador o acreditador puede eliminar miembros del equipo",
        { status: 403 }
      )
    }

    // Eliminar miembro
    // console.log("[DELETE] Attempting to delete member with ID:", target_registration_id)
    const result = await deleteMemberAsAdmin(supabase, target_registration_id)
    // console.log("[DELETE] Member deleted successfully:", result)

    return Response.json(result)
  } catch (error: any) {
    // console.error("[DELETE] Error occurred:", error)

    if (AUTH_ERRORS.includes(error.message)) {
      return new Response(error.message, { status: 403 })
    }

    return new Response("Error interno del servidor", { status: 500 })
  }
}
