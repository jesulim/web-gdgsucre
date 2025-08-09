import type { SupabaseClient } from "@supabase/supabase-js"

export async function getOrganizers(supabase: SupabaseClient, eventSlug: string) {
  const { data, error } = await supabase
    .from("registrations")
    .select("id, created_at, profiles(first_name, last_name, avatar_url), status, events (slug)")
    .eq("events.slug", eventSlug)
    .eq("role", "Organizer")

  if (error) {
    console.error("Error fetching organizers:", error)
    return null
  }

  return data.map(organizer => ({
    id: organizer.id,
    first_name: organizer.profiles.first_name,
    last_name: organizer.profiles.last_name,
    image: organizer.profiles.avatar_url,
  }))
}
