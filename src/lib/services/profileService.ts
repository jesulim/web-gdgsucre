import type { SupabaseClient } from "@supabase/supabase-js"

export async function getUser(supabase: SupabaseClient) {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function getProfile(supabase: SupabaseClient) {
  const user = await getUser(supabase)
  if (!user) return null

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, is_admin")
    .eq("id", user.id)
    .single()

  if (error) {
    return null
  }

  return {
    ...profile,
    email: user?.user_metadata.email,
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
