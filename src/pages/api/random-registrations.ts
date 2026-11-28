import type { APIRoute } from "astro"
import { eventFromSlugParam, withStaffOrAdmin } from "@/lib/auth"
import { getRaffleParticipants, RaffleConfigurationError } from "@/lib/services/raffleService"
import { RaffleFiltersSchema } from "@/lib/validators/raffle"

const authorizedGet = withStaffOrAdmin(eventFromSlugParam("eventSlug"), async ({ url, auth }) => {
  const filters = RaffleFiltersSchema.parse(Object.fromEntries(url.searchParams))
  try {
    const participants = await getRaffleParticipants(auth.supabase, filters)
    if (!participants) return Response.json({ error: "Evento no encontrado" }, { status: 404 })
    return Response.json(
      { data: participants, count: participants.length },
      {
        headers: { "Cache-Control": "private, no-store" },
      }
    )
  } catch (error) {
    console.error("[raffle] Participant query failed", {
      message: error instanceof Error ? error.message : "Unknown error",
      code: error instanceof Error ? error.cause : undefined,
    })
    return Response.json(
      {
        error:
          error instanceof RaffleConfigurationError
            ? error.message
            : "No se pudieron cargar los participantes. Intenta nuevamente.",
      },
      {
        status: error instanceof RaffleConfigurationError ? 503 : 500,
        headers: { "Cache-Control": "private, no-store" },
      }
    )
  }
})

export const GET: APIRoute = context => {
  const parsed = RaffleFiltersSchema.safeParse(Object.fromEntries(context.url.searchParams))
  if (!parsed.success) {
    return Response.json({ error: "Selecciona un evento y filtros válidos." }, { status: 400 })
  }
  return authorizedGet(context)
}
