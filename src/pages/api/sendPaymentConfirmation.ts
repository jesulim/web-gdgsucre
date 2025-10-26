import type { APIRoute } from "astro"
import { z } from "zod"

import { sendPaymentConfirmationEmail } from "@/lib/services/emailService"
import { confirmRegistration } from "@/lib/services/registrationService"
import { createUserClient } from "@/lib/supabase"

const PaymentConfirmationSchema = z.object({
  registrationId: z.coerce.number().min(1, "Debe ser un número mayor a 1"),
  userEmail: z.email({ message: "Email inválido" }),
  userName: z.string().min(1),
  eventName: z.string().min(1),
})

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()
    const parsed = PaymentConfirmationSchema.safeParse(body)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: "Datos inválidos", details: z.prettifyError(parsed.error) }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const { registrationId, userEmail, userName, eventName } = parsed.data

    const supabase = await createUserClient(cookies)
    await confirmRegistration(supabase, registrationId)

    const emailData = { userEmail, userName, eventName }
    const result = await sendPaymentConfirmationEmail(emailData)

    return new Response(
      JSON.stringify({
        success: true,
        message: "Email de confirmación de pago enviado exitosamente y estado actualizado",
        messageId: result.messageId,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Error enviando email de confirmación de pago:", error)

    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al enviar email",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
