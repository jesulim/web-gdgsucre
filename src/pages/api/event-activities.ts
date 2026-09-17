import type { APIRoute } from "astro"

import {
  createActivity,
  deleteActivity,
  getActivitiesByEvent,
  updateActivity,
} from "@/lib/services/activityService"
import { createUserClient } from "@/lib/supabase"

const JSON_HEADERS = { "Content-Type": "application/json" }

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: JSON_HEADERS,
  })
}

export const GET: APIRoute = async ({ url, cookies }) => {
  const eventId = Number(url.searchParams.get("event_id"))

  if (!eventId || Number.isNaN(eventId)) {
    return jsonError("event_id es requerido", 400)
  }

  try {
    const supabase = await createUserClient(cookies)
    const activities = await getActivitiesByEvent(supabase, eventId)

    return new Response(JSON.stringify(activities), {
      status: 200,
      headers: JSON_HEADERS,
    })
  } catch (error) {
    return jsonError(`Error fetching activities: ${error}`, 500)
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { event_id, name, label } = body

    if (!event_id || typeof event_id !== "number" || !name?.trim() || !label?.trim()) {
      return jsonError("event_id, name y label son requeridos", 400)
    }

    const supabase = await createUserClient(cookies)
    const activity = await createActivity(supabase, event_id, { name, label })

    return new Response(JSON.stringify(activity), {
      status: 200,
      headers: JSON_HEADERS,
    })
  } catch (error) {
    console.error(error)
    return jsonError(`Error creating activity: ${error}`, 500)
  }
}

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { id, name, label } = body

    if (!id || typeof id !== "number" || !name?.trim() || !label?.trim()) {
      return jsonError("id, name y label son requeridos", 400)
    }

    const supabase = await createUserClient(cookies)
    const activity = await updateActivity(supabase, id, { name, label })

    return new Response(JSON.stringify(activity), {
      status: 200,
      headers: JSON_HEADERS,
    })
  } catch (error) {
    return jsonError(`Error updating activity: ${error}`, 500)
  }
}

export const DELETE: APIRoute = async ({ url, cookies }) => {
  const id = Number(url.searchParams.get("id"))

  if (!id || Number.isNaN(id)) {
    return jsonError("id es requerido", 400)
  }

  try {
    const supabase = await createUserClient(cookies)
    await deleteActivity(supabase, id)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: JSON_HEADERS,
    })
  } catch (error) {
    return jsonError(`Error deleting activity: ${error}`, 500)
  }
}
