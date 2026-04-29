import type { APIRoute } from "astro"

import { listMembers } from "@/lib/services/teamService"
import { createUserClient } from "@/lib/supabase"

// GET /api/teams/members
export const GET: APIRoute = async ({ cookies }) => {
  const supabase = await createUserClient(cookies)

  try {
    const members = await listMembers(supabase)
    return Response.json(members)
  } catch (error: any) {
    return new Response(error.message, { status: 400 })
  }
}
