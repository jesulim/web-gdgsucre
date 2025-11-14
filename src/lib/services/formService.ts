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
      options,
      image_url,
      form_fields (
        name,
        label,
        type,
        required
      ),
      events!inner(slug)
    `
    )
    .eq("events.slug", eventSlug)
    .order("order")

  if (error) throw error

  return data.map(row =>
    formFieldSchema.parse({
      id: row.id,
      options: row.options,
      image_url: row.image_url,
      ...row.form_fields,
    })
  )
}
