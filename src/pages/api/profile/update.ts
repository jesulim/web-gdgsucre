import type { APIRoute } from "astro"
import { z } from "zod"

import { getProfile, updateProfile } from "@/lib/services/profileService"
import { createUserClient } from "@/lib/supabase"

const updateProfileSchema = z.object({
  first_name: z.string().trim().min(1, "El nombre es requerido"),
  last_name: z.string().trim().min(1, "El apellido es requerido"),
  occupation: z.string().trim().optional().nullable(),
  phone_number: z.string().trim().optional().nullable(),
  avatar_url: z.string().trim().optional().nullable(),
})

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = await createUserClient(cookies)

  const profile = await getProfile(supabase)
  if (!profile) {
    return new Response("No autorizado", { status: 401 })
  }

  const formData = await request.formData()
  const raw = {
    first_name: formData.get("first_name"),
    last_name: formData.get("last_name"),
    occupation: formData.get("occupation") || null,
    phone_number: formData.get("phone_number") || null,
    avatar_url: formData.get("avatar_url") || null,
  }

  const parsed = updateProfileSchema.safeParse(raw)
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
