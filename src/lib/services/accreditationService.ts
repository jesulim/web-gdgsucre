import type { SupabaseClient } from "@supabase/supabase-js"

export async function getRegistrationsWithActivities(
  supabase: SupabaseClient,
  event_slug: string,
  role: string,
  packageName: string | null
) {
  const query = supabase
    .from("registrations_with_activities")
    .select("id, first_name, last_name, role, package, dietary_restriction, activities")
    .eq("slug", event_slug)

  if (role === "Participante" || role === "Organizer") {
    query.eq("role", role)
  }

  if (packageName && packageName !== "Todos los paquetes") {
    query.eq("package", packageName)
  }

  const { data, error } = await query.order("first_name", { ascending: true })
  if (error) {
    throw new Error(`Error fetching registrations with activities: ${error.message}`)
  }

  return data?.map(({ activities, ...rest }) => ({ ...rest, ...activities }))
}

export async function updateRegistrationActivity(
  supabase: SupabaseClient,
  registrationId: number,
  activityId: number,
  value: boolean
) {
  const { error } = await supabase.from("registration_activities").upsert(
    {
      registration_id: registrationId,
      activity_id: activityId,
      completed: value,
    },
    { onConflict: "registration_id,activity_id" }
  )

  if (error) throw new Error(`Error updating activity: ${error.message}`)

  return { success: true }
}
