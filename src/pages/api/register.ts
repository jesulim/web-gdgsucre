import type { APIRoute } from "astro"

import { createProfile } from "@/lib/services/profileService"
import { submitRegistration } from "@/lib/services/registrationService"
import { createUserClient } from "@/lib/supabase"

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = await createUserClient(cookies)
  const formData = await request.formData()

  const {
    event_id,
    event_slug,
    first_name,
    last_name,
    phone_number,
    ...fields
  } = Object.fromEntries(formData)
  if (first_name && last_name && phone_number) {
    try {
      await createProfile(
        supabase,
        String(first_name),
        String(last_name),
        String(phone_number)
      )
    } catch (error) {
      return new Response(`Error al crear el perfil: ${error}`, { status: 500 })
    }
  }

  try {
    await submitRegistration(supabase, { event_id, event_slug, fields })
    return new Response("Registro exitoso", { status: 200 })
  } catch (error) {
    return new Response(`Error al registrar: ${error}`, { status: 500 })
  }
}
