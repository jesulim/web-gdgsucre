import type { SupabaseClient } from "@supabase/supabase-js"

export interface Suggestion {
  id: string
  user_id: string
  subject: string
  message: string
  status: string
  created_at: string
}

export interface CreateSuggestionData {
  subject: string
  message: string
}

export async function createSuggestion(
  supabase: SupabaseClient,
  userId: string,
  data: CreateSuggestionData
): Promise<Suggestion> {
  const { data: suggestion, error } = await supabase
    .from("suggestions")
    .insert({
      user_id: userId,
      subject: data.subject,
      message: data.message,
    })
    .select("id, user_id, subject, message, status, created_at")
    .single()

  if (error) {
    throw new Error(`Error creating suggestion: ${error.message}`)
  }

  return suggestion as Suggestion
}

export async function getSuggestions(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("suggestions")
    .select(`
      id,
      user_id,
      subject,
      message,
      status,
      created_at,
      profiles (
        first_name,
        last_name,
        avatar_url,
        email
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(`Error fetching suggestions: ${error.message}`)
  }

  return data
}
