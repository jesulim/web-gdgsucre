import type { SupabaseClient } from "@supabase/supabase-js"

import { getRegistrationByUser } from "@/lib/services/registrationService"
import { customAlphabetNanoid } from "@/lib/utils"
import { getUser } from "./profileService"

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

  const code = customAlphabetNanoid()

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({ event_id, name, code })
    .select("id, name, code")
    .single()

  if (teamError || !team) {
    throw new Error(`No se pudo crear el equipo: ${teamError?.message}`)
  }

  // Asociar al creador como lider
  const { error: teamRegistrationError } = await supabase.from("team_registrations").insert({
    team_id: team.id,
    registration_id: registration.id,
    leader: true,
  })

  if (teamRegistrationError) {
    throw new Error(`No se pudo asociar el líder al equipo: ${teamRegistrationError.message}`)
  }

  return { success: true, team }
}
export async function createTeamAsAdmin(
  supabase: SupabaseClient,
  { event_id, name }: CreateTeamParams
) {
  const code = customAlphabetNanoid()

  const { data: team, error: teamError } = await supabase
    .from("teams")
    .insert({ event_id, name, code })
    .select("id, name, code")
    .single()

  if (teamError || !team) {
    throw new Error(`No se pudo crear el equipo: ${teamError?.message}`)
  }

  return { success: true, team }
}

