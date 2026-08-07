import type { SupabaseClient } from "@supabase/supabase-js"
import { type FormFieldSchema, formFieldSchema } from "@/lib/validators/formFields.ts"

export async function getFormFieldsByEvent(
  supabase: SupabaseClient,
  eventSlug: string,
  eventId?: number | string
): Promise<FormFieldSchema[]> {
  let query = supabase
    .from("event_form_fields")
    .select("id, name, label, type, required, image_url, options")

  if (eventId) {
    query = query.eq("event_id", eventId)
  } else {
    query = supabase
      .from("event_form_fields")
      .select("id, name, label, type, required, image_url, options, events!inner(slug)")
      .eq("events.slug", eventSlug)
  }

  const { data, error } = await query.order("order")

  if (error) {
    console.error("Error getting form fields:", error)
    return []
  }

  if (!data) return []

  return data.map(row => {
    const { events: _events, ...cleanRow } = row as any
    return formFieldSchema.parse(cleanRow)
  })
}
