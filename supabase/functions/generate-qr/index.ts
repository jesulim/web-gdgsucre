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
  token: string
  registrationId: number
}

serve(async req => {
  const origin = req.headers.get("Origin")

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(origin) })
  }

  try {
    console.info("Starting QR generation")

    const authHeader = req.headers.get("Authorization")
    if (!authHeader)
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          details: "Authorization header is missing",
        }),
        {
          status: 401,
          headers: {
            ...getCorsHeaders(origin),
            "Content-Type": "application/json",
          },
        }
      )

    const { token, registrationId }: RequestBody = await req.json()
    if (!token || !registrationId) {
      return new Response(
        JSON.stringify({
          error: "token and registrationId are required",
        }),
        {
          status: 400,
          headers: {
            ...getCorsHeaders(origin),
            "Content-Type": "application/json",
          },
        }
      )
    }

    // auth
    const jwt = authHeader.replace(/^Bearer\s+/i, "")
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL"),
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")
    )
    const {
      data: { claims },
      error,
    } = await supabase.auth.getClaims(jwt)

    if (error) {
      console.error("Couldn't get claims", error.message)
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          details: "Ivalid or expired authorization token",
        }),
        {
          status: 401,
          headers: {
            ...getCorsHeaders(origin),
            "Content-Type": "application/json",
          },
        }
      )
    }

    console.info("User authenticated:", claims?.sub)

    console.log(`Generating QR code for token: ${token}, registrationId: ${registrationId}`)
    const qrBase64 = await qrcode(token, {
      size: 500,
    })

    const base64Data = qrBase64.split(",")[1] // remove data:image/png;base64, prefix
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
      console.error("Upload error:", uploadError.message)
      return new Response(
        JSON.stringify({
          error: `Failed to upload QR code: ${uploadError.message}`,
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

    console.info("Uploaded successfully to:", filePath)

    const { data: urlData } = supabase.storage.from("assets").getPublicUrl(filePath)

    return new Response(
      JSON.stringify({
        success: true,
        publicUrl: urlData.publicUrl,
        filePath,
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
        error: "Error generating QR code",
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
