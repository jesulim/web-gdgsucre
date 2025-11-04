import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { qrcode } from "https://deno.land/x/qrcode@v2.0.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

interface RequestBody {
  token: string
  registrationId: number
}

serve(async req => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { token, registrationId }: RequestBody = await req.json()

    // auth
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    )

    const {
      data: { user },
      error: userError,
    } = await supabaseClient.auth.getUser()

    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    if (!token || !registrationId) {
      return new Response(JSON.stringify({ error: "Token and registrationId are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      })
    }

    console.log(`Generating QR code for token: ${token}, registrationId: ${registrationId}`)

    const qrBase64 = await qrcode(token, {
      size: 500,
    })

    console.log("QR code generated successfully")

    const base64Data = qrBase64.split(",")[1] // remove data:image/png;base64, prefix
    const binaryString = atob(base64Data)
    const bytes = new Uint8Array(binaryString.length)
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }

    console.log(`Converted to bytes, length: ${bytes.length}`)

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const filePath = `devfest-25/qr/${registrationId}/${token}.png`

    console.log(`Uploading to: ${filePath}`)

    const { error: uploadError } = await supabaseAdmin.storage
      .from("event-uploads")
      .upload(filePath, bytes, {
        contentType: "image/png",
        upsert: true,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return new Response(
        JSON.stringify({
          error: `Failed to upload QR code: ${uploadError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      )
    }

    console.log("Upload successful")

    const { data: urlData } = supabaseAdmin.storage.from("event-uploads").getPublicUrl(filePath)

    console.log(`Public URL: ${urlData.publicUrl}`)

    return new Response(
      JSON.stringify({
        success: true,
        publicUrl: urlData.publicUrl,
        filePath,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Error:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  }
})

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  # Get your local anon key and access token first
  # The local anon key is shown when you run `supabase start`

  curl -i --location --request POST 'http://localhost:54321/functions/v1/generate-qr' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"token":"3AKFM9","registrationId":267}'
*/
