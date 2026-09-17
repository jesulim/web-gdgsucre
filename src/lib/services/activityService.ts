import type { SupabaseClient } from "@supabase/supabase-js"

export interface EventActivity {
  id: number
  event_id: number
  name: string
  label: string
}

export interface EventActivityInput {
  name: string
  label: string
}

export async function getActivitiesByEvent(supabase: SupabaseClient, eventId: number) {
  const { data, error } = await supabase
    .from("activities")
    .select("id, event_id, name, label")
    .eq("event_id", eventId)
    .order("id")

  if (error) throw new Error(`Error fetching activities: ${error.message}`)

  return data as EventActivity[]
}

export async function createActivity(
  supabase: SupabaseClient,
  eventId: number,
  activity: EventActivityInput
) {
  const { data, error } = await supabase
    .from("activities")
    .insert({ event_id: eventId, ...activity })
    .select("id, event_id, name, label")
    .single()

  if (error) throw new Error(`Error creating activity: ${error.message}`)

  return data as EventActivity
}

export async function updateActivity(
  supabase: SupabaseClient,
  id: number,
  activity: EventActivityInput
) {
  const { data, error } = await supabase
    .from("activities")
    .update(activity)
    .eq("id", id)
    .select("id, event_id, name, label")
    .single()

  if (error) throw new Error(`Error updating activity: ${error.message}`)

  return data as EventActivity
}

export async function deleteActivity(supabase: SupabaseClient, id: number) {
  const { error } = await supabase.from("activities").delete().eq("id", id)

  if (error) throw new Error(`Error deleting activity: ${error.message}`)
}
