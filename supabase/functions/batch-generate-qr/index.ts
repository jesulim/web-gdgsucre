import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { qrcode } from "https://deno.land/x/qrcode@v2.0.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const ALLOWED_ORIGINS = ["https://gdgsucre.com", "http://localhost:4321"]

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  }
}

interface RequestBody {
  eventSlug?: string
  limit?: number
}

interface ProcessResult {
  registrationId: number
  success: boolean
  error?: string
  publicUrl?: string
}

async function generateAndUploadQR(
  supabase: any,
  token: string,
  registrationId: number
): Promise<{ publicUrl: string } | null> {
  try {
    // Generate QR code
    const qrBase64 = await qrcode(token, {
      size: 500,
    })

    const base64Data = qrBase64.split(",")[1]
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    const filePath = `qr/devfest-25/${registrationId}.png`
    const { error: uploadError } = await supabase.storage
      .from("assets")
      .upload(filePath, bytes, { contentType: "image/png", upsert: true })

    if (uploadError) {
      console.error(`Upload error for registration ${registrationId}:`, uploadError.message)
      return null
    }

    const { data: urlData } = supabase.storage.from("assets").getPublicUrl(filePath)
    return { publicUrl: urlData.publicUrl }
  } catch (error) {
    console.error(`Error generating QR for registration ${registrationId}:`, error)
    return null
  }
}

serve(async req => {
  const origin = req.headers.get("Origin")

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(origin) })
  }

  try {
    console.info("Starting batch QR generation")

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    )

    const { eventSlug, limit }: RequestBody = await req.json()

    let query = supabase
      .from("registrations")
      .select("id, token")
      .eq("status", "confirmed")
      .not("token", "is", null)
      .is("qr_url", null)

    if (eventSlug) {
      query = query.select("id, token, events!inner(slug)").eq("events.slug", eventSlug)
    }

    if (limit && limit > 0) {
      query = query.limit(limit)
    }

    const { data: registrations, error: fetchError } = await query

    if (fetchError) {
      console.error("Error fetching registrations:", fetchError.message)
      return new Response(
        JSON.stringify({
          error: "Failed to fetch registrations",
          details: fetchError.message,
        }),
        {
          status: 500,
          headers: {
            ...getCorsHeaders(origin),
            "Content-Type": "application/json",
          },
        }
      )
    }

    if (!registrations || registrations.length === 0) {
      return new Response(
        JSON.stringify({
          success: true,
          message: "No registrations found that need QR codes",
          processed: 0,
          results: [],
        }),
        {
          status: 200,
          headers: {
            ...getCorsHeaders(origin),
            "Content-Type": "application/json",
          },
        }
      )
    }

    console.info(`Found ${registrations.length} registrations to process`)

    const results: ProcessResult[] = []

    for (const registration of registrations) {
      console.log(`Processing registration ${registration.id} with token ${registration.token}`)

      const qrResult = await generateAndUploadQR(supabase, registration.token, registration.id)

      if (qrResult) {
        const { error: updateError } = await supabase
          .from("registrations")
          .update({ qr_url: qrResult.publicUrl })
          .eq("id", registration.id)

        if (updateError) {
          console.error(`Failed to update registration ${registration.id}:`, updateError.message)
          results.push({
            registrationId: registration.id,
            success: false,
            error: `Failed to update database: ${updateError.message}`,
          })
        } else {
          results.push({
            registrationId: registration.id,
            success: true,
            publicUrl: qrResult.publicUrl,
          })
        }
      } else {
        results.push({
          registrationId: registration.id,
          success: false,
          error: "Failed to generate or upload QR code",
        })
      }
    }

    const successCount = results.filter(r => r.success).length
    const failureCount = results.filter(r => !r.success).length

    console.info(`Batch processing complete: ${successCount} succeeded, ${failureCount} failed`)

    return new Response(
      JSON.stringify({
        success: true,
        processed: registrations.length,
        succeeded: successCount,
        failed: failureCount,
        results,
      }),
      {
        status: 200,
        headers: {
          ...getCorsHeaders(origin),
          "Content-Type": "application/json",
        },
      }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(
      JSON.stringify({
        error: "Error in batch QR generation",
        details: error instanceof Error ? error.message : error,
      }),
      {
        status: 500,
        headers: {
          ...getCorsHeaders(origin),
          "Content-Type": "application/json",
        },
      }
    )
  }
})
