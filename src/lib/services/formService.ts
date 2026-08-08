import type { SupabaseClient } from "@supabase/supabase-js"
import { type FormFieldSchema, formFieldSchema } from "@/lib/validators/formFields.ts"

export interface EventFormFieldAdmin extends FormFieldSchema {
  event_id: number
  order: number
}

export interface EventFormFieldInput {
  event_id: number
  order?: number | null
  name: string
  label: string
  type: string
  required: boolean
  options?: string[] | null
  image_url?: string | null
}

export async function getFormFieldsByEventAdmin(
  supabase: SupabaseClient,
  eventId: number
): Promise<EventFormFieldAdmin[]> {
  const { data, error } = await supabase
    .from("event_form_fields")
    .select("id, event_id, order, name, label, type, required, options, image_url")
    .eq("event_id", eventId)
    .order("order")

  if (error) throw error

  return data as unknown as EventFormFieldAdmin[]
}

export async function createFormField(
  supabase: SupabaseClient,
  field: EventFormFieldInput
): Promise<EventFormFieldAdmin> {
  let order = field.order

  if (order === undefined || order === null) {
    const { data: maxOrder, error: maxError } = await supabase
      .from("event_form_fields")
      .select("order")
      .eq("event_id", field.event_id)
      .order("order", { ascending: false })
      .limit(1)

    if (maxError) throw maxError

    order = (maxOrder?.[0]?.order ?? 0) + 1
  }

  const { data, error } = await supabase
    .from("event_form_fields")
    .insert({
      event_id: field.event_id,
      order,
      name: field.name,
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.type === "select" ? (field.options ?? []) : null,
      image_url: field.image_url || null,
    })
    .select("id, event_id, order, name, label, type, required, options, image_url")
    .single()

  if (error) throw error

  return data as unknown as EventFormFieldAdmin
}

export async function updateFormField(
  supabase: SupabaseClient,
  id: number,
  field: Omit<EventFormFieldInput, "event_id">
): Promise<EventFormFieldAdmin> {
  const payload: Record<string, unknown> = {
    name: field.name,
    label: field.label,
    type: field.type,
    required: field.required,
    options: field.type === "select" ? (field.options ?? []) : null,
    image_url: field.image_url || null,
  }

  if (field.order !== undefined && field.order !== null) {
    payload.order = field.order
  }

  const { data, error } = await supabase
    .from("event_form_fields")
    .update(payload)
    .eq("id", id)
    .select("id, event_id, order, name, label, type, required, options, image_url")
    .single()

  if (error) throw error

  return data as unknown as EventFormFieldAdmin
}

export async function deleteFormField(supabase: SupabaseClient, id: number) {
  const { error } = await supabase.from("event_form_fields").delete().eq("id", id)

  if (error) throw error
}

export async function getFormFieldsByEvent(
  supabase: SupabaseClient,
  eventId?: number | string
): Promise<FormFieldSchema[]> {
  const { data, error } = await supabase
    .from("event_form_fields")
    .select("id, name, label, type, required, image_url, options")
    .eq("event_id", eventId)
    .order("order")

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
