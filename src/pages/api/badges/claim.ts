import type { APIRoute } from "astro"
import { validateFlag } from "@/lib/ctf/obfuscation"
import { claimEasterEggBadge } from "@/lib/services/badgesService"
import { getProfile } from "@/lib/services/profileService"
import { createSupabaseServerClient } from "@/lib/supabase"

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const { flag } = body

    if (!flag || !validateFlag(flag)) {
      return new Response(JSON.stringify({ error: "Invalid flag" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = createSupabaseServerClient({ request, cookies })
    const profile = await getProfile(supabase)

    const { data: storageData } = supabase.storage
      .from("assets")
      .getPublicUrl("badges/dino-hacker.svg")

    let serverBadge = {
      name: "Dino Hacker",
      image_url: storageData.publicUrl,
    }

    if (profile?.id) {
      serverBadge = await claimEasterEggBadge(supabase, profile.id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Badge claimed successfully!",
        badge: serverBadge,
        authenticated: Boolean(profile?.id),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: "Internal error while claiming badge",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
