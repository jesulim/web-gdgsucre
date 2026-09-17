import type { APIRoute } from "astro"
import {
  createCommunity,
  deleteCommunity,
  getCommunities,
  updateCommunity,
} from "@/lib/services/communityService"
import { createUserClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const name = url.searchParams.get("name") ?? undefined

    const supabase = await createUserClient(cookies)
    const communities = await getCommunities(supabase, name)

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

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { name, short_name, website, contact_email, image } = body

    if (!name || !contact_email) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createUserClient(cookies)
    const id = await createCommunity(supabase, {
      name,
      short_name,
      website,
      contact_email,
      image,
    })

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

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { id, name, short_name, website, contact_email, image, accepted } = body

    if (!id) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createUserClient(cookies)
    const result = await updateCommunity(supabase, id, {
      name,
      short_name,
      website,
      contact_email,
      image,
      accepted,
    })

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
}

export const DELETE: APIRoute = async ({ url, cookies }) => {
  try {
    const id = url.searchParams.get("id")

    if (!id) {
      return new Response(JSON.stringify({ error: "id es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createUserClient(cookies)
    const success = await deleteCommunity(supabase, Number(id))

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
}
