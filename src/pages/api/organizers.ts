import type { APIRoute } from "astro"
import { addOrganizer, getOrganizers, removeOrganizer } from "@/lib/services/organizersService"
import { createUserClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const slug = url.searchParams.get("slug")

    if (!slug) {
      return new Response(JSON.stringify({ error: "slug es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createUserClient(cookies)
    const organizers = await getOrganizers(supabase, slug)

    if (!organizers) {
      return new Response(JSON.stringify({ error: "No se pudieron obtener los organizadores" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify(organizers), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: `Error al obtener organizadores: ${error}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { registrationId } = body

    if (!registrationId) {
      return new Response(JSON.stringify({ error: "registrationId es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createUserClient(cookies)
    const result = await addOrganizer(supabase, registrationId)

    if (!result.success) {
      const errorMessage =
        result.reason === "registration_not_found"
          ? "El registro no fue encontrado"
          : result.message || "No se pudo agregar el organizador"

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: result.reason === "registration_not_found" ? 404 : 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ message: "Organizador agregado exitosamente" }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: `Error al agregar organizador: ${error}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export const DELETE: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { registrationId } = body

    if (!registrationId) {
      return new Response(JSON.stringify({ error: "registrationId es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createUserClient(cookies)
    const success = await removeOrganizer(supabase, registrationId)

    if (!success) {
      return new Response(JSON.stringify({ error: "No se pudo eliminar el organizador" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ message: "Organizador eliminado exitosamente" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: `Error al eliminar organizador: ${error}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
