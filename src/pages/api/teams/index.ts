import type { APIRoute } from "astro"

import { createUserClient } from "@/lib/supabase"
import { customAlphabetNanoid } from "@/lib/utils"

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const data = await request.json()
    const { team_name, event_id } = data

    if (!team_name || !event_id) {
      return new Response("Faltan datos requeridos", { status: 400 })
    }

    const supabase = await createUserClient(cookies)

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .insert({
        name: team_name,
        event_id: event_id,
        code: customAlphabetNanoid(),
      })
      .select()
      .single()

    if (teamError) {
      console.error(`Error creating team: ${teamError.message}`)
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

export const DELETE: APIRoute = async ({ url, cookies }) => {
  const id = url.searchParams.get("id")
  if (!id) {
    return new Response("Faltan datos requeridos", { status: 400 })
  }

  try {
    const supabase = await createUserClient(cookies)
    const { error } = await supabase.from("teams").delete().eq("id", id)

    if (error) {
      return new Response(
        JSON.stringify({ success: false, message: `Error al eliminar el equipo ${error}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return new Response(JSON.stringify({ success: true, message: "Equipo eliminado" }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `Error al eliminar el equipo ${error instanceof Error && error.message}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
