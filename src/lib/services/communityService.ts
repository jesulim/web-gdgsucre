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

// Escapa los caracteres que PostgREST interpreta como sintaxis dentro de un
// filtro .or(): una coma o un paréntesis sin escapar en el input del usuario
// puede alterar el árbol de filtros o romper el parseo de la request.
function escapePostgrestPattern(value: string) {
  return value.replace(/[,()]/g, "\\$&")
}

export async function getCommunities(supabase: SupabaseClient, name?: string) {
  let query = supabase.from("communities").select("*").order("name")

  if (name) {
    const pattern = escapePostgrestPattern(name)
    query = query.or(`name.ilike.%${pattern}%,short_name.ilike.%${pattern}%`)
  }

  const { data: communities, error } = await query

  if (error) throw new Error(error.message)

  return communities
}

export async function createCommunity(supabase: SupabaseClient, community: Community) {
  // Se usa un RPC SECURITY DEFINER en vez de un INSERT directo: la fila
  // creada queda con accepted=false, y la política de SELECT
  // (accepted OR is_admin) rechazaría el RETURNING de un INSERT normal para
  // un creador no admin. El RPC bypasea RLS solo para devolver el id nuevo,
  // sin exponer la fila en sí ni permitir setear accepted desde el cliente.
  const { data, error } = await supabase.rpc("create_pending_community", {
    p_name: community.name,
    p_short_name: community.short_name,
    p_website: community.website,
    p_contact_email: community.contact_email,
  })

  if (error) {
    console.error(`error creating community: ${error.message}`)
    return null
  }

  return data as number
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
