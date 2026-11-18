import { z } from "zod"
import { type AuthContext, withAdmin } from "@/lib/auth"
import { uploadProfileAvatar } from "@/lib/services/profileService"

const profileIdSchema = z.string().trim().uuid("El profile_id no es un UUID válido")

export async function handleOrganizerAvatarUpload({
  request,
  auth,
}: AuthContext): Promise<Response> {
  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return Response.json({ error: "Datos del formulario inválidos" }, { status: 400 })
  }

  const file = formData.get("avatar") as File | null
  if (!file || typeof file === "string") {
    return Response.json({ error: "No se envió ninguna imagen de avatar" }, { status: 400 })
  }

  const rawProfileId = formData.get("profile_id")
  const parsedProfileId = profileIdSchema.safeParse(rawProfileId)
  if (!parsedProfileId.success) {
    return Response.json(
      { error: parsedProfileId.error.issues[0]?.message ?? "profile_id inválido" },
      { status: 400 }
    )
  }

  const result = await uploadProfileAvatar(auth.supabase, parsedProfileId.data, file)
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 500 })
  }

  return Response.json({ avatar_url: result.avatarUrl }, { status: 200 })
}

export const POST = withAdmin(handleOrganizerAvatarUpload)
