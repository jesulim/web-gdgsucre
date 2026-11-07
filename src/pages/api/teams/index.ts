import { withStaffOrAdmin } from "@/lib/auth"
import { getTeamEventId } from "@/lib/services/teamService"
import { customAlphabetNanoid } from "@/lib/utils"

export const POST = withStaffOrAdmin(
  (_auth, body) => Number((body as { event_id?: unknown } | null)?.event_id) || null,
  async ({ request, auth }) => {
    try {
      const data = await request.json()
      const { team_name, event_id } = data

      if (!team_name || !event_id) {
        return new Response("Faltan datos requeridos", { status: 400 })
      }

      const { data: team, error: teamError } = await auth.supabase
        .from("teams")
        .insert({
          name: team_name,
          event_id: event_id,
          code: customAlphabetNanoid(),
        })
        .select()
        .single()

      if (teamError || !team) {
        console.error(`Error creating team: ${teamError?.message}`)
        return new Response("Error al intentar crear el equipo", { status: 500 })
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
)

export const DELETE = withStaffOrAdmin(
  ({ supabase }, _body, { url }) => {
    const id = Number(url.searchParams.get("id"))
    return Number.isInteger(id) && id > 0 ? getTeamEventId(supabase, id) : null
  },
  async ({ url, auth }) => {
    const id = url.searchParams.get("id")
    if (!id) {
      return new Response("Faltan datos requeridos", { status: 400 })
    }

    try {
      const { data: deleted, error } = await auth.supabase
        .from("teams")
        .delete()
        .eq("id", id)
        .select("id")

      if (error) {
        return new Response(
          JSON.stringify({ success: false, message: `Error al eliminar el equipo ${error}` }),
          {
            status: 500,
            headers: { "Content-Type": "application/json" },
          }
        )
      }

      if (!deleted?.length) {
        return Response.json(
          { success: false, message: "No se pudo eliminar el equipo" },
          { status: 403 }
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
)
