import { readFile } from "node:fs/promises"
import { join } from "node:path"
import * as nodemailer from "nodemailer"

const transporter = nodemailer.createTransport({
  host: import.meta.env.EMAIL_HOST,
  port: Number(import.meta.env.EMAIL_PORT),
  secure: false,
  auth: {
    user: import.meta.env.EMAIL_USER,
    pass: import.meta.env.EMAIL_PASSWORD,
  },
})

interface BaseEmailData {
  userEmail: string
  userName: string
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

async function loadEmailTemplate(
  templateName: string,
  templateData: Record<string, string | number>
): Promise<string> {
  try {
    const templatePath = join(
      process.cwd(),
      "src",
      "lib",
      "templates",
      `${templateName}.html`
    )
    let htmlContent = await readFile(templatePath, "utf-8")

    for (const [key, value] of Object.entries(templateData)) {
      const placeholder = new RegExp(`\\{\\{${key}\\}\\}`, "g")
      htmlContent = htmlContent.replace(placeholder, String(value))
    }

    return htmlContent
  } catch (error) {
    console.error(`Error cargando template ${templateName}:`, error)
    throw new Error(`No se pudo cargar el template ${templateName}`)
  }
}

async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const mailOptions = {
      from: "GDG Sucre",
      to,
      subject,
      html,
      text,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log(`Email enviado exitosamente a ${to}:`, info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error enviando email:", error)
    throw error
  }
}

// === EMAILS ESPECÍFICOS ===

// 1. Email de confirmación de registro (pendiente de pago)
interface RegistrationEmailData extends BaseEmailData {
  eventName: string
  eventSlug: string
}

export async function sendRegistrationConfirmationEmail(
  data: RegistrationEmailData
) {
  const htmlContent = await loadEmailTemplate("registrationEmail", data)

  return await sendEmail({
    to: data.userEmail,
    subject: `¡Registro recibido para ${data.eventName}! 📋`,
    html: htmlContent,
  })
}

// 2. Email de confirmación de pago (con QR)
interface PaymentConfirmationEmailData extends BaseEmailData {
  eventName: string
  eventSlug: string
  qrCodeUrl?: string
  eventDate?: string
  eventLocation?: string
}

export async function sendPaymentConfirmationEmail(
  data: PaymentConfirmationEmailData
) {
  const htmlContent = await loadEmailTemplate("paymentConfirmationEmail", data)

  return await sendEmail({
    to: data.userEmail,
    subject: `¡Pago confirmado para ${data.eventName}! 🎉 Tu entrada está lista`,
    html: htmlContent,
  })
}
