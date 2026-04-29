import type { SupabaseClient } from "@supabase/supabase-js"
import type { APIRoute } from "astro"
import { sendRegistrationConfirmationEmail } from "@/lib/services/emailService"
import { createProfile, getProfile } from "@/lib/services/profileService"
import { submitRegistration } from "@/lib/services/registrationService"
import { createTeam } from "@/lib/services/teamService"
import { createUserClient } from "@/lib/supabase"

const sendConfirmationEmail = async (
  supabase: SupabaseClient,
  event_name: string,
  event_slug: string,
  team
) => {
  const userProfile = await getProfile(supabase)

  if (!userProfile || !("email" in userProfile)) return

  await sendRegistrationConfirmationEmail("registrationEmailBWAILeader", {
    userEmail: userProfile.email,
    userName: userProfile.first_name ?? "",
    eventName: event_name,
    eventSlug: event_slug,
    teamName: team.name,
    teamCode: team.code,
  })
}

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

  try {
    if (first_name && last_name && phone_number) {
      await createProfile(supabase, String(first_name), String(last_name), String(phone_number))
    }

    await submitRegistration(supabase, {
      event_id: String(event_id),
      event_slug: String(event_slug),
      fields,
    })

    const { team } = await createTeam(supabase, {
      event_id: Number(event_id),
      name: String(team_name),
    })

    try {
      await sendConfirmationEmail(supabase, String(event_name), String(event_slug), team)
    } catch (error) {
      console.error("Error enviando email:", error)
    }

    return new Response("Registro exitoso", { status: 200 })
  } catch (error) {
    return new Response(
      `Error al registrar y crear equipo: ${error instanceof Error ? error.message : error}`,
      {
        status: 500,
      }
    )
  }
}
