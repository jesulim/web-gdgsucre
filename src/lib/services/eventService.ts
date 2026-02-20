import type { SupabaseClient } from "@supabase/supabase-js"

interface Event {
  id?: number
  name: string
  slug: string
  date: string
  registration_open: boolean
}

export async function getAllEvents(supabase: SupabaseClient, ascending = false) {
  const { data: events, error } = await supabase
    .from("events")
    .select(
      `id, name, slug, date, registration_open,
      event_form_fields(
        form_fields(label), options
      )`
    )
    // .eq("event_form_fields.form_fields.label", "Paquete")
    .order("date", { ascending })

  if (error) throw new Error(error.message)

  return events.map(event => {
    const { event_form_fields, ...rest } = event

    return {
      packages: event_form_fields?.find(field => field.form_fields?.label === "Paquete")?.options,
      ...rest,
    }
  })
}

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

export async function createEvent(supabase: SupabaseClient, event: Event) {
  const { data, error } = await supabase
    .from("events")
    .insert(event)
    .select("id, name, slug, date, registration_open")

  if (error) {
    console.error(`error creating event: ${error.message}`)
    return null
  }

  return data
}

export async function updateEvent(supabase: SupabaseClient, id: number, event: Event) {
  const { data, error } = await supabase.from("events").update(event).eq("id", id)

  if (error) {
    console.error(`error updating event: ${error.message}`)
    return null
  }

  return data
}