export async function checkTeamAvailable(supabase: SupabaseClient, code: string, event_id: number) {
  const team = await getTeamByCode(supabase, code, event_id)
  if (!team) {
    return {
      team: null,
      error: "Código de equipo inválido o no pertenece a este evento",
    }
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
  if (!team || error) {
    const { error: deleteError } = await supabase
      .from("registrations")
      .delete()
      .eq("id", registration.id)

    if (deleteError) {
      console.error(`No se pudo eliminar el registro: ${deleteError.message}`)
    }

    throw new Error(error)
  }

  // Asociar al usuario como miembro del equipo
  const { error: teamRegistrationError } = await supabase.from("team_registrations").insert({
    team_id: team.id,
    registration_id: registration.id,
    leader: false,
  })

  if (teamRegistrationError) {
    throw new Error(`No se pudo unir al equipo: ${teamRegistrationError.message}`)
  }

  return { success: true, team }
}

export async function listMembers(
  supabase: SupabaseClient,
  team_id: number,
  registration_id: number
): Promise<TeamMember[]> {
  const user = await getUser(supabase)
  if (!user) throw new Error("No se pudo obtener el usuario")

  // Verificar que el registration_id pertenece al usuario y es líder del team_id en una sola query
  const { data: leaderCheck, error: leaderError } = await supabase
    .from("team_registrations")
    .select("registration_id")
    .eq("team_id", team_id)
    .eq("registration_id", registration_id)
    .eq("leader", true)
    .maybeSingle()

  if (leaderError) throw new Error(`Error verificando liderazgo: ${leaderError.message}`)
  if (!leaderCheck) throw new Error("No eres líder de este equipo")

  // Verificar que el registration_id pertenece al usuario autenticado
  const { data: registrationOwnership, error: ownershipError } = await supabase
    .from("registrations")
    .select("id")
    .eq("id", registration_id)
    .eq("user_id", user.id)
    .maybeSingle()

  if (ownershipError) throw new Error(`Error verificando propiedad: ${ownershipError.message}`)
  if (!registrationOwnership) throw new Error("Esta inscripción no te pertenece")

  // Obtener todos los miembros del equipo
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
    .eq("team_id", team_id)
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

export interface AdminTeamMember {
  registration_id: number
  first_name: string
  last_name: string
  email: string
  avatar_url: string
  status: string
  leader: boolean
}

export interface AdminTeamGroup {
  id: number
  name: string
  code: string
  members: AdminTeamMember[]
}

export interface AdminTeamsData {
  teams: AdminTeamGroup[]
  sinEquipo: AdminTeamMember[]
}

export async function getTeamsWithMembersByEvent(
  supabase: SupabaseClient,
  eventSlug: string
): Promise<AdminTeamsData> {
  const { data: teamsData, error: teamsError } = await supabase
    .from("teams")
    .select(
      `id, name, code,
      team_registrations(
        leader,
        registration_id,
        registrations!inner(
          id, status,
          profiles!inner(first_name, last_name, email, avatar_url)
        )
      ),
      events!inner(slug)`
    )
    .eq("events.slug", eventSlug)
    .order("name", { ascending: true })

  if (teamsError) throw new Error(`Error obteniendo equipos: ${teamsError.message}`)
  const teamRegistrationIds = new Set<number>()
  const teams: AdminTeamGroup[] = (teamsData ?? []).map(team => {
    const members: AdminTeamMember[] = (team.team_registrations ?? []).map(tr => {
      teamRegistrationIds.add(tr.registration_id)
      const reg = tr.registrations as unknown as {
        id: number
        status: string
        profiles: { first_name: string; last_name: string; email: string; avatar_url: string }
      }
      return {
        registration_id: tr.registration_id,
        first_name: reg.profiles.first_name,
        last_name: reg.profiles.last_name,
        avatar_url: reg.profiles.avatar_url,
        email: reg.profiles.email ?? "",
        status: reg.status,
        leader: tr.leader,
      }
    })
    // ordenando para mostrar al lider primero
    members.sort((a, b) => (b.leader ? 1 : 0) - (a.leader ? 1 : 0))
    return { id: team.id, name: team.name, code: team.code, members }
  })

  // usuarios sin equipo
  const { data: allRegs, error: allRegsError } = await supabase
    .from("registrations")
    .select(
      `id, status,
      profiles!inner(id, first_name, last_name, email, avatar_url),
      events!inner(slug)`
    )
    .eq("events.slug", eventSlug)
    .order("created_at", { ascending: true })

  const { data: organizers } = await supabase
    .from("organizers")
    .select("profile_id, events!inner(slug)")
    .eq("events.slug", eventSlug)

  const organizerIds = organizers?.map(organizer => organizer.profile_id)

  if (allRegsError) throw new Error(`Error obteniendo registros: ${allRegsError.message}`)

  const sinEquipo: AdminTeamMember[] = (allRegs ?? [])
    .filter(reg => !teamRegistrationIds.has(reg.id))
    .map(reg => {
      const profiles = reg.profiles as unknown as {
        first_name: string
        last_name: string
        email: string
        avatar_url: string
      }
      return {
        registration_id: reg.id,
        first_name: profiles.first_name,
        last_name: profiles.last_name,
        email: profiles.email ?? "",
        avatar_url: profiles.avatar_url,
        status: reg.status,
        leader: false as const,
        organizer: organizerIds?.includes(reg.profiles.id),
      }
    })

  return { teams, sinEquipo }
}

export async function deleteMember(supabase: SupabaseClient, target_registration_id: number) {
  const user = await getUser(supabase)
  if (!user) throw new Error("No se pudo obtener el usuario")

  // Encontrar el equipo del target y verificar que el usuario autenticado es líder del mismo equipo
  const { data: teamInfo, error: teamError } = await supabase
    .from("team_registrations")
    .select(
      `
      team_id,
      registration_id,
      leader,
      registrations!inner(user_id)
    `
    )
    .eq("registration_id", target_registration_id)
    .maybeSingle()

  if (teamError) throw new Error(`Error obteniendo información del equipo: ${teamError.message}`)
  if (!teamInfo) throw new Error("Registro no encontrado o no pertenece a ningún equipo")

  // Verificar que el usuario autenticado es líder del mismo equipo
  const { data: leaderCheck, error: leaderError } = await supabase
    .from("team_registrations")
    .select("registration_id, registrations!inner(user_id)")
    .eq("team_id", teamInfo.team_id)
    .eq("leader", true)
    .maybeSingle()

  if (leaderError) throw new Error(`Error verificando liderazgo: ${leaderError.message}`)
  if (!leaderCheck || leaderCheck.registrations.user_id !== user.id) {
    throw new Error("Solo el líder puede eliminar miembros del equipo")
  }

  if (leaderCheck.registration_id === target_registration_id) {
    throw new Error("No se puede eliminar al líder del equipo")
  }

  // Eliminar registration → CASCADE elimina team_registrations automáticamente
  const { error } = await supabase.from("registrations").delete().eq("id", target_registration_id)

  if (error) throw new Error(`Error eliminando miembro: ${error.message}`)

  return { success: true }
}

export async function deleteMemberAsAdmin(
  supabase: SupabaseClient,
  target_registration_id: number
) {
  const user = await getUser(supabase)
  if (!user) throw new Error("No se pudo obtener el usuario")

  // Encontrar el equipo del target y verificar que el usuario autenticado es líder del mismo equipo
  const { data: teamInfo, error: teamError } = await supabase
    .from("team_registrations")
    .select(
      `
      team_id,
      registration_id,
      leader,
      registrations!inner(user_id)
    `
    )
    .eq("registration_id", target_registration_id)
    .maybeSingle()

  if (teamError) throw new Error(`Error obteniendo información del equipo: ${teamError.message}`)
  if (!teamInfo) throw new Error("Registro no encontrado o no pertenece a ningún equipo")

  const { data: leaderCheck, error: leaderError } = await supabase
    .from("team_registrations")
    .select("registration_id, registrations!inner(user_id)")
    .eq("team_id", teamInfo.team_id)
    .eq("leader", true)
    .maybeSingle()

  if (leaderError) throw new Error(`Error verificando liderazgo: ${leaderError.message}`)

  const { error: deleteError } = await supabase
    .from("team_registrations")
    .delete()
    .eq("registration_id", target_registration_id)

  if (deleteError) throw new Error(`Error eliminando miembro: ${deleteError.message}`)

  return { message: "Miembro eliminado con éxito" }
}
