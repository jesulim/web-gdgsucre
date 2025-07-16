import { supabase } from "@/lib/supabase"

export async function getEvent(slug: string) {
  const { data: event, error } = await supabase
    .from("events")
    .select("id, name, date, slug, image_url")
    .eq("slug", slug)
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return event
}
