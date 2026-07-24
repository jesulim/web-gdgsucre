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

export async function getCommunities(supabase: SupabaseClient, name?: string) {
  let query = supabase.from("communities").select("*").order("name")

  if (name) {
    query = query.or(`name.ilike.%${name}%,short_name.ilike.%${name}%`)
  }

  const { data: communities, error } = await query

  if (error) throw new Error(error.message)

  return communities
}

export async function createCommunity(supabase: SupabaseClient, community: Community) {
  // No se encadena .select(): la fila creada queda con accepted=false, y la
  // política de SELECT (accepted OR is_admin) rechazaría el RETURNING para
  // un creador no admin, haciendo fallar el INSERT completo por RLS.
  const { error } = await supabase.from("communities").insert(community)

  if (error) {
    console.error(`error creating community: ${error.message}`)
    return false
  }

  return true
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

  // RLS filtra silenciosamente las filas que no cumplen la política de UPDATE
  // (en vez de lanzar un error), así que un array vacío significa que no se
  // modificó nada: no existe el id o el usuario no tiene permiso.
  if (data.length === 0) return null

  return data
}

export async function deleteCommunity(supabase: SupabaseClient, id: number) {
  const { data, error } = await supabase.from("communities").delete().eq("id", id).select()

  if (error) {
    console.error(`error deleting community: ${error.message}`)
    return false
  }

  // Igual que en updateCommunity: RLS filtra silenciosamente sin dar error,
  // así que un array vacío significa que no se borró ninguna fila.
  return data.length > 0
}
