import type { SupabaseClient } from "@supabase/supabase-js"
import type { APIRoute } from "astro"
import { createUserClient } from "@/lib/supabase"

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json()
    const { team_name, event_id } = data
    const supabase = await createUserClient(cookies)
    const { data: userResponse, error: userError } = await supabase.auth.getUser()
    const user = userResponse?.user
    if (userError || !user) {
      return new Response("No autenticado", { status: 401 })
    }

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: team_name,
        event_id: event_id,
      })
      .select()
      .single()

    console.log("Team created:", team, "Error:", teamError)

    if (teamError || !team) {
      throw new Error("Error creating team")
    }

    return new Response(JSON.stringify({ team }), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    })
  } catch (error) {
    console.error("Error creating team", error)
    return new Response("Error al intentar crear el equipo", { status: 500 })
  }
}
