import type { APIRoute } from "astro"
import { createSupabaseServerClient } from "@/lib/supabase"

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServerClient({ request, cookies })

  await supabase.auth.signOut()
  cookies.delete("sb-access-token", { path: "/" })
  cookies.delete("sb-refresh-token", { path: "/" })

  return redirect("/")
}
