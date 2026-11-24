import { z } from "zod"
import { withAdmin } from "@/lib/auth"
import { searchUsers } from "@/lib/services/organizersService"

const searchUserSchema = z.object({
  query: z.string().trim().min(1, "Ingresa un correo o nombre").max(100),
})

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

    const result = await searchUsers(auth.supabase, parsed.data.query)

    return new Response(
      JSON.stringify({
        success: true,
        data: result,
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
