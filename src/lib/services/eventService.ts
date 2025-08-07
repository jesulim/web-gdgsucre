import type { SupabaseClient } from "@supabase/supabase-js"

export async function getEvent(supabase: SupabaseClient, slug: string) {
  const { data: event, error } = await supabase
    .from("events")
    .select("id, name, date, slug, image_url, registration_open")
    .eq("slug", slug)
    .single()

  if (error) {
    console.error(`error getting event: ${error.message}`)
    return null
  }

  return event
}
