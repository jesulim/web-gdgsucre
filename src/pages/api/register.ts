import type { APIRoute } from "astro"

import { sendRegistrationConfirmationEmail } from "@/lib/services/emailService"
import { createProfile, getProfile } from "@/lib/services/profileService"
import { submitRegistration } from "@/lib/services/registrationService"
import { createUserClient } from "@/lib/supabase"

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = await createUserClient(cookies)
  const formData = await request.formData()
  let profile = null

  const {
    event_id,
    event_slug,
    event_name,
    first_name,
    last_name,
    phone_number,
    ...fields
  } = Object.fromEntries(formData)
  if (first_name && last_name && phone_number) {
    try {
      profile = await createProfile(
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
    if (!profile) profile = await getProfile(supabase)

    sendRegistrationConfirmationEmail({
      userEmail: profile?.email,
      userName: profile?.first_name,
      eventName: String(event_name),
      eventSlug: String(event_slug),
    })

    return new Response("Registro exitoso", { status: 200 })
  } catch (error) {
    return new Response(`Error al registrar: ${error}`, { status: 500 })
  }
}
