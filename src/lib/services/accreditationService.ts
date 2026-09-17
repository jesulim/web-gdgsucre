import type { SupabaseClient } from "@supabase/supabase-js"
import { getUserAndBadgeIds } from "./badgesService"

export async function getRegistrationsWithActivities(
  supabase: SupabaseClient,
  event_slug: string,
  role: string,
  packageName: string
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

async function issueParticipantBadge(supabase: SupabaseClient, registrationId: number) {
  const { userId, badgeId } = await getUserAndBadgeIds(supabase, registrationId)

  const { error: userBadgeError } = await supabase.from("user_badges").upsert({
    user_id: userId,
    badge_id: badgeId,
  })

  if (userBadgeError) {
    throw new Error(`Error adding badge: ${userBadgeError.message}`)
  }
}

async function deleteParticipantBadge(supabase: SupabaseClient, registrationId: number) {
  const { userId, badgeId } = await getUserAndBadgeIds(supabase, registrationId)

  const { error: userBadgeError } = await supabase
    .from("user_badges")
    .delete()
    .eq("user_id", userId)
    .eq("badge_id", badgeId)

  if (userBadgeError) {
    throw new Error(`Error deleting badge: ${userBadgeError.message}`)
  }
}

export async function updateRegistrationActivity(
  supabase: SupabaseClient,
  registrationId: number,
  activityId: number,
  activityName: string,
  value: boolean
) {
  if (activityName === "check_in") {
    try {
      if (value === true) {
        await issueParticipantBadge(supabase, registrationId)
      } else {
        await deleteParticipantBadge(supabase, registrationId)
      }
    } catch (error) {
      console.error("Error al gestionar badge:", error)
    }
  }

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
