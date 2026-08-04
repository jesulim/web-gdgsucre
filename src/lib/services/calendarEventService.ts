import type { SupabaseClient } from "@supabase/supabase-js"

interface CalendarEvent {
  id?: number
  name: string
  community_id: number
  start_datetime: string
  end_datetime: string
  format?: string
  registration_link?: string
  location?: string
  accepted?: boolean
}

export async function getCalendarEvents(supabase: SupabaseClient, year: number, month: number) {
  const start = new Date(Date.UTC(year, month - 1, 1))
  const end = new Date(Date.UTC(year, month, 1))

  const { data: calendarEvents, error } = await supabase
    .from("calendar_events")
    .select("*, communities(id, name, short_name, image)")
    .gte("start_datetime", start.toISOString())
    .lt("start_datetime", end.toISOString())
    .order("start_datetime", { ascending: true })

  if (error) throw new Error(error.message)

  return calendarEvents
}

export async function getAllCalendarEvents(supabase: SupabaseClient) {
  const { data: calendarEvents, error } = await supabase
    .from("calendar_events")
    .select(`
      id,
      created_at,
      name,
      start_datetime,
      end_datetime,
      format,
      registration_link,
      location,
      accepted,
      communities(id, name, short_name, image)`)
    .order("start_datetime", { ascending: false })

  if (error) throw new Error(error.message)

  return calendarEvents
}

export async function createCalendarEvent(supabase: SupabaseClient, calendarEvent: CalendarEvent) {
  const { error } = await supabase.from("calendar_events").insert(calendarEvent)

  if (error) {
    console.error(`error creating calendar event: ${error.message}`)
    return false
  }

  return true
}

export async function updateCalendarEvent(
  supabase: SupabaseClient,
  id: number,
  calendarEvent: Partial<CalendarEvent>
) {
  const { data, error } = await supabase
    .from("calendar_events")
    .update(calendarEvent)
    .eq("id", id)
    .select()

  if (error) {
    console.error(`error updating calendar event: ${error.message}`)
    return null
  }

  // RLS filtra silenciosamente las filas que no cumplen la política de UPDATE
  // (en vez de lanzar un error), así que un array vacío significa que no se
  // modificó nada: no existe el id o el usuario no tiene permiso.
  if (data.length === 0) return null

  return data
}

export async function deleteCalendarEvent(supabase: SupabaseClient, id: number) {
  const { data, error } = await supabase.from("calendar_events").delete().eq("id", id).select()

  if (error) {
    console.error(`error deleting calendar event: ${error.message}`)
    return false
  }

  // Igual que en updateCalendarEvent: RLS filtra silenciosamente sin dar
  // error, así que un array vacío significa que no se borró ninguna fila.
  return data.length > 0
}
