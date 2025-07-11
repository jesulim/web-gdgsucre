import { supabase } from "@/lib/supabase"

export async function getProfile() {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("id", user.id)
    .single()

  if (error) {
    return {
      first_name: user.user_metadata.name,
    }
  }

  return {
    ...profile,
    email: user?.user_metadata.email,
  }
}
