import { eventFromSlugParam, withStaffOrAdmin } from "@/lib/auth"
import { getTeamsWithMembersByEvent } from "@/lib/services/teamService"

export const GET = withStaffOrAdmin(eventFromSlugParam("slug"), async ({ url, auth }) => {
  const slug = url.searchParams.get("slug")
  if (!slug) {
    return new Response("Event slug is required", { status: 400 })
  }

  try {
    const membersData = await getTeamsWithMembersByEvent(auth.supabase, slug)

    return new Response(JSON.stringify(membersData), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Error fetching teams", error)
    return new Response("Error interno del servidor", { status: 500 })
    // return new Response(`Error fetching teams: ${error}`, { status: 500 })
  }
})
