import {
  type FormFieldSchema,
  formFieldSchema,
} from "@/lib/validators/formFields.ts"
import type { SupabaseClient } from "@supabase/supabase-js"

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
      form_fields (
        name,
        label,
        type,
        required
      ),
      events (slug)
    `
    )
    .eq("events.slug", eventSlug)
    .order("order")

  if (error) throw error

  return data.map(row =>
    formFieldSchema.parse({
      id: row.id,
      options: row.options,
      ...row.form_fields,
    })
  )
}
