import type { SupabaseClient } from "@supabase/supabase-js"
import { createProfileOfOrganizer, getProfileByEmail } from "./profileService"
import { getRegistrationData } from "./registrationService"

export async function getOrganizers(supabase: SupabaseClient, eventSlug: string) {
  const { data, error } = await supabase
    .from("organizers")
    .select(
      "id, profiles!inner (first_name, last_name, avatar_url, email, phone_number), events!inner(slug)"
    )
    .eq("events.slug", eventSlug)

  if (error) return null

  return data.map(organizer => {
    const profile = Array.isArray(organizer.profiles) ? organizer.profiles[0] : organizer.profiles
    return {
      id: organizer.id,
      image: profile?.avatar_url ?? null,
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
      email: profile?.email ?? "",
      phone_number: profile?.phone_number ?? "",
    }
  })
}

export async function addOrganizer(supabase: SupabaseClient, registrationId: string) {
  const registrationData = await getRegistrationData(supabase, registrationId)

  if (!registrationData) {
    return { success: false, reason: "registration_not_found" }
  }

  const { error } = await supabase.from("organizers").insert({
    profile_id: registrationData.profile_id,
    event_id: registrationData.event_id,
  })

  if (error) {
    return { success: false, reason: "insert_failed", message: error.message }
  }

  return { success: true }
}

export async function uploadOrganizerByGmail(
  supabase: SupabaseClient,
  gmail: string,
  eventSlug: string
) {
  const profile = await getProfileByEmail(supabase, gmail)
  if (!profile) {
    return { success: false, reason: "profile no encontrado" }
  }
  const eventId = await supabase
    .from("events")
    .select("id")
    .eq("slug", eventSlug)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) {
        console.error("Error fetching event ID", error)
        return null
      }
      return data?.id ?? null
    })
  if (!eventId) {
    return { success: false, reason: "event_not_found" }
  }
  console.log("Data del profile encontrado", profile)
  return { success: true, data: profile }
}

export async function addOrganizerAndProfile(
  supabase: SupabaseClient,
  first_name: string,
  last_name: string,
  phone_number: string,
  email: string,
  eventSlug: string
) {
  let profileId: string
  const { data: existingProfile, error: checkError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  if (checkError) {
    console.error("Error checking existing profile", checkError)
    return { success: false, reason: "database_error", message: checkError.message }
  }
  if (existingProfile) {
    console.log("Se encontrl el pefil en profile")
    profileId = existingProfile.id
  } else {
    console.log("No se encontro perfil, creando nuevo perfil")
    try {
      const createProfileResult = await createProfileOfOrganizer(supabase, {
        first_name,
        last_name,
        phone_number,
        email,
      })
      if (!createProfileResult.success || !createProfileResult.data) {
        return {
          success: false,
          reason: "fallo la creacion de profiles",
          message: createProfileResult.message,
        }
      }
      profileId = createProfileResult.data[0].id
    } catch (error) {
      console.error("Error creating profile", error)
      return {
        success: false,
        reason: "database_error",
        message: "Error al crear el perfil",
      }
    }
  }

  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("slug", eventSlug)
    .maybeSingle()

  if (eventError || !eventData) {
    console.error("Error fetching event ID", eventError)
    return { success: false, reason: "event_not_found" }
  }

  const eventId = eventData.id

  if (!eventId) {
    return { success: false, reason: "event_not_found" }
  }
  const { error } = await supabase.from("organizers").insert({
    profile_id: profileId,
    event_id: eventId,
  })

  if (error) {
    return { success: false, reason: "insert_failed of organizers", message: error.message }
  }

  return { success: true }
}

export async function removeOrganizer(supabase: SupabaseClient, registrationId: string) {
  const registrationData = await getRegistrationData(supabase, registrationId)

  if (!registrationData) {
    return false
  }

  const { error } = await supabase
    .from("organizers")
    .delete()
    .eq("profile_id", registrationData.profile_id)
    .eq("event_id", registrationData.event_id)

  return !error
}
