import type { APIRoute } from "astro"

import { getTeamsWithMembersByEvent } from "@/lib/services/teamService"
import { createUserClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ url, cookies }) => {
  const slug = url.searchParams.get("slug")
  if (!slug) {
    return new Response("Event slug is required", { status: 400 })
  }

  try {
    const supabase = await createUserClient(cookies)
    const data = await getTeamsWithMembersByEvent(supabase, slug)

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error fetching teams: ${error}`, { status: 500 })
  }
}
