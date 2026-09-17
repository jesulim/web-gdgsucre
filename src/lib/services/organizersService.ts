import type { SupabaseClient } from "@supabase/supabase-js"
import { getProfileByEmail } from "./profileService"

const capitalizeName = (name: string) => {
  if (!name) return ""
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

async function getOrganizerBadgeId(supabase: SupabaseClient, eventName: string) {
  const { data: badge, error: badgeError } = await supabase
    .from("badges")
    .select("id")
    .eq("name", `Organizador ${eventName}`)
    .maybeSingle()

  if (badgeError || !badge) {
    throw new Error(`Error fetching badge: ${badgeError?.message}`)
  }

  return badge.id
}

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
      first_name: capitalizeName(profile?.first_name ?? ""),
      last_name: capitalizeName(profile?.last_name ?? ""),
    }
  })
}

async function issueOrganizerBadge(supabase: SupabaseClient, user_id: string, eventName: string) {
  const badgeId = await getOrganizerBadgeId(supabase, eventName)

  const { error: userBadgeError } = await supabase
    .from("user_badges")
    .upsert({ badge_id: badgeId, user_id: user_id }, { onConflict: "badge_id,user_id" })

  if (userBadgeError) {
    throw new Error(`Error adding badge: ${userBadgeError.message}`)
  }
}

export async function addOrganizer(supabase: SupabaseClient, registrationId: string) {
  const { data: registration, error } = await supabase
    .from("registrations")
    .select("user_id, event_id, events(name)")
    .eq("id", registrationId)
    .single()

  if (error || !registration) {
    return { success: false, reason: "registration_not_found", message: error?.message }
  }

  const { error: organizerError } = await supabase.from("organizers").upsert(
    {
      profile_id: registration.user_id,
      event_id: registration.event_id,
    },
    { onConflict: "profile_id,event_id" }
  )

  if (organizerError) {
    return { success: false, reason: "insert_failed", message: organizerError.message }
  }

  try {
    await issueOrganizerBadge(supabase, registration.user_id, registration.events.name)
  } catch (error) {
    console.error("Error al emitir badge:", error)
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

  return { success: true, data: profile }
}

export async function addOrganizerAndProfile(
  supabase: SupabaseClient,
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

async function deleteOrganizerBadge(supabase: SupabaseClient, userId: number, eventName: string) {
  const badgeId = await getOrganizerBadgeId(supabase, eventName)

  const { error: userBadgeError } = await supabase
    .from("user_badges")
    .delete()
    .eq("user_id", userId)
    .eq("badge_id", badgeId)

  if (userBadgeError) {
    throw new Error(`Error deleting badge: ${userBadgeError.message}`)
  }
}

export async function removeOrganizer(supabase: SupabaseClient, registrationId: string) {
  const { data: registration, error } = await supabase
    .from("registrations")
    .select("user_id, event_id, events(name)")
    .eq("id", registrationId)
    .maybeSingle()

  if (error || !registration) {
    return false
  }

  const { error: organizerError } = await supabase
    .from("organizers")
    .delete()
    .eq("profile_id", registration.user_id)
    .eq("event_id", registration.event_id)

  try {
    await deleteOrganizerBadge(supabase, registration.user_id, registration.events.name)
  } catch (error) {
    console.error("Error al eliminar badge:", error)
  }

  return !organizerError
}
