import type { SupabaseClient } from "@supabase/supabase-js"
import { customAlphabet } from "nanoid"
import { getRegistrationByUser } from "@/lib/services/registrationService"
import { getUser } from "./profileService"

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6)

export const MAX_TEAM_MEMBERS = 5

interface CreateTeamParams {
  event_id: number
  name: string
}

interface JoinTeamParams {
  code: string
  event_id: number
}

async function assertNotInTeam(supabase: SupabaseClient, registration_id: number): Promise<void> {
  const { data, error } = await supabase
    .from("team_registrations")
    .select("id")
    .eq("registration_id", registration_id)
    .maybeSingle()

  if (error) throw new Error(`Error al obtener el equipo: ${error.message}`)

  if (data) {
    throw new Error("Ya perteneces a otro equipo en este evento")
  }
}

export async function getTeamByCode(supabase: SupabaseClient, code: string, event_id: number) {
  const { data, error } = await supabase
    .from("teams")
    .select("id, name, code, event_id")
    .eq("code", code)
    .eq("event_id", event_id)
    .maybeSingle()

  if (error) throw new Error(`Error al obtener el equipo: ${error.message}`)

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
    .maybeSingle()

  if (error) throw new Error(`Error al obtener el equipo: ${error.message}`)
  if (!data) return null

  return {
    leader: data.leader,
    ...data.teams,
  }
}

export async function getTeamMembersCount(supabase: SupabaseClient, team_id: number) {
  const { count, error } = await supabase
    .from("team_registrations")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team_id)

  if (error) throw new Error(`Error getting team members: ${error.message}`)

  return count ?? 0
}

export async function createTeam(supabase: SupabaseClient, { event_id, name }: CreateTeamParams) {
  const user = await getUser(supabase)
  if (!user) throw new Error("No se pudo obtener el usuario")

  const registration = await getRegistrationByUser(supabase, user.id, event_id)
  if (!registration) throw new Error("Debes registrarte al evento antes de crear un equipo")

  await assertNotInTeam(supabase, registration.id)

  const code = nanoid()

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({ event_id, name, code })
    .select("id, name, code")
    .single()

  if (teamError || !team) {
    throw new Error(`No se pudo crear el equipo: ${teamError?.message}`)
  }

  // Asociar al creador como lider
  const { error: teamRegistrationError } = await supabase
    .from("team_registrations")
    .insert({ team_id: team.id, registration_id: registration.id, leader: true })

  if (teamRegistrationError) {
    throw new Error(`No se pudo asociar el líder al equipo: ${teamRegistrationError.message}`)
  }

  return { success: true, team }
}

async function checkTeamAvailable(supabase: SupabaseClient, code: string, event_id: number) {
  const team = await getTeamByCode(supabase, code, event_id)
  if (!team) {
    return { team: null, error: "Código de equipo inválido o no pertenece a este evento" }
  }

  const memberCount = await getTeamMembersCount(supabase, team.id)
  if (memberCount >= MAX_TEAM_MEMBERS) {
    return { team: null, error: "El equipo está lleno" }
  }

  return { team, error: null }
}

export async function joinTeam(supabase: SupabaseClient, { code, event_id }: JoinTeamParams) {
  const user = await getUser(supabase)
  if (!user) throw new Error("No se pudo obtener el usuario")

  const registration = await getRegistrationByUser(supabase, user.id, event_id)
  if (!registration) throw new Error("Debes registrarte al evento antes de unirte a un equipo")

  await assertNotInTeam(supabase, registration.id)

  const { team, error } = await checkTeamAvailable(supabase, code, event_id)

  // Eliminar registro si el equipo no está disponible
  if (error || !team) {
    await supabase.from("team_registrations").delete().eq("registration_id", registration.id)
    throw new Error(error)
  }

  // Asociar al usuario como miembro del equipo
  const { error: teamRegistrationError } = await supabase
    .from("team_registrations")
    .insert({ team_id: team.id, registration_id: registration.id, leader: false })

  if (teamRegistrationError) {
    throw new Error(`No se pudo unir al equipo: ${teamRegistrationError.message}`)
  }

  return { success: true, team }
}
