import type { SupabaseClient } from "@supabase/supabase-js"

interface CalendarEvent {
  id?: number
  name: string
  community_id: number
  start_datetime?: string
  end_datetime?: string
  format?: string
  registration_link?: string
  location?: string
  accepted?: boolean
}

export async function getCalendarEvents(supabase: SupabaseClient, start: string, end: string) {
  const { data: calendarEvents, error } = await supabase
    .from("calendar_events")
    .select(`
      id,
      name,
      community_id,
      start_datetime,
      end_datetime,
      format,
      registration_link,
      location,
      communities(id, name, short_name)
    `)
    .is("accepted", true)
    .gte("start_datetime", start)
    .lte("start_datetime", end)
    .order("start_datetime", { ascending: true })

  if (error) throw new Error(error.message)

  return calendarEvents
}

export async function getUpcomingCalendarEvents(supabase: SupabaseClient) {
  const NEXT_EVENTS_LIMIT = 4

  const startOfToday = new Date(Date.now() - 4 * 60 * 60 * 1000)
  startOfToday.setUTCHours(0, 0, 0, 0)

  const { data: calendarEvents, error } = await supabase
    .from("calendar_events")
    .select(
      `id, name, start_datetime, end_datetime, format, registration_link, location,
      communities(id, name, short_name, image)`
    )
    .or(`start_datetime.gte.${startOfToday.toISOString()},start_datetime.is.null`)
    .order("start_datetime", { ascending: true })
    .limit(NEXT_EVENTS_LIMIT)

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

  if (data.length === 0) return null

  return data
}

export async function deleteCalendarEvent(supabase: SupabaseClient, id: number) {
  const { data, error } = await supabase.from("calendar_events").delete().eq("id", id).select()

  if (error) {
    console.error(`error deleting calendar event: ${error.message}`)
    return false
  }

  return data.length > 0
}
