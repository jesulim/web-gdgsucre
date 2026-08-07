import type { SupabaseClient } from "@supabase/supabase-js"

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
    .select("id, first_name, last_name, avatar_url, is_admin, occupation, phone_number")
    .eq("id", user.id)
    .maybeSingle()

  if (error) {
    console.error("Error getting profile", error)
  }

  if (!profile) {
    return {
      id: user.id,
      first_name: user.user_metadata?.full_name || user.user_metadata?.name || "",
      last_name: "",
      avatar_url: user?.user_metadata?.avatar_url,
      email: user?.user_metadata?.email,
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
export async function getProfileByEmail(supabase: SupabaseClient, email: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, avatar_url, email, phone_number")
    .eq("email", email)
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

export async function updateProfile(
  supabase: SupabaseClient,
  data: {
    first_name: string
    last_name: string
    occupation?: string | null
    phone_number?: string | null
    avatar_url?: string | null
    share_data?: boolean | null
    display_name?: string | null
  }
) {
  const user = await getUser(supabase)
  if (!user) {
    throw new Error("No se pudo actualizar el perfil: No se pudo obtener el usuario")
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      email: user.user_metadata.email,
      avatar_url: data.avatar_url || user.user_metadata.avatar_url,
      first_name: data.first_name,
      last_name: data.last_name,
      occupation: data.occupation || null,
      phone_number: data.phone_number || null,
    },
    { onConflict: "id" }
  )

  if (error) {
    throw new Error(`No se pudo actualizar el perfil: ${error.message}`)
  }

  return { success: true }
}

export async function createProfileOfOrganizer(
  supabase: SupabaseClient,
  registrationData: {
    first_name: string
    last_name: string
    phone_number: string
    email: string
  }
) {
  return { success: false, reason: "not_implemented" }

  //   const userId = authData.user.id

  //   const { data, error: profileError } = await supabase
  //     .from("profiles")
  //     .insert([
  //       {
  //         id: userId,
  //         first_name: registrationData.first_name,
  //         last_name: registrationData.last_name,
  //         phone_number: registrationData.phone_number,
  //         email: registrationData.email,
  //       },
  //     ])
  //     .select("id")

  //   if (profileError) {
  //     throw new Error(`No se pudo crear el perfil: ${profileError.message}`)
  //   }

  //   return { success: true, data }
}
