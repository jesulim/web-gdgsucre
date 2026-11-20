import { type AuthContext, withAdmin } from "@/lib/auth"
import { uploadProfileAvatar } from "@/lib/services/profileService"
import { organizerAvatarSchema } from "@/lib/validators/organizerAvatar"

export async function handleOrganizerAvatarUpload({
  request,
  auth,
}: AuthContext): Promise<Response> {
  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return Response.json({ error: "Datos del formulario inválidos" }, { status: 400 })
  }

  const parsed = organizerAvatarSchema.safeParse({
    profile_id: formData.get("profile_id"),
    avatar: formData.get("avatar"),
  })

  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Datos inválidos" },
      { status: 400 }
    )
  }

  const result = await uploadProfileAvatar(
    auth.supabase,
    parsed.data.profile_id,
    parsed.data.avatar
  )
  if (!result.success) {
    return Response.json({ error: result.error }, { status: 500 })
  }

  return Response.json({ avatar_url: result.avatarUrl }, { status: 200 })
}

export const POST = withAdmin(handleOrganizerAvatarUpload)
