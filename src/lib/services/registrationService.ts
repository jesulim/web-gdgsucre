import type SupabaseClient from "@supabase/supabase-js/dist/module/SupabaseClient"

async function uploadFile(
  supabase: SupabaseClient,
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

export async function getEventRegistration(
  supabase: SupabaseClient,
  user_id: string,
  eventSlug: string
) {
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
    return null
  }

  return data
}

export async function getRegistrationsByEvent(
  supabase: SupabaseClient,
  eventSlug: string,
  role: string | null = null,
  orderBy = "profiles(first_name)"
) {
  let query = supabase
    .from("registrations")
    .select(
      "id, profiles(first_name, last_name, email), status, role, responses, events (slug)"
    )
    .eq("events.slug", eventSlug)
    .order(orderBy, { ascending: true })

  if (role) {
    query = query.eq("role", role)
  }

  const { data: registrations, error } = await query

  if (!registrations) {
    throw new Error(
      `No se encontraron registros para este evento: ${error.message}`
    )
  }

  const flattenedRegistrations = registrations?.map(
    ({ profiles, responses, events, ...rest }) => ({
      ...rest,
      ...profiles,
      ...responses,
    })
  )

  return flattenedRegistrations
}

export async function submitRegistration(
  supabase: SupabaseClient,
  { event_id, event_slug, fields }: Registration
) {
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    throw new Error("No se pudo obtener el usuario")
  }

  for (const [key, value] of Object.entries(fields)) {
    if (value instanceof File) {
      const filePath = await uploadFile(
        supabase,
        String(event_slug),
        key,
        value,
        user.id
      )
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
