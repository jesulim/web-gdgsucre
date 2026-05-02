// Get a team by code using teamService

import type { APIRoute } from "astro"
import { getTeamByCode } from "@/lib/services/teamService"
import { createUserClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ url, cookies }) => {
  const code = url.searchParams.get("code")
  const event_id = Number(url.searchParams.get("event_id"))

  if (!code || !event_id || Number.isNaN(event_id)) {
    return new Response(
      JSON.stringify({ error: "No se proporcionó el código o el id del evento" }),
      { status: 400 }
    )
  }

  const supabase = await createUserClient(cookies)
  const team = await getTeamByCode(supabase, code, event_id)

  if (!team) {
    return new Response(JSON.stringify({ error: "No se encontró el equipo" }), { status: 404 })
  }

  return new Response(JSON.stringify(team), { status: 200 })
}
