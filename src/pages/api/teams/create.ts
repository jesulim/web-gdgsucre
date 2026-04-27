import type { APIRoute } from "astro"

import { sendRegistrationConfirmationEmail } from "@/lib/services/emailService"
import { createProfile, getProfile } from "@/lib/services/profileService"
import { getRegistrationByUser, submitRegistration } from "@/lib/services/registrationService"
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
    team_name,
    ...fields
  } = Object.fromEntries(formData)

  if (first_name && last_name && phone_number) {
    try {
      await createProfile(supabase, String(first_name), String(last_name), String(phone_number))
    } catch (error) {
      return new Response(`Error al crear el perfil: ${error}`, {
        status: 500,
      })
    }
  }

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return new Response("No autorizado", { status: 401 })

    const existingRegistration = await getRegistrationByUser(supabase, user.id, String(event_slug))
    let isNewRegistration = false

    if (!existingRegistration) {
      await submitRegistration(supabase, {
        event_id: String(event_id),
        event_slug: String(event_slug),
        fields,
      })
      isNewRegistration = true
    }

    // TODO: replace with createTeam func
    console.log(`Creando team: ${team_name} para el evento: ${event_id}`)

    if (isNewRegistration) {
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
    }

    return new Response("Registro exitoso", { status: 200 })
  } catch (error: any) {
    return new Response(`Error al registrar y crear equipo: ${error.message || error}`, {
      status: 500,
    })
  }
}
