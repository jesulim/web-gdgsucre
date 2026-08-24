import type { SupabaseClient } from "@supabase/supabase-js"
import type { APIRoute } from "astro"

import { createProfile, getProfile } from "@/lib/services/profileService"
import { submitRegistration } from "@/lib/services/registrationService"
import { createSupabaseServerClient } from "@/lib/supabase"

const sendEmail = async (supabase: SupabaseClient, event_name: string, event_slug: string) => {
  const userProfile = await getProfile(supabase)

  if (!userProfile || !("email" in userProfile)) {
    console.warn("No se pudo obtener el email del usuario")
    return
  }

  supabase.functions.invoke("send-email", {
    body: {
      type: "registration",
      data: {
        userEmail: userProfile.email,
        userName: userProfile.first_name ?? "",
        eventName: event_name,
        eventSlug: event_slug,
      },
    },
  })
}

const sendEmail = async (supabase: SupabaseClient, event_name: string, event_slug: string) => {
  const userProfile = await getProfile(supabase)

  if (!userProfile || !("email" in userProfile)) {
    console.warn("No se pudo obtener el email del usuario")
    return
  }

  supabase.functions.invoke("send-email", {
    body: {
      type: "registration",
      data: {
        userEmail: userProfile.email,
        userName: userProfile.first_name ?? "",
        eventName: event_name,
        eventSlug: event_slug,
      },
    },
  })
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = createSupabaseServerClient({ request, cookies })
  const formData = await request.formData()

  const { event_id, event_slug, event_name, first_name, last_name, phone_number, ...fields } =
    Object.fromEntries(formData)

  if (first_name && last_name && phone_number) {
    try {
      await createProfile(supabase, String(first_name), String(last_name), String(phone_number))
    } catch (error) {
      return new Response(`Error al crear el perfil: ${error}`, { status: 500 })
    }
  }

  try {
    await submitRegistration(supabase, { event_id, event_slug, fields })
    sendEmail(supabase, String(event_name), String(event_slug))

    return new Response("Registro exitoso", { status: 200 })
  } catch (error) {
    return new Response(`Error al registrar: ${error}`, { status: 500 })
  }
}
