import type { APIRoute } from "astro"
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getAllCalendarEvents,
  getCalendarEvents,
  updateCalendarEvent,
} from "@/lib/services/calendarEventService"

import { createUserClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ url, cookies }) => {
  try {
    const startParam = url.searchParams.get("start")
    const endParam = url.searchParams.get("end")
    const yearParam = url.searchParams.get("year")
    const monthParam = url.searchParams.get("month")

    const supabase = await createUserClient(cookies)

    let calendarEvents: Awaited<ReturnType<typeof getCalendarEvents>>

    if (startParam && endParam) {
      calendarEvents = await getCalendarEvents(supabase, startParam, endParam)
    } else if (yearParam || monthParam) {
      const now = new Date()
      const year = yearParam ? Number(yearParam) : now.getUTCFullYear()
      const month = monthParam ? Number(monthParam) : now.getUTCMonth() + 1

      if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
        return new Response(JSON.stringify({ error: "year/month inválidos" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        })
      }

      const start = new Date(Date.UTC(year, month - 1, 1)).toISOString()
      const end = new Date(Date.UTC(year, month, 1)).toISOString()
      calendarEvents = await getCalendarEvents(supabase, start, end)
    } else {
      calendarEvents = await getAllCalendarEvents(supabase)
    }

    return new Response(JSON.stringify(calendarEvents), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error fetching calendar events ${error}`, {
      status: 500,
    })
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const {
      name,
      community_id,
      start_datetime,
      end_datetime,
      format,
      registration_link,
      location,
    } = body

    if (!name || !community_id) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createUserClient(cookies)
    const success = await createCalendarEvent(supabase, {
      name,
      community_id,
      start_datetime,
      end_datetime,
      format,
      registration_link,
      location,
    })

    if (!success) {
      return new Response(JSON.stringify({ error: "Failed to create calendar event" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    return new Response(JSON.stringify({ message: "Evento creado exitosamente" }), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    })
  } catch (error) {
    return new Response(`Error creating calendar event ${error}`, {
      status: 500,
    })
  }
}

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const {
      id,
      name,
      community_id,
      start_datetime,
      end_datetime,
      format,
      registration_link,
      location,
      accepted,
    } = body

    if (!id) {
      return new Response(JSON.stringify({ error: "Invalid request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = await createUserClient(cookies)
    const result = await updateCalendarEvent(supabase, id, {
      name,
      community_id,
      start_datetime,
      end_datetime,
      format,
      registration_link,
      location,
      accepted,
    })

    if (!result) {
      return new Response(JSON.stringify({ error: "Evento no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    // if (accepted === true) {
    //   supabase.functions.invoke("send-email", {
    //     body: {
    //       type: "event-accepted",
    //       data: { eventId: id },
    //     },
    //   })
    // }

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(`Error updating calendar event ${error}`, {
      status: 500,
      headers: { "Content-Type": "application/json" },
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
    const success = await deleteCalendarEvent(supabase, Number(id))

    if (!success) {
      return new Response(
        JSON.stringify({ error: "Evento no encontrado o sin permisos para eliminarlo" }),
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
    return new Response(`Error deleting calendar event ${error}`, {
      status: 500,
    })
  }
}
