import type { APIRoute } from "astro"
import { getTeamByCode } from "@/lib/services/teamService"
import { createUserClient } from "@/lib/supabase"
export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { memberId, teamCode, eventId } = await request.json()

    console.log("Received data:", { memberId, teamCode, eventId })

    if (!memberId || !teamCode || !eventId) {
      console.error("Validation failed: Missing required fields", {
        memberId,
        teamCode,
        eventId,
      })
      return new Response("Member ID, Team Code, and Event ID are required", {
        status: 400,
      })
    }

    const supabase = await createUserClient(cookies)
    // console.log("Supabase client initialized");

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

    const team = await getTeamByCode(supabase, teamCode, eventId)
    console.log("Team fetched:", team)

    if (!team) {
      console.error("Team not found", { teamCode, eventId })
      return new Response(JSON.stringify({ error: "No se encontro el equipo" }), { status: 404 })
    }
    const { count, error: countError } = await supabase
      .from("team_registrations")
      .select("*", { count: "exact" })
      .eq("team_id", team.id)

    if (countError) {
      throw countError
    }
    if (count ?? 0 >= 5) {
      return new Response(JSON.stringify({ error: "El equipo ya tiene todos sus integrantes" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { error } = await supabase.from("team_registrations").insert({
      team_id: team.id,
      registration_id: parseInt(memberId),
      leader: false,
    })

    if (error) {
      console.error("Error inserting into team_registrations", error)
      throw error
    }

    console.log("Member added successfully to team")
    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    console.error("Error adding member to team:", error)
    return new Response(JSON.stringify({ error: "Error adding member to team" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
