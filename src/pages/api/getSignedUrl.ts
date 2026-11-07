import type { APIRoute } from "astro"

import { isEventStaff } from "@/lib/auth"
import { getEvent } from "@/lib/services/eventService"
import { getProfile } from "@/lib/services/profileService"
import { createUserClient } from "@/lib/supabase"

const ALLOWED_BUCKET = "event-uploads"

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const bucket = url.searchParams?.get("bucket")
  const fileUrl = url.searchParams?.get("url")

  if (!bucket || !fileUrl) {
    return new Response("Missing bucket or file URL", { status: 400 })
  }

  if (fileUrl.includes("..") || fileUrl.startsWith("/")) {
    return new Response("Invalid file path", { status: 400 })
  }

  if (bucket !== ALLOWED_BUCKET) {
    return new Response("Invalid bucket", { status: 400 })
  }

  const supabase = await createUserClient(cookies)
  const profile = await getProfile(supabase)

  if (!profile) return new Response("No autenticado", { status: 401 })

  const [eventSlug, , fileName] = fileUrl.split("/")
  const isOwner = !!fileName?.startsWith(`${profile.id}.`)

  if (!profile.is_admin && !isOwner) {
    const event = eventSlug ? await getEvent(supabase, eventSlug) : null

    if (!event || !(await isEventStaff(supabase, profile.id, event.id))) {
      return new Response("No autorizado", { status: 403 })
    }
  }

  const { data, error } = await supabase.storage.from(bucket).createSignedUrl(fileUrl, 60 * 60)

  if (!data || error) {
    return new Response(`Unable to generate link. ${error?.message}`, {
      status: 500,
    })
  }

  return redirect(data.signedUrl, 302)
}
