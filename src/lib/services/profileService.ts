import { supabase } from "@/lib/supabase"

export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function getProfile() {
  const user = await getCurrentUser()

  if (!user) {
    return null
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name")
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

export async function createProfile(first_name: string, last_name: string) {
  const user = await getCurrentUser()

  const { error: profileError } = await supabase.from("profiles").insert([
    {
      first_name: first_name,
      last_name: last_name,
      email: user.user_metadata.email,
      avatar_url: user.user_metadata.avatar_url,
    },
  ])

  if (profileError) {
    throw new Error(`No se pudo crear el perfil: ${profileError.message}`)
  }
}
