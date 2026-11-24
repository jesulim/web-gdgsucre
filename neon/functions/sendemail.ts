import { Eta } from "eta"
import nodemailer from "nodemailer"
import { Pool } from "pg"

import { getCalendarInviteAttachment } from "./calendarInvite"

import eventAcceptedEmail from "./templates/eventAcceptedEmail.html" with { type: "text" }
import eventReceivedEmail from "./templates/eventReceivedEmail.html" with { type: "text" }
import paymentConfirmationEmail from "./templates/paymentConfirmationEmail.html" with {
  type: "text",
}
import paymentConfirmationEmailDevfest26 from "./templates/paymentConfirmationEmailDevfest26.html" with {
  type: "text",
}
import registrationEmail from "./templates/registrationEmail.html" with { type: "text" }
import registrationEmailBWAILeader from "./templates/registrationEmailBWAILeader.html" with {
  type: "text",
}
import registrationEmailDevfest26 from "./templates/registrationEmailDevfest26.html" with {
  type: "text",
}

type EmailType =
  | "registration"
  | "registration-team"
  | "payment"
  | "event-received"
  | "event-accepted"

interface RequestBody {
  type: EmailType
  data?: Record<string, unknown>
}

interface TemplateConfig {
  template: string
  formatEmail: (data: Record<string, unknown>) => Promise<{
    subject: string
    to: string
    data: Record<string, unknown>
  }>
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5 })
pool.on("error", error => console.error("database client error:", error))
const eta = new Eta({ autoEscape: true })

function formatDate(dateString: string | null): string {
  if (!dateString) return "Por definir"

  return new Date(dateString).toLocaleDateString("es-BO", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/La_Paz",
  })
}

async function formatCalendarEvent(data: Record<string, unknown>) {
  const FORMAT_MAP: Record<string, string> = {
    "in-person": "Presencial",
    virtual: "Virtual",
  }

  const { rows } = await pool.query(
    `SELECT ce.id,
      ce.name,
      ce.start_datetime,
      ce.end_datetime,
      ce.format,
      ce.location,
      ce.registration_link,
      ce.accepted,
      c.name as community_name,
      c.short_name,
      c.contact_email
     FROM public.calendar_events ce
     JOIN public.communities c on c.id = ce.community_id
     WHERE ce.id = $1`,
    [data.eventId]
  )

  const calendarEvent = rows[0]
  if (!calendarEvent) throw new Error("Event not found")
  if (!calendarEvent.contact_email) throw new Error("Community contact email not found")

  return {
    to: calendarEvent.contact_email,
    subject: `¡Tu evento "${calendarEvent.name}" fue ${calendarEvent.accepted ? "aceptado" : "recibido"}! 🎉`,
    data: {
      eventName: calendarEvent.name,
      communityName: calendarEvent.community_name,
      communityShortName: calendarEvent.short_name ?? calendarEvent.community_name,
      startDatetime: formatDate(calendarEvent.start_datetime),
      endDatetime: formatDate(calendarEvent.end_datetime),
      format: FORMAT_MAP[calendarEvent.format] ?? "No especificada",
      location: calendarEvent.location ?? "No especificada",
      registrationLink: calendarEvent.registration_link,
    },
  }
}

function getRegistrationData(data: Record<string, unknown>) {
  return {
    to: String(data.userEmail),
    subject: `¡Registro recibido para ${data.eventName || ""}! 📋`,
    data,
  }
}

function getPaymentData(data: Record<string, unknown>) {
  return {
    to: String(data.userEmail),
    subject: `¡Pago confirmado para ${data.eventName || ""}! 🎉`,
    data,
  }
}

const EMAIL_TYPES: Record<EmailType, TemplateConfig> = {
  registration: {
    template: registrationEmail,
    formatEmail: async data => getRegistrationData(data),
  },
  "registration-team": {
    template: registrationEmailBWAILeader,
    formatEmail: async data => getRegistrationData(data),
  },
  payment: {
    template: paymentConfirmationEmail,
    formatEmail: async data => getPaymentData(data),
  },
  "event-received": {
    template: eventReceivedEmail,
    formatEmail: formatCalendarEvent,
  },
  "event-accepted": {
    template: eventAcceptedEmail,
    formatEmail: formatCalendarEvent,
  },
}

const EVENT_TEMPLATES: Record<string, Partial<Record<EmailType, string>>> = {
  "devfest-26": {
    registration: registrationEmailDevfest26,
    payment: paymentConfirmationEmailDevfest26,
  },
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("x-function-secret") !== process.env.FUNCTION_SECRET) {
      return json({ error: "Unauthorized" }, 401)
    }

    try {
      const body: RequestBody = await request.json()
      console.info("Body received:", body)

      if (!body.type || !body.data) {
        return json({ error: "Email type and data are required" }, 400)
      }

      const config = EMAIL_TYPES[body.type]
      if (!config) {
        return json({ error: `Unknown email type: ${body.type}` }, 400)
      }

      const { to, subject, data } = await config.formatEmail(body.data)
      const eventSlug = String(body.data.eventSlug)
      const template = EVENT_TEMPLATES[eventSlug]?.[body.type] ?? config.template
      const html = eta.renderString(template, data)

      // Calendar invites are only attached to payment confirmations
      const invite = body.type === "payment" ? getCalendarInviteAttachment(eventSlug) : undefined

      const port = Number(process.env.EMAIL_PORT)
      const transport = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port,
        secure: port === 465,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
      })

      await transport.sendMail({
        from: `"GDG Sucre" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
        attachments: invite ? [invite] : [],
      })

      console.info(`Email ${body.type} sent`)
      return json({ success: true, message: "Email sent" })
    } catch (error) {
      console.error("Error sending email:", error)
      return json(
        {
          error: "Failed to send email",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        500
      )
    }
  },
}
