import type { APIRoute } from "astro"
import { z } from "zod"
import { withStaffOrAdmin } from "@/lib/auth"
import { toggleOrganizerByRegistration } from "@/lib/services/organizersService"

const toggleSchema = z.object({
  registrationId: z.coerce.number().int().positive(),
})

const handle = (action: "add" | "remove"): APIRoute =>
  withStaffOrAdmin(
    async ({ supabase }, body) => {
      const parsed = toggleSchema.safeParse(body)
      if (!parsed.success) return null

      const { data } = await supabase
        .from("registrations")
        .select("event_id")
        .eq("id", parsed.data.registrationId)
        .maybeSingle()

      return data?.event_id ?? null
    },
    async ({ request, auth }) => {
      try {
        const parsed = toggleSchema.safeParse(await request.json())

        if (!parsed.success) {
          return Response.json({ error: "registrationId es requerido" }, { status: 400 })
        }

        const result = await toggleOrganizerByRegistration(
          auth.supabase,
          parsed.data.registrationId,
          action
        )

        if (!result.success) {
          return Response.json(
            { error: result.message || "No se pudo actualizar el rol" },
            { status: 500 }
          )
        }

        return Response.json({ message: "Rol actualizado" }, { status: 200 })
      } catch (error) {
        return Response.json({ error: `Error al actualizar el rol: ${error}` }, { status: 500 })
      }
    }
  )

export const POST = handle("add")
export const DELETE = handle("remove")
