import { createUserClient } from "@/lib/supabase"
import type { APIRoute } from "astro"

export const GET: APIRoute = async ({ url, cookies, redirect }) => {
  const bucket = url.searchParams?.get("bucket")
  const fileUrl = url.searchParams?.get("url")

  if (!bucket || !fileUrl) {
    return new Response("Missing bucket or file URL", { status: 400 })
  }

  if (fileUrl.includes("..") || fileUrl.startsWith("/")) {
    return new Response("Invalid file path", { status: 400 })
  }

  const supabase = await createUserClient(cookies)

  const { data, error } = await supabase.storage
    .from(bucket)
    .createSignedUrl(fileUrl, 60 * 60) // 1 hour

  if (!data || error) {
    return new Response(`Unable to generate link. ${error.message}`, {
      status: 500,
    })
  }

  return redirect(data.signedUrl, 302)
}
