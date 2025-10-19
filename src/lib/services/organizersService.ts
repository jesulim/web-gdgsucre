import type { SupabaseClient } from "@supabase/supabase-js"

export async function getOrganizers(supabase: SupabaseClient, eventSlug: string) {
  const { data, error } = await supabase
    .from("organizers")
    .select("id, profiles (first_name, last_name, avatar_url), events(slug)")
    .eq("events.slug", eventSlug)

  if (error) {
    console.error("Error fetching organizers:", error)
    return null
  }

  return data.map(organizer => ({
    id: organizer.id,
    image: organizer.profiles.avatar_url,
    ...organizer.profiles,
  }))
}
