import type { SupabaseClient } from "@supabase/supabase-js"
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
    return false
  }

  const { error } = await supabase.from("organizers").insert({
    profile_id: registrationData.profile_id,
    event_id: registrationData.event_id,
  })

  return !error
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
