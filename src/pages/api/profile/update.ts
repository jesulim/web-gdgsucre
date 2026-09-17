import type { APIRoute } from "astro"
import { z } from "zod"

import { updateProfile } from "@/lib/services/profileService"
import { createUserClient } from "@/lib/supabase"

const updateProfileSchema = z.object({
  first_name: z.string().trim().min(1, "El nombre es requerido"),
  last_name: z.string().trim().min(1, "El apellido es requerido"),
  occupation: z.string().trim().optional().nullable(),
  phone_number: z.string().trim().optional().nullable(),
  share_data: z.boolean().default(false),
  display_name: z.string().trim().optional().nullable(),
})

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = await createUserClient(cookies)

  const body = await request.json()
  const parsed = updateProfileSchema.safeParse(body)
  if (!parsed.success) {
    return new Response(parsed.error.issues.map(i => i.message).join(", "), { status: 400 })
  }

  try {
    await updateProfile(supabase, parsed.data)
    return new Response("Perfil actualizado", { status: 200 })
  } catch (error) {
    return new Response(`Error al actualizar el perfil: ${error}`, { status: 500 })
  }
}
