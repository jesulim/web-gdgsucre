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
    .select("role, status, events (slug)")
    .eq("user_id", user_id)
    .eq("events.slug", eventSlug)
    .single()

  if (error) {
    return null
  }

  return data
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
      const filePath = await uploadFile(supabase, String(event_slug), key, value, user.id)
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

export async function getRegistrationsByEvent(
  supabase: SupabaseClient,
  eventSlug: string,
  role: string | null = null,
  orderBy = "created_at"
) {
  let query = supabase
    .from("registrations")
    .select(
      "id, created_at, profiles(first_name, last_name, email, phone_number), status, role, responses, events (slug)"
    )
    .eq("events.slug", eventSlug)
    .order(orderBy, { ascending: false })

  if (role) {
    query = query.eq("role", role)
  }

  const { data: registrations, error } = await query

  if (!registrations) {
    throw new Error(`No se encontraron registros para este evento: ${error.message}`)
  }

  const flattenedRegistrations = registrations?.map(({ profiles, responses, events, ...rest }) => ({
    ...rest,
    ...profiles,
    ...responses,
  }))

  return flattenedRegistrations
}

export async function updateRegistration(
  supabase: SupabaseClient,
  registrationId: number,
  values: Record<string, string | number>
) {
  const { data: registration, error: findError } = await supabase
    .from("registrations")
    .select("id, status")
    .eq("id", registrationId)
    .single()

  if (findError || !registration) {
    throw new Error(`No se encontró el registro: ${findError?.message || "No existe registro"}`)
  }

  const { error: updateError } = await supabase
    .from("registrations")
    .update(values)
    .eq("id", registration.id)

  if (updateError) {
    throw new Error(`Error actualizando estado del registro: ${updateError.message}`)
  }

  return { success: true }
}

export async function getRegistrationsWithActivities(
  supabase: SupabaseClient,
  event_slug: string,
  role: string
) {
  const query = supabase
    .from("registrations_with_activities")
    .select("id, first_name, last_name, package, dietary_restriction, activities")
    .eq("slug", event_slug)

  if (role === "Participante" || role === "Organizer") {
    query.eq("role", role)
  }

  const { data, error } = await query.order("first_name", { ascending: true })
  if (error) {
    throw new Error(`Error fetching registrations with activities: ${error.message}`)
  }

  return data?.map(({ activities, ...rest }) => ({ ...rest, ...activities }))
}

export async function updateRegistrationActivity(
  supabase: SupabaseClient,
  registrationId: number,
  name: string,
  value: boolean
) {
  const { data: activity, error: activityError } = await supabase
    .from("activities")
    .select("id")
    .eq("name", name)
    .single()

  if (activityError) throw activityError

  const { error } = await supabase.from("registration_activities").upsert(
    {
      registration_id: registrationId,
      activity_id: activity.id,
      completed: value,
    },
    { onConflict: "registration_id,activity_id" }
  )

  if (error) throw error

  return { success: true }
}

export async function getRandomRegistrations(
  supabase: SupabaseClient,
  limit: number | null = null,
  role: string | null = null
) {
  let query = supabase
    .from("registrations")
    .select(
      "id, created_at, profiles(first_name, last_name, email, phone_number), status, role, responses, events (slug)"
    )
    .eq("events.slug", "io-extended-25")

  // Filtrar por rol si se especifica
  if (role && (role === "Participante" || role === "Organizer")) {
    query = query.eq("role", role)
  }

  const { data: registrations, error } = await query

  if (error) {
    throw new Error(`Error obteniendo registros: ${error.message}`)
  }

  if (!registrations || registrations.length === 0) {
    return []
  }

  // Si no hay límite, devolver todos los registros mezclados
  // Si hay límite, tomar solo esa cantidad
  let aleatorios = registrations.sort(() => 0.5 - Math.random())

  if (limit !== null && limit > 0) {
    aleatorios = aleatorios.slice(0, Math.min(limit, registrations.length))
  }

  const flattenedRegistrations = aleatorios.map(({ profiles, responses, events, ...rest }) => ({
    ...rest,
    ...profiles,
    ...responses,
  }))

  return flattenedRegistrations
}
