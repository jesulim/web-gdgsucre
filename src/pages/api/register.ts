import type { APIRoute } from "astro"

import { createProfile } from "@/lib/services/profileService"
import { submitRegistration } from "@/lib/services/registrationService"

export const POST: APIRoute = async ({ request }) => {
  const formData = await request.formData()

  const { event_id, event_slug, first_name, last_name, ...fields } =
    Object.fromEntries(formData)
  if (first_name && last_name) {
    try {
      await createProfile(String(first_name), String(last_name))
    } catch (error) {
      return new Response(`Error al crear el perfil: ${error}`, { status: 500 })
    }
  }

  try {
    await submitRegistration({ event_id, event_slug, fields })
    return new Response("Registro exitoso", { status: 200 })
  } catch (error) {
    return new Response(`Error al registrar: ${error}`, { status: 500 })
  }
}
