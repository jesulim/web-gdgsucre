import type { APIRoute } from "astro"
import { getAllEvents } from "@/lib/services/eventService"
import { createUserClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ cookies }) => {
  try {
    const supabase = await createUserClient(cookies)
    const events = await getAllEvents(supabase)

    return new Response(JSON.stringify(events), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error fetching events ${error}`, {
      status: 500,
    })
  }
}
