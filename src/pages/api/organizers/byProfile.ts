import type { APIRoute } from "astro"
import { addOrganizerByProfileId } from "@/lib/services/organizersService"
import { createUserClient } from "@/lib/supabase"

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { profile_id, event_id } = body
    const supabase = await createUserClient(cookies)

    if (!profile_id) {
      return new Response(JSON.stringify({ error: "profile_id es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const result = await addOrganizerByProfileId(supabase, profile_id, event_id)
    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: `Error al agregar organizador: ${error}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
