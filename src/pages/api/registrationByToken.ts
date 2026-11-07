import { eventFromSlugParam, withStaffOrAdmin } from "@/lib/auth"
import { getRegistrationByToken } from "@/lib/services/registrationService"

export const GET = withStaffOrAdmin(eventFromSlugParam("eventSlug"), async ({ url, auth }) => {
  const token = url.searchParams.get("token")
  const activity = url.searchParams.get("activity")
  const eventSlug = url.searchParams.get("eventSlug")

  if (!token || !activity || !eventSlug) {
    return new Response("Token, activity and eventSlug are required", { status: 400 })
  }

  try {
    const response = await getRegistrationByToken(auth.supabase, token, activity, eventSlug)

    return new Response(JSON.stringify(response), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error fetching registrations ${error}`, {
      status: 500,
    })
  }
})
