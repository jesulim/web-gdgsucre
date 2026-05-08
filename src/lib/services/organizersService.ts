import type { SupabaseClient } from "@supabase/supabase-js"
import { createProfileOfOrganizer, getProfileById } from "./profileService"
import { getRegistrationData } from "./registrationService"

export async function getOrganizers(supabase: SupabaseClient, eventSlug: string) {
  const { data, error } = await supabase
    .from("organizers")
    .select("id, profiles!inner (first_name, last_name, avatar_url), events!inner(slug)")
    .eq("events.slug", eventSlug)

  if (error) return null

  return data.map(organizer => {
    const profile = Array.isArray(organizer.profiles) ? organizer.profiles[0] : organizer.profiles
    return {
      id: organizer.id,
      image: profile?.avatar_url ?? null,
      first_name: profile?.first_name ?? "",
      last_name: profile?.last_name ?? "",
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

export async function addOrganizerByProfileId(
  supabase: SupabaseClient,
  profileId: string,
  eventSlug: string
) {
  const profile = await getProfileById(supabase, profileId)
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

  const { error } = await supabase.from("organizers").insert({
    profile_id: profileId,
    event_id: eventId,
  })

  if (error) {
    return { success: false, reason: "insert_failed", message: error.message }
  }

  return { success: true }
}

export async function addOrganizerAndProfile(
  supabase: SupabaseClient,
  first_name: string,
  last_name: string,
  phone_number: string,
  email: string,
  avatar_url: string,
  eventSlug: string
) {
  const { data, existingProfile } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, email")
    .eq("email", email)
    .maybeSingle()
    .then(({ data, error }) => {
      if (error) {
        console.error("Error checking existing profile", error)
        return { data: null, existingProfile: false }
      }
      return { data, existingProfile: !!data }
    })

  if (existingProfile) {
    return {
      success: false,
      reason: "profile already exists",
      message: "Ya existe un perfil con este email",
    }
  }
  const newProfileData = await createProfileOfOrganizer(supabase, {
    first_name,
    last_name,
    phone_number,
    email,
    avatar_url,
  })
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

  if (!newProfileData.success) {
    return { success: false, reason: "profile fallo creacion", message: newProfileData.message }
  }

  const { error } = await supabase.from("organizers").insert({
    profile_id: newProfileData.data[0].id,
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
