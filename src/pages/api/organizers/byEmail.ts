import type { APIRoute } from "astro"
import { uploadOrganizerByGmail } from "@/lib/services/organizersService"
import { createUserClient } from "@/lib/supabase"

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { gmail, event_slug } = body
    const supabase = await createUserClient(cookies)

    if (!gmail) {
      return new Response(JSON.stringify({ error: "gmail es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const result = await uploadOrganizerByGmail(supabase, gmail, event_slug)
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
