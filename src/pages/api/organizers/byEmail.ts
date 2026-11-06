import { z } from "zod"
import { withAdmin } from "@/lib/auth"
import { searchUserByEmail } from "@/lib/services/organizersService"

const emailField = z.string().trim().toLowerCase().email("El correo electrónico no es válido")

const searchUserSchema = z
  .object({ email: emailField.optional(), gmail: emailField.optional() })
  .transform(data => data.email ?? data.gmail)

export const POST = withAdmin(async ({ request, auth }) => {
  try {
    const parsed = searchUserSchema.safeParse(await request.json())

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message ?? "Correo inválido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    if (!parsed.data) {
      return new Response(JSON.stringify({ error: "El correo electrónico es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const result = await searchUserByEmail(auth.supabase, parsed.data)

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
})
