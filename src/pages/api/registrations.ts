import { z } from "zod"

import { eventFromSlugParam, withAdmin, withStaffOrAdmin } from "@/lib/auth"
import { getRegistrationsByEvent, updateRegistration } from "@/lib/services/registrationService"

const UpdateRegistrationSchema = z.object({
  registrationId: z.coerce.number().int().positive(),
  values: z.object({ status: z.enum(["pending", "confirmed"]) }).strict(),
})

const RegistrationIdSchema = z.object({
  registrationId: z.coerce.number().int().positive(),
})

export const GET = withStaffOrAdmin(eventFromSlugParam("slug"), async ({ url, auth }) => {
  const slug = url.searchParams.get("slug")
  if (!slug) {
    return new Response("Event slug is required", { status: 400 })
  }

  try {
    const registrations = await getRegistrationsByEvent(auth.supabase, slug)

    return Response.json(registrations)
  } catch (error) {
    return new Response(`Error fetching registrations ${error}`, {
      status: 500,
    })
  }
})

export const POST = withAdmin(async ({ request, auth }) => {
  const parsed = UpdateRegistrationSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return Response.json(
      { error: "Datos inválidos", details: z.prettifyError(parsed.error) },
      { status: 400 }
    )
  }

  try {
    const { registrationId, values } = parsed.data
    const res = await updateRegistration(auth.supabase, registrationId, values)

    return Response.json(res)
  } catch (error) {
    return Response.json({ details: `Error al actualizar el registro: ${error}` }, { status: 500 })
  }
})

export const DELETE = withAdmin(async ({ request, auth }) => {
  const parsed = RegistrationIdSchema.safeParse(await request.json().catch(() => null))

  if (!parsed.success) {
    return new Response("Registration ID is required", { status: 400 })
  }

  try {
    const { data: deleted, error: deleteError } = await auth.supabase
      .from("registrations")
      .delete()
      .eq("id", parsed.data.registrationId)
      .select("id")

    if (deleteError) {
      return Response.json(
        { success: false, message: `Error al eliminar el registro ${deleteError.message}` },
        { status: 500 }
      )
    }

    if (!deleted?.length) {
      return Response.json({ success: false, message: "Registro no encontrado" }, { status: 404 })
    }

    return Response.json({ success: true, message: "Registro eliminado" })
  } catch (error) {
    return Response.json(
      {
        success: false,
        message: `Error al eliminar el registro ${error instanceof Error && error.message}`,
      },
      { status: 500 }
    )
  }
})
