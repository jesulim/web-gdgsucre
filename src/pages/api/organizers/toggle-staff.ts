import { z } from "zod"
import { withAdmin } from "@/lib/auth"
import { setOrganizerStaff } from "@/lib/services/organizersService"

const staffSchema = z.object({
  id: z.coerce.number().int().positive(),
  is_staff: z.boolean(),
})

export const PATCH = withAdmin(async ({ request, auth }) => {
  try {
    const parsed = staffSchema.safeParse(await request.json())

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const success = await setOrganizerStaff(auth.supabase, parsed.data.id, parsed.data.is_staff)
    if (!success) {
      return new Response(JSON.stringify({ error: "No se pudo actualizar el staff" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ message: "Staff actualizado correctamente" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: `Error al actualizar el staff: ${error}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
