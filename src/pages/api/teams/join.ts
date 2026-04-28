import type { APIRoute } from "astro"

import { sendRegistrationConfirmationEmail } from "@/lib/services/emailService"
import { createProfile, getProfile } from "@/lib/services/profileService"
import { getRegistrationByUser, submitRegistration } from "@/lib/services/registrationService"
import { joinTeam } from "@/lib/services/teamService"
import { createUserClient } from "@/lib/supabase"

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = await createUserClient(cookies)
  const formData = await request.formData()

  const {
    event_id,
    event_slug,
    event_name,
    first_name,
    last_name,
    phone_number,
    team_code,
    ...fields
  } = Object.fromEntries(formData)

  // TODO: validate team code exists before registering the user, block if invalid
  console.log(`team code: ${team_code} para el evento: ${event_id}`)

  try {
    if (first_name && last_name && phone_number) {
      await createProfile(supabase, String(first_name), String(last_name), String(phone_number))
    }

    await submitRegistration(supabase, {
      event_id: String(event_id),
      event_slug: String(event_slug),
      fields,
    })

    joinTeam(supabase, {
      code: String(team_code),
      event_id: Number(event_id),
    })

    const userProfile = await getProfile(supabase)

    if (userProfile && "email" in userProfile) {
      await sendRegistrationConfirmationEmail({
        userEmail: userProfile.email,
        userName: userProfile.first_name ?? "",
        eventName: String(event_name),
        eventSlug: String(event_slug),
      })
    } else {
      console.error("No se pudo obtener el perfil o el email del usuario para enviar el correo.")
    }

    return new Response("Registro exitoso", { status: 200 })
  } catch (error) {
    return new Response(
      `Error al registrar y unirse al equipo: ${error instanceof Error ? error.message : error}`,
      {
        status: 500,
      }
    )
  }
}
