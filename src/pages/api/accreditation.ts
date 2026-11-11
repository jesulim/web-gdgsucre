import {
  eventFromRegistrationId,
  eventFromSlugParam,
  registrationIdFromBody,
  withStaffOrAdmin,
} from "@/lib/auth"
import {
  getRegistrationsWithActivities,
  updateRegistrationActivity,
} from "@/lib/services/accreditationService"

export const GET = withStaffOrAdmin(eventFromSlugParam("slug"), async ({ url, auth }) => {
  const slug = url.searchParams.get("slug")
  const role = url.searchParams.get("role") || "Todos"
  const packageName = url.searchParams.get("package")

  if (!slug) {
    return new Response("Event slug is required", { status: 400 })
  }

  try {
    const registrations = await getRegistrationsWithActivities(
      auth.supabase,
      slug,
      role,
      packageName
    )

    return new Response(JSON.stringify(registrations), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(JSON.stringify({ details: `Error fetching registrations: ${error}` }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    })
  }
})

export const POST = withStaffOrAdmin(
  eventFromRegistrationId(registrationIdFromBody),
  async ({ request, auth }) => {
    try {
      const body = await request.json()
      const { registrationId, activityId, activityName, value } = body

      if (!registrationId || !activityId || !activityName || typeof value !== "boolean") {
        return new Response(JSON.stringify({ error: "Invalid request body" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }

      const result = await updateRegistrationActivity(
        auth.supabase,
        registrationId,
        activityId,
        value
      )

      return new Response(JSON.stringify({ success: true, data: result }), {
        headers: { "Content-Type": "application/json" },
        status: 200,
      })
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: `Error updating activity: ${error instanceof Error ? error.message : error}`,
        }),
        {
          headers: { "Content-Type": "application/json" },
          status: 500,
        }
      )
    }
  }
)
