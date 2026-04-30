import type { SupabaseClient } from "@supabase/supabase-js"
import { customAlphabet } from "nanoid"
import { getRegistrationByUser } from "@/lib/services/registrationService"
import { getUser } from "./profileService"

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6)

export const MAX_TEAM_MEMBERS = 5

export interface TeamMember {
  registration_id: number
  leader: boolean
  user_id: string
  first_name: string
  last_name: string
  email: string | null
}

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

export async function listMembers(
  supabase: SupabaseClient,
  event_id: number
): Promise<TeamMember[]> {
  const user = await getUser(supabase)
  if (!user) throw new Error("No se pudo obtener el usuario")

  const userRegistration = await getRegistrationByUser(supabase, user.id, event_id)
  if (!userRegistration) throw new Error("No se encontró el registro del usuario para este evento")

  const team = await getTeamByRegistration(supabase, userRegistration.id)
  if (!team) throw new Error("No pertenecés a ningún equipo")

  if (!team.leader) throw new Error("Solo el líder puede ver los miembros del equipo")

  // Obtener todos los miembros con sus perfiles
  const { data, error } = await supabase
    .from("team_registrations")
    .select(
      `registration_id,
      leader,
      registrations!inner(
        user_id,
        profiles!inner(
          first_name,
          last_name,
          email
        )
      )`
    )
    .eq("team_id", team.id)
    .order("leader", { ascending: false })

  if (error) throw new Error(`Error obteniendo miembros: ${error.message}`)

  return (
    data?.map(member => ({
      registration_id: member.registration_id,
      leader: member.leader,
      user_id: member.registrations.user_id,
      first_name: member.registrations.profiles.first_name,
      last_name: member.registrations.profiles.last_name,
      email: member.registrations.profiles.email,
    })) ?? []
  )
}

export async function deleteMember(
  supabase: SupabaseClient,
  target_registration_id: number,
  event_id: number
) {
  const user = await getUser(supabase)
  if (!user) throw new Error("No se pudo obtener el usuario")

  const leaderRegistration = await getRegistrationByUser(supabase, user.id, event_id)
  if (!leaderRegistration)
    throw new Error("No se encontró el registro del usuario para este evento")

  // Obtener el equipo a partir del registration del líder
  const team = await getTeamByRegistration(supabase, leaderRegistration.id)
  if (!team) throw new Error("No pertenecés a ningún equipo")

  if (!team.leader) throw new Error("Solo el líder puede eliminar miembros del equipo")

  if (leaderRegistration.id === target_registration_id) {
    throw new Error("No se puede eliminar al líder del equipo")
  }

  // Verificar que el target pertenece al mismo equipo
  const { data: targetMembership, error: membershipError } = await supabase
    .from("team_registrations")
    .select("registration_id")
    .eq("team_id", team.id)
    .eq("registration_id", target_registration_id)
    .maybeSingle()

  if (membershipError) throw new Error(`Error verificando membresía: ${membershipError.message}`)
  if (!targetMembership) throw new Error("El miembro no pertenece a tu equipo")

  // Eliminar registration → CASCADE elimina team_registrations automáticamente
  const { error } = await supabase.from("registrations").delete().eq("id", target_registration_id)

  if (error) throw new Error(`Error eliminando miembro: ${error.message}`)

  return { success: true }
}
