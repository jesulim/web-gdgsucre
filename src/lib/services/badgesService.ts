import type { SupabaseClient } from "@supabase/supabase-js"

export async function getBadges(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("user_badges")
    .select("badges(name, image_url)")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false })

  if (error) return null
  return data.map(badge => ({
    ...badge.badges,
  }))
}
