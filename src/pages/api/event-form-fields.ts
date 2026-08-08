import type { APIRoute } from "astro"

import {
  createFormField,
  deleteFormField,
  getFormFieldsByEventAdmin,
  updateFormField,
} from "@/lib/services/formService"
import { createUserClient } from "@/lib/supabase"
import { SUPPORTED_TYPES } from "@/lib/validators/formFields"

const JSON_HEADERS = { "Content-Type": "application/json" }

function jsonError(message: string, status: number) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: JSON_HEADERS,
  })
}

function parseOptions(value: unknown): string[] | null {
  if (value === undefined || value === null) return null
  if (Array.isArray(value))
    return value.filter((option): option is string => typeof option === "string")
  if (typeof value !== "string") return null
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed)
      ? parsed.filter((option): option is string => typeof option === "string")
      : null
  } catch {
    return null
  }
}

function validateFieldInput(body: Record<string, unknown>): {
  event_id?: number | null
  order: number | null
  name: string
  label: string
  type: string
  required: boolean
  options: string[] | null
  image_url: string | null
} | null {
  const { event_id, name, label, type, required } = body

  if (typeof name !== "string" || !name.trim()) return null
  if (typeof label !== "string" || !label.trim()) return null
  if (
    typeof type !== "string" ||
    !SUPPORTED_TYPES.includes(type as (typeof SUPPORTED_TYPES)[number])
  ) {
    return null
  }
  if (typeof required !== "boolean") return null

  const order = body.order === undefined || body.order === null ? null : Number(body.order)
  const imageUrl = typeof body.image_url === "string" ? body.image_url : null
  const options = parseOptions(body.options)
  const eventId =
    event_id === undefined || event_id === null
      ? null
      : Number.isFinite(Number(event_id))
        ? Number(event_id)
        : null

  return { event_id: eventId, order, name, label, type, required, options, image_url: imageUrl }
}

export const GET: APIRoute = async ({ url, cookies }) => {
  const eventId = Number(url.searchParams.get("event_id"))

  if (!eventId || Number.isNaN(eventId)) {
    return jsonError("event_id es requerido", 400)
  }

  try {
    const supabase = await createUserClient(cookies)
    const fields = await getFormFieldsByEventAdmin(supabase, eventId)

    return new Response(JSON.stringify(fields), {
      status: 200,
      headers: JSON_HEADERS,
    })
  } catch (error) {
    return jsonError(`Error fetching form fields: ${error}`, 500)
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const input = validateFieldInput(body)

    if (!input?.event_id) {
      return jsonError("event_id, name, label, type y required son requeridos", 400)
    }

    const supabase = await createUserClient(cookies)
    const field = await createFormField(supabase, {
      event_id: input.event_id,
      order: input.order,
      name: input.name,
      label: input.label,
      type: input.type,
      required: input.required,
      options: input.options,
      image_url: input.image_url,
    })

    return new Response(JSON.stringify(field), {
      status: 200,
      headers: JSON_HEADERS,
    })
  } catch (error) {
    return jsonError(`Error creating form field: ${error}`, 500)
  }
}

export const PUT: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const id = Number(body.id)

    if (!id || !Number.isFinite(id)) {
      return jsonError("id es requerido", 400)
    }

    const input = validateFieldInput(body)

    if (!input) {
      return jsonError("name, label, type y required son requeridos", 400)
    }

    const supabase = await createUserClient(cookies)
    const field = await updateFormField(supabase, id, {
      order: input.order,
      name: input.name,
      label: input.label,
      type: input.type,
      required: input.required,
      options: input.options,
      image_url: input.image_url,
    })

    return new Response(JSON.stringify(field), {
      status: 200,
      headers: JSON_HEADERS,
    })
  } catch (error) {
    return jsonError(`Error updating form field: ${error}`, 500)
  }
}

export const DELETE: APIRoute = async ({ url, cookies }) => {
  const id = Number(url.searchParams.get("id"))

  if (!id || Number.isNaN(id)) {
    return jsonError("id es requerido", 400)
  }

  try {
    const supabase = await createUserClient(cookies)
    await deleteFormField(supabase, id)

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: JSON_HEADERS,
    })
  } catch (error) {
    return jsonError(`Error deleting form field: ${error}`, 500)
  }
}
