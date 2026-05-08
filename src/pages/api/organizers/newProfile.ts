import type { APIRoute } from "astro"
import { addOrganizerAndProfile } from "@/lib/services/organizersService"
import { createUserClient } from "@/lib/supabase"

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { first_name, last_name, phone_number, email, avatar_url, eventSlug } = body

    if (!eventSlug) {
      return new Response(JSON.stringify({ error: "eventSlug es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createUserClient(cookies)
    const result = await addOrganizerAndProfile(
      supabase,
      first_name,
      last_name,
      phone_number,
      email,
      avatar_url,
      eventSlug
    )
    if (!result.success) {
      const errorMessage =
        result.reason === "event_not_found"
          ? "El evento no fue encontrado"
          : result.message || "No se pudo agregar el organizador y perfil"

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: result.reason === "event_not_found" ? 404 : 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(
      JSON.stringify({ message: "Organizador y perfil agregados exitosamente" }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: `Error al agregar organizador y perfil: ${error}` }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
