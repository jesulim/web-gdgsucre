import type { APIRoute } from "astro"

import { getUpcomingCalendarEvents } from "@/lib/services/calendarEventService"
import { createUserClient } from "@/lib/supabase"

const DEFAULT_LIMIT = 4
const MAX_LIMIT = 4

export const GET: APIRoute = async ({ url, cookies }) => {
  const limitParam = url.searchParams.get("limit")
  let limit = DEFAULT_LIMIT

  if (limitParam) {
    const parsedLimit = Number.parseInt(limitParam, 10)
    if (Number.isNaN(parsedLimit) || parsedLimit <= 0) {
      return new Response(
        JSON.stringify({ error: "El parámetro 'limit' debe ser un número positivo" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }
    limit = Math.min(parsedLimit, MAX_LIMIT)
  }

  try {
    const supabase = await createUserClient(cookies)
    const calendarEvents = await getUpcomingCalendarEvents(supabase, limit)

    return new Response(JSON.stringify(calendarEvents), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error fetching upcoming calendar events ${error}`, {
      status: 500,
    })
  }
}
