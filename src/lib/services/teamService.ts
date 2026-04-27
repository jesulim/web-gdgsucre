import type { SupabaseClient } from "@supabase/supabase-js"
import { customAlphabet } from "nanoid"
import { getRegistrationByUser } from "@/lib/services/registrationService"
import { getUser } from "./profileService"

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6)

export const MAX_TEAM_MEMBERS = 5

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
    throw new Error("Ya perteneces a otro equipo en este evento")
  }
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

export async function getTeamMembersCount(supabase: SupabaseClient, team_id: number) {
  const { count, error } = await supabase
    .from("team_registrations")
    .select("*", { count: "exact", head: true })
    .eq("team_id", team_id)

  if (error) throw new Error(`Error getting team members: ${error.message}`)

  return count ?? 0
}

export async function createTeam(
  supabase: SupabaseClient,
  { event_id, event_slug, name }: CreateTeamParams
) {
  const user = await getUser(supabase)
  if (!user) throw new Error("No se pudo obtener el usuario")

  const registration = await getRegistrationByUser(supabase, user.id, event_slug)
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

export async function joinTeam(
  supabase: SupabaseClient,
  { code, event_id, event_slug }: JoinTeamParams
) {
  const team = await getTeamByCode(supabase, code, event_id)
  if (!team) throw new Error("Código de equipo inválido o no pertenece a este evento")

  const memberCount = await getTeamMembersCount(supabase, team.id)
  if (memberCount >= MAX_TEAM_MEMBERS) {
    throw new Error("El equipo está lleno")
  }

  const user = await getUser(supabase)
  if (!user) throw new Error("No se pudo obtener el usuario")

  const registration = await getRegistrationByUser(supabase, user.id, event_slug)
  if (!registration) throw new Error("Debes registrarte al evento antes de unirte a un equipo")

  await assertNotInTeam(supabase, registration.id)

  // Asociar al usuario como miembro del equipo
  const { error: teamRegistrationError } = await supabase
    .from("team_registrations")
    .insert({ team_id: team.id, registration_id: registration.id, leader: false })

  if (teamRegistrationError) {
    throw new Error(`No se pudo unir al equipo: ${teamRegistrationError.message}`)
  }

  return { success: true, team }
}
