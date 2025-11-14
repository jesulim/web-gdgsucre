import { FunctionsHttpError } from "@supabase/supabase-js"
import type SupabaseClient from "@supabase/supabase-js/dist/module/SupabaseClient"
import { customAlphabet } from "nanoid"

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789")

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

export async function hasRegistration(
  supabase: SupabaseClient,
  user_id: string,
  eventSlug: string
) {
  const { data } = await supabase
    .from("registrations")
    .select("id, events!inner(slug)")
    .eq("user_id", user_id)
    .eq("events.slug", eventSlug)
    .maybeSingle()

  return !!data
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
    .select("status, events!inner(slug), qr_url")
    .eq("user_id", user_id)
    .eq("events.slug", eventSlug)
    .single()

  const { data: organizer } = await supabase
    .from("organizers")
    .select("events!inner(slug)")
    .eq("profile_id", user_id)
    .eq("events.slug", eventSlug)
    .maybeSingle()

  if (error) {
    return null
  }

  return { ...data, role: organizer ? "Organizador" : "Participante" }
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
  orderBy = "created_at"
) {
  const { data: registrations, error } = await supabase
    .from("registrations")
    .select(
      `id,
      created_at,
      profiles(
        id,
        first_name,
        last_name,
        email,
        phone_number
      ),
      status,
      responses,
      events!inner(slug)`
    )
    .eq("events.slug", eventSlug)
    .order(orderBy, { ascending: false })

  const { data: organizers, error: organizersError } = await supabase
    .from("organizers")
    .select("profile_id, events!inner(slug)")
    .eq("events.slug", eventSlug)

  if (error || organizersError || !registrations) {
    throw new Error(
      `No se encontraron registros para este evento: ${error?.message || organizersError?.message}`
    )
  }

  const organizerIds = organizers?.map(organizer => organizer.profile_id)
  const flattenedRegistrations = registrations?.map(
    ({ id, profiles, responses, events, ...rest }) => ({
      ...rest,
      ...profiles,
      ...responses,
      id,
      role: organizerIds?.includes(profiles.id) ? "Organizer" : "Participante",
    })
  )

  return flattenedRegistrations
}

export async function confirmRegistration(supabase: SupabaseClient, registrationId: number) {
  const { data: registration, error: findError } = await supabase
    .from("registrations")
    .select("id, token")
    .eq("id", registrationId)
    .single()

  if (findError || !registration) {
    throw new Error(`No se encontró el registro: ${findError?.message}`)
  }

  // Skip token generation if exists
  if (registration.token) {
    return { success: true, token: registration.token }
  }

  const token = nanoid(6)

  const { data: qrData, error: qrError } = await supabase.functions.invoke("generate-qr", {
    body: { token, registrationId: registration.id },
  })

  if (qrError instanceof FunctionsHttpError) {
    const errorMessage = await qrError.context.json()
    throw new Error(`Error generando el QR: ${JSON.stringify(errorMessage)}`)
  } else if (qrError) {
    throw new Error(`Error generando el QR: ${qrError.message}`)
  }

  if (!qrData?.publicUrl) {
    throw new Error("Invalid response from QR generation service")
  }

  const { error: updateError } = await supabase
    .from("registrations")
    .update({
      token,
      status: "confirmed",
      qr_url: qrData.publicUrl,
    })
    .eq("id", registrationId)

  if (updateError) {
    throw new Error(`Error actualizando el registro: ${updateError.message}`)
  }

  return { success: true, token }
}

export async function updateRegistration(
  supabase: SupabaseClient,
  registrationId: number,
  values: Record<string, string | number>
) {
  const { error: updateError } = await supabase
    .from("registrations")
    .update(values)
    .eq("id", registrationId)

  if (updateError) {
    throw new Error(`Error actualizando estado del registro: ${updateError.message}`)
  }

  return { success: true }
}

export async function getRegistrationsWithActivities(
  supabase: SupabaseClient,
  event_slug: string,
  role: string,
  packageName: string
) {
  const query = supabase
    .from("registrations_with_activities")
    .select("id, first_name, last_name, role, package, dietary_restriction, activities")
    .eq("slug", event_slug)

  if (role === "Participante" || role === "Organizer") {
    query.eq("role", role)
  }

  if (packageName && packageName !== "Todos los paquetes") {
    query.eq("package", packageName)
  }

  const { data, error } = await query.order("first_name", { ascending: true })
  if (error) {
    throw new Error(`Error fetching registrations with activities: ${error.message}`)
  }

  return data?.map(({ activities, ...rest }) => ({ ...rest, ...activities }))
}

// Caché simple para almacenar los IDs de actividades
const activityCache = new Map<string, number>()

export async function updateRegistrationActivity(
  supabase: SupabaseClient,
  registrationId: number,
  eventSlug: string,
  name: string,
  value: boolean
) {
  const cacheKey = `${eventSlug}:${name}`
  let activityId = activityCache.get(cacheKey)

  // Solo consultar si no está en caché
  if (!activityId) {
    const { data: activity, error: activityError } = await supabase
      .from("activities")
      .select("id, events!inner(slug)")
      .eq("name", name)
      .eq("events.slug", eventSlug)
      .single()

    if (activityError) throw activityError

    activityId = activity.id
    activityCache.set(cacheKey, activityId)
  }

  const { error } = await supabase.from("registration_activities").upsert(
    {
      registration_id: registrationId,
      activity_id: activityId,
      completed: value,
    },
    { onConflict: "registration_id,activity_id" }
  )

  if (error) throw new Error(`Error updating activity: ${error.message}`)

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

export async function getRegistrationData(supabase: SupabaseClient, registrationId: string) {
  const { data, error } = await supabase
    .from("registrations")
    .select("user_id, event_id")
    .eq("id", registrationId)
    .single()

  if (error || !data) {
    return null
  }

  return {
    profile_id: data.user_id,
    event_id: data.event_id,
  }
}

export async function getRegistrationByToken(supabase: SupabaseClient, token: string) {
  const { data, error } = await supabase
    .from("registrations")
    .select("id, profiles(first_name, last_name)")
    .eq("token", token)
    .maybeSingle()

  if (error || !data) {
    return null
  }

  return {
    id: data.id,
    first_name: data.profiles.first_name,
    last_name: data.profiles.last_name,
  }
}
