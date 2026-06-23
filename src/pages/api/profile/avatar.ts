import type { APIRoute } from "astro"

import { createUserClient } from "@/lib/supabase"

export const POST: APIRoute = async ({ request, cookies }) => {
  const supabase = await createUserClient(cookies)

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return new Response("No autorizado", { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("avatar") as File | null
  if (!file) {
    return new Response("No se envió ninguna imagen", { status: 400 })
  }

  const fileExt = file.name.split(".").pop() || "png"
  const filePath = `profile_pics/${user.id}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("assets")
    .upload(filePath, file, { upsert: true, contentType: file.type })

  if (uploadError) {
    return new Response(`Error al subir la imagen: ${uploadError.message}`, { status: 500 })
  }

  const { data: publicUrl } = supabase.storage.from("assets").getPublicUrl(filePath)

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl.publicUrl })
    .eq("id", user.id)

  if (updateError) {
    return new Response(`Error al actualizar el perfil: ${updateError.message}`, { status: 500 })
  }

  return new Response(JSON.stringify({ avatar_url: publicUrl.publicUrl }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
