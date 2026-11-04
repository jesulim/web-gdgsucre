import type { APIRoute } from "astro"
import { addOrganizer } from "@/lib/services/organizersService"
import { createUserClient } from "@/lib/supabase"

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { first_name, last_name, phone_number, email, eventSlug } = body

    if (!eventSlug) {
      return new Response(JSON.stringify({ error: "eventSlug es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (!email) {
      return new Response(JSON.stringify({ error: "email es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createUserClient(cookies)
    const result = await addOrganizer(supabase, {
      email,
      eventSlug,
      first_name,
      last_name,
      phone_number,
    })

    if (!result.success) {
      if (result.reason === "already_organizer") {
        return new Response(
          JSON.stringify({
            success: false,
            result: "isOrganizer",
            message: "El usuario ya es un organizador de este evento",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        )
      }

      const status =
        result.reason === "event_not_found" || result.reason === "user_not_found" ? 404 : 500

      return new Response(
        JSON.stringify({
          error: result.message || "No se pudo agregar el organizador y perfil",
          reason: result.reason,
        }),
        {
          status,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return new Response(
      JSON.stringify({
        message: "Organizador y perfil agregados exitosamente",
        data: result.data,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: `Error al agregar organizador y perfil: ${error}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
