import type { APIRoute } from "astro"
import { searchUserByEmail } from "@/lib/services/organizersService"
import { createUserClient } from "@/lib/supabase"

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const email = body.email || body.gmail

    if (!email) {
      return new Response(JSON.stringify({ error: "El correo electrónico es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createUserClient(cookies)
    const result = await searchUserByEmail(supabase, email)

    if (!result) {
      return new Response(
        JSON.stringify({
          success: false,
          reason: "user_not_found",
          error: "Usuario no registrado en la plataforma. Debe registrarse primero.",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return new Response(
      JSON.stringify({
        success: true,
        source: result.source,
        data: result.user,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: `Error al buscar usuario: ${error}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
