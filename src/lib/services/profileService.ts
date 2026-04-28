import type { SupabaseClient } from "@supabase/supabase-js"

type EventStaffRoleRow = {
  role: string | null
}

export async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function getProfile(supabase: SupabaseClient, eventId?: number) {
  const user = await getUser(supabase)
  if (!user) return null

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, is_admin")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    return null
  }

  let role: string | null = null
  if (eventId !== undefined) {
    const { data: staffData } = await supabase
      .from("event_staff")
      .select("role")
      .eq("user_id", user.id)
      .eq("event_id", eventId)
      .maybeSingle()

    const staffRole = staffData as EventStaffRoleRow | null
    role = staffRole?.role ?? null
  }

  if (!profile) {
    return {
      id: user.id,
      first_name: user.user_metadata.full_name,
      last_name: "",
      avatar_url: user?.user_metadata?.avatar_url,
      email: user?.user_metadata.email,
      is_admin: false,
      role,
    }
  }

  return {
    ...profile,
    email: user?.user_metadata.email,
    role,
  }
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
