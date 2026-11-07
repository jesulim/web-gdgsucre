import { withAdmin } from "@/lib/auth"
import { getRandomRegistrations } from "@/lib/services/registrationService"

export const GET = withAdmin(async ({ url, auth }) => {
  const limitParam = url.searchParams.get("limit")
  const roleParam = url.searchParams.get("role")
  let limit: number | null = null

  if (limitParam && limitParam !== "null") {
    const parsedLimit = Number.parseInt(limitParam, 10)
    if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
      return new Response("El parámetro 'limit' debe ser un número positivo", { status: 400 })
    }
    limit = Math.min(parsedLimit, 1000) // Aumentado el máximo a 1000
  }

  if (roleParam && roleParam !== "Participante" && roleParam !== "Organizer") {
    return new Response("El parámetro 'role' debe ser 'Participante' o 'Organizer'", {
      status: 400,
    })
  }

  try {
    const registrations = await getRandomRegistrations(auth.supabase, limit, roleParam)

    return new Response(
      JSON.stringify({
        data: registrations,
        count: registrations.length,
        requested_limit: limit,
        requested_role: roleParam,
      }),
      {
        headers: { "Content-Type": "application/json" },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Error al obtener registros: ${error}`,
        data: null,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
})
