import type { APIRoute } from "astro"

import { getRegistrationsByEvent, updateRegistration } from "@/lib/services/registrationService"
import { createUserClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ url, cookies }) => {
  const slug = url.searchParams.get("slug")
  if (!slug) {
    return new Response("Event slug is required", { status: 400 })
  }

  const role = url.searchParams.get("role")

  try {
    const supabase = await createUserClient(cookies)
    const registrations = await getRegistrationsByEvent(supabase, slug, role)

    return new Response(JSON.stringify(registrations), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })
  } catch (error) {
    return new Response(`Error fetching registrations ${error}`, {
      status: 500,
    })
  }
}

export const POST: APIRoute = async ({ request, cookies }) => {
  const body = await request.json()
  const { registrationId, values } = body

  const supabase = await createUserClient(cookies)

  try {
    const res = await updateRegistration(supabase, registrationId, values)

    return new Response(JSON.stringify(res), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ details: `Error al actualizar el registro: ${error}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}

export const DELETE: APIRoute = async ({ cookies, request }) => {
  const body = await request.json()
  const { registrationId } = body

  if (!registrationId) {
    return new Response("Registration ID is required", { status: 400 })
  }

  try {
    const supabase = await createUserClient(cookies)
    const { error } = await supabase.from("registrations").delete().eq("id", registrationId)

    if (error) {
      return new Response(
        JSON.stringify({ success: false, message: `Error al eliminar el registro ${error}` }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return new Response(JSON.stringify({ success: true, message: "Registro eliminado" }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: `Error al eliminar el registro ${error instanceof Error && error.message}`,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
