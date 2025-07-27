import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { createTransport } from "nodemailer"

const transporter = createTransport({
  host: import.meta.env.EMAIL_HOST,
  port: import.meta.env.EMAIL_PORT,
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
  if (!to) {
    console.error("Error: No recipient defined for email.")
    // Consider returning a specific error object or throwing a custom error
    return { success: false, message: "No recipient defined." }
  }
  try {
    const mailOptions = {
      from: '"GDG Sucre" <gdgsucre@gmail.com>',
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
}

export async function sendPaymentConfirmationEmail(
  data: PaymentConfirmationEmailData
) {
  const htmlContent = await loadEmailTemplate("paymentConfirmationEmail", data)

  return await sendEmail({
    to: data.userEmail,
    subject: `¡Pago confirmado para ${data.eventName}! 🎉`,
    html: htmlContent,
  })
}
