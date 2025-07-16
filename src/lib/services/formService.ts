import { supabase } from "@/lib/supabase.ts"
import {
  type FormFieldSchema,
  formFieldSchema,
} from "@/lib/validators/formFields.ts"

export async function getFormFieldsByEvent(
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
        type
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
