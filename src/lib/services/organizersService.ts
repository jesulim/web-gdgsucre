import type { SupabaseClient } from "@supabase/supabase-js"

export async function getOrganizers(supabase: SupabaseClient, eventSlug: string) {
  const { data, error } = await supabase.from("event_organizers").select("*").eq("slug", eventSlug)

  if (error) {
    console.error("Error fetching organizers:", error)
    return null
  }

  return data.map(organizer => ({
    ...organizer,
    image: organizer.avatar_url,
  }))
}
