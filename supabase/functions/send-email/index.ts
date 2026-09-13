import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.111.0"
import { serve } from "jsr:@std/http@0.224.0/server"
import { Eta } from "@bgub/eta"

const ALLOWED_ORIGINS = [
  "https://gdgsucre.com",
  "https://web-gdgsucre.vercel.app",
  "http://localhost:4321",
]

type EmailType = "registration" | "registration-team" | "payment" | "event-accepted"

interface RequestBody {
  type: EmailType
  data?: Record<string, unknown>
}

interface TemplateConfig {
  file: string
  formatEmail: (data: Record<string, unknown>) => Promise<{
    subject: string
    to: unknown
    data: Record<string, unknown>
  }>
}

async function getRegistrationData(data: Record<string, unknown>) {
  return {
    to: data.userEmail,
    subject: `¡Registro recibido para ${data.eventName || ""}! 📋`,
    data: data,
  }
}

async function getPaymentData(data: Record<string, unknown>) {
  return {
    to: data.userEmail,
    subject: `¡Pago confirmado para ${data.eventName || ""}! 🎉`,
    data: data,
  }
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("es-BO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/La_Paz",
  })
}

async function getEventAcceptedData(data: Record<string, unknown>) {
  const FORMAT_MAP: Record<string, string> = {
    "in-person": "Presencial",
    online: "Virtual",
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error("Server configuration error: missing Supabase credentials")
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey, {
    auth: { autoRefreshToken: false, persistSession: false, detectSessionInUrl: false },
  })

  const { data: calendarEvent, error } = await supabase
    .from("calendar_events")
    .select(
      `id,
      name,
      start_datetime,
      end_datetime,
      format,
      location,
      registration_link,
      communities(name, short_name, contact_email)`
    )
    .eq("id", data.eventId)
    .single()

  if (error || !calendarEvent) {
    throw new Error("Event not found")
  }

  const community = calendarEvent.communities as {
    name: string
    short_name: string | null
    contact_email: string
  } | null

  if (!community?.contact_email) {
    throw new Error("Community contact email not found")
  }

  return {
    to: community.contact_email,
    subject: `¡Tu evento "${calendarEvent.name}" fue aceptado! 🎉`,
    data: {
      eventName: calendarEvent.name,
      communityName: community.name,
      communityShortName: community.short_name ?? community.name,
      startDatetime: formatDate(calendarEvent.start_datetime),
      endDatetime: formatDate(calendarEvent.end_datetime),
      format: FORMAT_MAP[calendarEvent.format] ?? "No especificada",
      location: calendarEvent.location ?? "No especificada",
      registrationLink: calendarEvent.registration_link ?? "#",
    },
  }
}

const EMAIL_TYPES: Record<EmailType, TemplateConfig> = {
  registration: {
    file: "registrationEmail.html",
    formatEmail: getRegistrationData,
  },
  "registration-team": {
    file: "registrationEmailBWAILeader.html",
    formatEmail: getRegistrationData,
  },
  payment: {
    file: "paymentConfirmationEmail.html",
    formatEmail: getPaymentData,
  },
  "event-accepted": {
    file: "eventAcceptedEmail.html",
    formatEmail: getEventAcceptedData,
  },
}

const eta = new Eta({ autoEscape: true })

function getCorsHeaders(origin: string | null) {
  const allowedOrigin = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  }
}

serve(async req => {
  const origin = req.headers.get("Origin")

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(origin) })
  }

  try {
    const body: RequestBody = await req.json()

    if (!body.type || !body.data) {
      return new Response(JSON.stringify({ error: "Email type and data are required" }), {
        status: 400,
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
      })
    }

    const config = EMAIL_TYPES[body.type]
    if (!config) {
      return new Response(JSON.stringify({ error: `Unknown email type: ${body.type}` }), {
        status: 400,
        headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
      })
    }

    const { to, subject, data } = await config.formatEmail(body.data ?? {})
    const template = await Deno.readTextFile(new URL(`./templates/${config.file}`, import.meta.url))
    const html = eta.renderString(template, data)

    const emailHost = Deno.env.get("EMAIL_HOST")
    const emailPort = Number(Deno.env.get("EMAIL_PORT"))
    const emailUser = Deno.env.get("EMAIL_USER")
    const emailPassword = Deno.env.get("EMAIL_PASSWORD")

    const client = new SMTPClient({
      connection: {
        hostname: emailHost,
        port: emailPort,
        tls: emailPort === 465,
        auth: { username: emailUser, password: emailPassword },
      },
    })

    await client.send({
      from: `"GDG Sucre" <${emailUser}>`,
      to,
      subject,
      html,
    })

    await client.close()

    console.info(`Email sent (${body.type}) to ${to}`)

    return new Response(JSON.stringify({ success: true, message: "Email sent" }), {
      status: 200,
      headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" },
    })
  } catch (error) {
    console.error("Error sending email:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to send email",
        details: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...getCorsHeaders(origin), "Content-Type": "application/json" } }
    )
  }
})
