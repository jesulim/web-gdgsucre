import { supabase } from "@/lib/supabase"

async function uploadFile(
  event_slug: string,
  key: string,
  file: File,
  user_id: string
) {
  const fileExt = file.name.split(".").pop()
  const filePath = `${event_slug}/${key}/${user_id}.${fileExt}`

  const { error: uploadError } = await supabase.storage
    .from("event-uploads")
    .upload(filePath, file, {
      upsert: true,
      contentType: file.type,
    })

  if (uploadError) {
    throw new Error(`No se pudo subir el archivo: ${uploadError.message}`)
  }

  return filePath
}

interface Registration {
  event_id: FormDataEntryValue
  event_slug: FormDataEntryValue
  fields: { [k: string]: string | File }
}

export async function getEventRegistration(user_id: string, eventSlug: string) {
  if (!user_id) {
    return null
  }

  const { data, error } = await supabase
    .from("registrations")
    .select("status, events (slug)")
    .eq("user_id", user_id)
    .eq("events.slug", eventSlug)
    .single()

  if (error) {
    console.error(error)
    return null
  }

  return data
}

export async function submitRegistration({
  event_id,
  event_slug,
  fields,
}: Registration) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No se pudo obtener el usuario")
  }

  for (const [key, value] of Object.entries(fields)) {
    if (value instanceof File) {
      const filePath = await uploadFile(String(event_slug), key, value, user.id)
      fields[key] = filePath
    }
  }

  const { error: insertError } = await supabase.from("registrations").insert([
    {
      user_id: user.id,
      event_id: event_id,
      role: "Participante",
      responses: fields,
    },
  ])

  if (insertError) {
    throw new Error(`Error en registro: ${insertError.message}`)
  }

  return { success: true }
}
