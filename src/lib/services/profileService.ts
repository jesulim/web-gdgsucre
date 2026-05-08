import type { SupabaseClient } from "@supabase/supabase-js"
import { supabaseAdmin } from "../supabase"

export async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function getStaffRoles(
  supabase: SupabaseClient,
  userId: string
): Promise<Record<string, string>> {
  const staffRoles: Record<string, string> = {}

  if (!userId) return staffRoles

  const { data: rolesData, error } = await supabase
    .from("event_staff")
    .select("role, event_id, events(slug)")
    .eq("user_id", userId)

  if (error) {
    console.error("Error getting staff roles", error)
    return staffRoles
  }

  if (rolesData && rolesData.length > 0) {
    rolesData.forEach(row => {
      if (row.events?.slug) {
        staffRoles[row.events.slug] = row.role
      }
    })
  }

  return staffRoles
}

export async function getProfile(supabase: SupabaseClient) {
  const user = await getUser(supabase)
  if (!user) return null

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    console.error("Error getting profile", error)
  }

  if (!profile) {
    return {
      id: user.id,
      first_name: user.user_metadata.full_name,
      last_name: "",
      avatar_url: user?.user_metadata?.avatar_url,
      email: user?.user_metadata.email,
      is_admin: false,
    }
  }

  return {
    ...profile,
    email: user?.user_metadata.email,
  }
}

export async function getProfileById(supabase: SupabaseClient, profileId: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, email")
    .eq("id", profileId)
    .maybeSingle()

  if (error) {
    console.error("No se encontro el profile", error)
    return null
  }

  return profile
}

export async function createProfile(
  supabase: SupabaseClient,
  first_name: string,
  last_name: string,
  phone_number: string
) {
  const user = await getUser(supabase)
  if (!user) {
    throw new Error("No se pudo crear el perfil: No se pudo obtener el usuario")
  }

  const { data, error: profileError } = await supabase
    .from("profiles")
    .insert([
      {
        first_name: first_name,
        last_name: last_name,
        phone_number: phone_number,
        email: user.user_metadata.email,
        avatar_url: user.user_metadata.avatar_url,
      },
    ])
    .select("id, first_name, last_name, email")

  if (profileError) {
    throw new Error(`No se pudo crear el perfil: ${profileError.message}`)
  }

  return data
}

export async function createProfileOfOrganizer(
  supabase: SupabaseClient,
  registrationData: {
    first_name: string
    last_name: string
    phone_number: string
    email: string
    avatar_url: string
  }
) {
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email: registrationData.email,
    email_confirm: true, // no necesita confirmar email
    user_metadata: {
      full_name: `${registrationData.first_name} ${registrationData.last_name}`,
      avatar_url: registrationData.avatar_url,
    },
  })

  if (authError) {
    throw new Error(`No se pudo crear el usuario en auth: ${authError.message}`)
  }

  const userId = authData.user.id

  const { data, error: profileError } = await supabase
    .from("profiles")
    .insert([
      {
        id: userId,
        first_name: registrationData.first_name,
        last_name: registrationData.last_name,
        phone_number: registrationData.phone_number,
        email: registrationData.email,
        avatar_url: registrationData.avatar_url,
      },
    ])
    .select("id")

  if (profileError) {
    throw new Error(`No se pudo crear el perfil: ${profileError.message}`)
  }

  return { success: true, data }
}
