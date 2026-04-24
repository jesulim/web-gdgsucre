import type { SupabaseClient } from "@supabase/supabase-js"
import { type FormFieldSchema, formFieldSchema } from "@/lib/validators/formFields.ts"

export async function getFormFieldsByEvent(
  supabase: SupabaseClient,
  eventSlug: string
): Promise<FormFieldSchema[]> {
  const { data, error } = await supabase
    .from("event_form_fields")
    .select(
      `
      id,
      name,
      label,
      type,
      required,
      options,
      image_url,
      events!inner(slug)
    `
    )
    .eq("events.slug", eventSlug)
    .order("order")

  if (error) throw error

  return data.map(({ events: _events, ...row }) => formFieldSchema.parse(row))
}
