import type { APIRoute } from "astro"

import { withAdmin } from "@/lib/auth"
import {
  createCommunity,
  deleteCommunity,
  getCommunities,
  updateCommunity,
} from "@/lib/services/communityService"
import {
  createCommunitySchema,
  deleteCommunitySchema,
  getCommunitiesQuerySchema,
  updateCommunitySchema,
} from "@/lib/validators/calendarEvent"

export const GET: APIRoute = async ({ url }) => {
  try {
    const query = Object.fromEntries(url.searchParams.entries())
    const parsed = getCommunitiesQuerySchema.safeParse(query)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message ?? "Parámetros inválidos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const communities = await getCommunities(parsed.data.name)

    return new Response(JSON.stringify(communities), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error fetching communities ${error}`, {
      status: 500,
    })
  }
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => null)
    const parsed = createCommunitySchema.safeParse(body)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: parsed.error.issues[0]?.message ?? "Datos inválidos",
          issues: parsed.error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const id = await createCommunity(parsed.data)

    if (id === null) {
      return new Response(JSON.stringify({ error: "Failed to create community" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ id, message: "Comunidad creada exitosamente" }), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    })
  } catch (error) {
    return new Response(`Error creating community ${error}`, {
      status: 500,
    })
  }
}

export const PUT = withAdmin(async ({ request }) => {
  try {
    const body = await request.json().catch(() => null)
    const parsed = updateCommunitySchema.safeParse(body)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: parsed.error.issues[0]?.message ?? "Datos inválidos",
          issues: parsed.error.issues,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const { id, ...data } = parsed.data
    const result = await updateCommunity(id, data)

    if (!result) {
      return new Response(
        JSON.stringify({ error: "Comunidad no encontrada o sin permisos para actualizarla" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error updating community ${error}`, {
      status: 500,
    })
  }
})

export const DELETE = withAdmin(async ({ url }) => {
  try {
    const parsed = deleteCommunitySchema.safeParse({ id: url.searchParams.get("id") })

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message ?? "id es requerido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const success = await deleteCommunity(parsed.data.id)

    if (!success) {
      return new Response(
        JSON.stringify({ error: "Comunidad no encontrada o sin permisos para eliminarla" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error deleting community ${error}`, {
      status: 500,
    })
  }
})
