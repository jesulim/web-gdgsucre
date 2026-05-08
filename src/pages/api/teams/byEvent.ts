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

    const { data: userResponse, error: userError } = await supabase.auth.getUser()
    const user = userResponse?.user
    if (userError || !user) {
      return new Response("No autenticado", { status: 401 })
    }
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .single()
    if (profileError || !profile?.is_admin) {
      return new Response("No autorizado", { status: 403 })
    }

    const data = await getTeamsWithMembersByEvent(supabase, slug)

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Error fetching teams", error)
    return new Response("Error interno del servidor", { status: 500 })
    // return new Response(`Error fetching teams: ${error}`, { status: 500 })
  }
}
