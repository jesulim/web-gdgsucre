import type { SupabaseClient } from "@supabase/supabase-js"

interface Community {
  id?: number
  name: string
  short_name?: string
  website?: string
  contact_email: string
  image?: string
  accepted?: boolean
}

function escapePostgrestPattern(value: string) {
  return value.replace(/[,()]/g, "\\$&")
}

export async function getCommunities(supabase: SupabaseClient, name?: string) {
  let query = supabase
    .from("communities")
    .select("id, created_at, name, short_name, website, contact_email, accepted")
    .order("created_at", { ascending: false })

  if (name) {
    const pattern = escapePostgrestPattern(name)
    query = query.or(`name.ilike.%${pattern}%,short_name.ilike.%${pattern}%`)
  }

  const { data: communities, error } = await query

  if (error) throw new Error(error.message)

  return communities
}

export async function createCommunity(supabase: SupabaseClient, community: Community) {
  const { data, error } = await supabase
    .from("communities")
    .insert(community)
    .select(`id`)
    .maybeSingle()

  if (error) throw new Error(error.message)

  return data?.id ?? null
}

export async function updateCommunity(
  supabase: SupabaseClient,
  id: number,
  community: Partial<Community>
) {
  const { data, error } = await supabase.from("communities").update(community).eq("id", id).select()

  if (error) {
    console.error(`error updating community: ${error.message}`)
    return null
  }

  if (data.length === 0) return null

  return data
}

export async function deleteCommunity(supabase: SupabaseClient, id: number) {
  const { data, error } = await supabase.from("communities").delete().eq("id", id).select()

  if (error) {
    console.error(`error deleting community: ${error.message}`)
    return false
  }

  return data.length > 0
}

export interface CommunityWithCount {
  id: number
  name: string
  short_name: string | null
  website: string | null
  event_count: number
}

export async function getCommunitiesWithEventCount(
  supabase: SupabaseClient
): Promise<CommunityWithCount[]> {
  const { data: communities, error: communitiesError } = await supabase
    .from("communities")
    .select("id, name, short_name, website")
    .eq("accepted", true)
    .order("name")

  if (communitiesError) throw new Error(communitiesError.message)
  if (!communities || communities.length === 0) return []

  const { data: events, error: eventsError } = await supabase
    .from("calendar_events")
    .select("community_id")
    .eq("accepted", true)

  if (eventsError) throw new Error(eventsError.message)

  const countByCommunity = new Map<number, number>()
  for (const event of events ?? []) {
    countByCommunity.set(event.community_id, (countByCommunity.get(event.community_id) ?? 0) + 1)
  }

  return communities.map(c => ({
    ...c,
    event_count: countByCommunity.get(c.id) ?? 0,
  }))
}
