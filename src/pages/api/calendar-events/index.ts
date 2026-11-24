import type { APIRoute } from "astro"

import { withAdmin } from "@/lib/auth"
import {
  createCalendarEvent,
  deleteCalendarEvent,
  getAllCalendarEvents,
  getCalendarEvents,
  updateCalendarEvent,
} from "@/lib/services/calendarEventService"
import { acceptCommunityOnFirstEvent } from "@/lib/services/communityService"
import {
  createCalendarEventSchema,
  deleteCalendarEventSchema,
  getCalendarEventsQuerySchema,
  updateCalendarEventSchema,
} from "@/lib/validators/calendarEvent"

const sendCalendarEventEmail = async (
  type: "event-received" | "event-accepted",
  eventId: number
) => {
  const branchId = import.meta.env.NEON_BRANCH_ID
  const hostSuffix = import.meta.env.NEON_FUNCTION_HOST_SUFFIX
  const secret = import.meta.env.FUNCTION_SECRET

  if (!branchId || !hostSuffix || !secret) {
    console.error(`error sending ${type} email: Neon function is not configured`)
    return
  }

  try {
    const response = await fetch(`https://${branchId}-sendemail${hostSuffix}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-function-secret": secret,
      },
      body: JSON.stringify({ type, data: { eventId } }),
    })

    if (!response.ok) {
      const details = await response.text().catch(() => "")
      console.error(`error sending ${type} email: ${response.status} ${details}`)
    }
  } catch (error) {
    console.error("error invoking send email email:", error)
  }
}

export const GET: APIRoute = async ({ url }) => {
  try {
    const query = Object.fromEntries(url.searchParams.entries())
    const parsed = getCalendarEventsQuerySchema.safeParse(query)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message ?? "Parámetros inválidos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const { start, end, year, month } = parsed.data

    let calendarEvents:
      | Awaited<ReturnType<typeof getCalendarEvents>>
      | Awaited<ReturnType<typeof getAllCalendarEvents>>

    if (start && end) {
      calendarEvents = await getCalendarEvents(start, end)
    } else if (year || month) {
      const now = new Date()
      const targetYear = year ?? now.getUTCFullYear()
      const targetMonth = month ?? now.getUTCMonth() + 1

      const rangeStart = new Date(Date.UTC(targetYear, targetMonth - 1, 1)).toISOString()
      const rangeEnd = new Date(Date.UTC(targetYear, targetMonth, 1)).toISOString()
      calendarEvents = await getCalendarEvents(rangeStart, rangeEnd)
    } else {
      calendarEvents = await getAllCalendarEvents()
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

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json().catch(() => null)
    const parsed = createCalendarEventSchema.safeParse(body)

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

    const id = await createCalendarEvent(parsed.data)

    if (!id) {
      return new Response(JSON.stringify({ error: "Failed to create calendar event" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Skip await to reduce response time
    sendCalendarEventEmail("event-received", id)

    return new Response(JSON.stringify({ message: "Evento creado exitosamente", id }), {
      headers: { "Content-Type": "application/json" },
      status: 201,
    })
  } catch (error) {
    return new Response(`Error creating calendar event ${error}`, {
      status: 500,
    })
  }
}

export const PUT = withAdmin(async ({ request }) => {
  try {
    const body = await request.json().catch(() => null)
    const parsed = updateCalendarEventSchema.safeParse(body)

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
    const result = await updateCalendarEvent(id, data)

    if (!result) {
      return new Response(JSON.stringify({ error: "Evento no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    if (data.accepted === true) {
      await acceptCommunityOnFirstEvent(id)

      // Skip await to reduce response time
      sendCalendarEventEmail("event-accepted", id)
    }

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
})

export const DELETE = withAdmin(async ({ url }) => {
  try {
    const parsed = deleteCalendarEventSchema.safeParse({ id: url.searchParams.get("id") })

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message ?? "id es requerido" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const success = await deleteCalendarEvent(parsed.data.id)

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
})
