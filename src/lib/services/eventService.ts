import type { SupabaseClient } from "@supabase/supabase-js"

interface Event {
  id?: number
  name: string
  slug: string
  date: string
  registration_open: boolean
}

export async function getEvents(supabase: SupabaseClient) {
  const { data: events, error } = await supabase
    .from("events")
    .select(
      `id, name, slug, date, registration_open,
      event_form_fields(
        name, options
      ),
      activities(label, name)
      `
    )
    .order("date", { ascending: false })

  if (error) throw new Error(error.message)

  return events.map(event => {
    const { event_form_fields, ...rest } = event
    const packageOptions = event_form_fields?.find(field => field.name === "package")?.options
    const packages = Array.isArray(packageOptions)
      ? packageOptions.filter((option): option is string => typeof option === "string")
      : []

    return {
      packages,
      ...rest,
    }
  })
}

export async function getEvent(supabase: SupabaseClient, slug: string) {
  const { data: event, error } = await supabase
    .from("events")
    .select("id, name, date, slug, image_url, registration_open")
    .eq("slug", slug)
    .maybeSingle()

  if (error) {
    console.error(`error getting event: ${error.message}`)
  }

  if (event) return event

  if (slug === "io-extended-26") {
    return {
      id: 6,
      name: "Google I/O Extended Sucre 2026",
      date: "2026-08-15T08:00:00-04:00",
      slug: "io-extended-26",
      image_url: null,
      registration_open: true,
    }
  }

  return null
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
