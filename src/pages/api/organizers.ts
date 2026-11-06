import { z } from "zod"
import { withAdmin } from "@/lib/auth"
import {
  addOrganizer,
  getOrganizersForAdmin,
  removeOrganizerById,
} from "@/lib/services/organizersService"

const slugSchema = z.string().trim().min(1, "slug es requerido")

// Empty strings become undefined so the service can fall back to auth metadata.
const optionalText = z
  .string()
  .trim()
  .transform(value => value || undefined)
  .optional()

const addOrganizerSchema = z.object({
  email: z.string().trim().toLowerCase().email("El correo electrónico no es válido"),
  eventSlug: z.string().trim().min(1, "eventSlug es requerido"),
  first_name: optionalText,
  last_name: optionalText,
  phone_number: optionalText,
})

const updateOrganizerSchema = z.object({
  id: z.coerce.number().int().positive(),
  first_name: z.string().trim().min(1).optional(),
  last_name: z.string().trim().min(1).optional(),
  phone_number: z
    .string()
    .trim()
    .transform(value => value || null)
    .optional(),
})

const deleteOrganizerSchema = z.object({
  id: z.coerce.number().int().positive(),
})

export const GET = withAdmin(async ({ url, auth }) => {
  try {
    const parsed = slugSchema.safeParse(url.searchParams.get("slug"))

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "slug es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const organizers = await getOrganizersForAdmin(auth.supabase, parsed.data)

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
})

export const POST = withAdmin(async ({ request, auth }) => {
  try {
    const parsed = addOrganizerSchema.safeParse(await request.json())

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: parsed.error.issues[0]?.message ?? "Datos inválidos" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const result = await addOrganizer(auth.supabase, parsed.data)

    if (!result.success) {
      const status =
        result.reason === "already_organizer"
          ? 400
          : result.reason === "user_not_found" || result.reason === "event_not_found"
            ? 404
            : 500

      return new Response(
        JSON.stringify({
          error: result.message || "No se pudo agregar el organizador",
          reason: result.reason,
        }),
        {
          status,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    return new Response(
      JSON.stringify({
        message: "Organizador agregado exitosamente",
        data: result.data,
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    return new Response(JSON.stringify({ error: `Error al agregar organizador: ${error}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})

export const DELETE = withAdmin(async ({ request, auth }) => {
  try {
    const parsed = deleteOrganizerSchema.safeParse(await request.json())

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "El ID del organizador es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const success = await removeOrganizerById(auth.supabase, parsed.data.id)
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
})

export const PUT = withAdmin(async ({ request, auth }) => {
  try {
    const parsed = updateOrganizerSchema.safeParse(await request.json())

    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "El ID del organizador es requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { id, first_name, last_name, phone_number } = parsed.data

    const { data: organizer } = await auth.supabase
      .from("organizers")
      .select("profile_id")
      .eq("id", id)
      .single()

    if (!organizer) {
      return new Response(JSON.stringify({ error: "Organizador no encontrado" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      })
    }

    const { error: updateError } = await auth.supabase
      .from("profiles")
      .update({
        first_name,
        last_name,
        phone_number: phone_number ?? null,
      })
      .eq("id", organizer.profile_id)

    if (updateError) {
      console.error("Error al actualizar el organizador", updateError)
      throw updateError
    }

    return new Response(JSON.stringify({ message: "Organizador actualizado correctamente" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: `Error al actualizar: ${error}` }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
