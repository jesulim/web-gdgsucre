import type { SupabaseClient } from "@supabase/supabase-js"
import { customAlphabet } from "nanoid"
import { getRegistrationByUser } from "@/lib/services/registrationService"

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6)

interface CreateTeamParams {
  event_id: number
  event_slug: string
  name: string
}

interface JoinTeamParams {
  code: string
  event_id: number
  event_slug: string
}

async function assertNotInTeam(supabase: SupabaseClient, registration_id: number): Promise<void> {
  const { data } = await supabase
    .from("team_registrations")
    .select("id")
    .eq("registration_id", registration_id)
    .maybeSingle()

  if (data) {
    throw new Error("Ya pertenecés a un equipo en este evento")
  }
}

export async function createTeam(
  supabase: SupabaseClient,
  { event_id, event_slug, name }: CreateTeamParams
) {
  // 1. Verificar que el usuario esta autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No se pudo obtener el usuario")

  // 2. Verificar que el usuario esta registrado al evento
  const registration = await getRegistrationByUser(supabase, user.id, event_slug)
  if (!registration) throw new Error("Debés registrarte al evento antes de crear un equipo")

  // 3. Verificar que el usuario no esta ya en un equipo
  await assertNotInTeam(supabase, registration.id)

  // 4. Generar código unico y crear el equipo
  const code = nanoid()

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({ event_id, name, code })
    .select("id, name, code")
    .single()

  if (teamError || !team) {
    throw new Error(`No se pudo crear el equipo: ${teamError?.message}`)
  }

  // 5. Asociar al creador como lider
  const { error: teamRegistrationError } = await supabase
    .from("team_registrations")
    .insert({ team_id: team.id, registration_id: registration.id, leader: true })

  if (teamRegistrationError) {
    throw new Error(`No se pudo asociar el líder al equipo: ${teamRegistrationError.message}`)
  }

  return { success: true, team }
}

export async function joinTeam(
  supabase: SupabaseClient,
  { code, event_id, event_slug }: JoinTeamParams
) {
  // 1. Verificar que el usuario esta autenticado
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error("No se pudo obtener el usuario")

  // 2. Verificar que el equipo existe y pertenece al evento
  const team = await getTeamByCode(supabase, code, event_id)
  if (!team) throw new Error("Código de equipo inválido o no pertenece a este evento")

  // 3. Verificar que el usuario esta registrado al evento
  const registration = await getRegistrationByUser(supabase, user.id, event_slug)
  if (!registration) throw new Error("Debés registrarte al evento antes de unirte a un equipo")

  // 4. Verificar que el usuario no esta ya en un equipo
  await assertNotInTeam(supabase, registration.id)

  // 5. Asociar al usuario como miembro del equipo
  const { error: teamRegistrationError } = await supabase
    .from("team_registrations")
    .insert({ team_id: team.id, registration_id: registration.id, leader: false })

  if (teamRegistrationError) {
    throw new Error(`No se pudo unir al equipo: ${teamRegistrationError.message}`)
  }

  return { success: true, team }
}

export async function getTeamByCode(supabase: SupabaseClient, code: string, event_id: number) {
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, code, event_id")
    .eq("code", code)
    .eq("event_id", event_id)
    .single()

  if (error) return null

  return data
}

export async function getTeamByRegistration(supabase: SupabaseClient, registration_id: number) {
  const { data, error } = await supabase
    .from("team_registrations")
    .select(
      `leader,
      teams(
        id, name, code, event_id
      )`
    )
    .eq("registration_id", registration_id)
    .single()

  if (error) return null

  return {
    leader: data.leader,
    ...data.teams,
  }
}
