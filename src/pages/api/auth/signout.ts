import type { APIRoute } from "astro"
import { createSupabaseServerClient } from "@/lib/supabase"
import { deleteSupabaseCookies } from "@/lib/utils"

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServerClient({ request, cookies })

  await supabase.auth.signOut()

  deleteSupabaseCookies(cookies)

  return redirect("/")
}
