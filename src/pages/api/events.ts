import type { APIRoute } from "astro"
import { createEvent, getAllEvents, updateEvent } from "@/lib/services/eventService"
import { createUserClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const supabase = await createUserClient(cookies)
    const events = await getAllEvents(supabase, url.searchParams.get("order") === "asc")

    return new Response(JSON.stringify(events), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error fetching events ${error}`, {
      status: 500,
    })
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { name, slug, date, registration_open } = body

    if (!name || !slug || !date || !registration_open) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createUserClient(cookies)
    const result = await createEvent(supabase, {
      name,
      slug,
      date,
      registration_open,
    })

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error creating event ${error}`, {
      status: 500,
    })
  }
}

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { id, name, slug, date, registration_open, packages } = body

    if (!id || !name || !slug || !date || !registration_open || !packages) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createUserClient(cookies)
    const result = await updateEvent(supabase, id, {
      name,
      slug,
      date,
      registration_open,
      packages,
    })

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error updating event ${error}`, {
      status: 500,
    })
  }
}
