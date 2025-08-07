import type { APIRoute } from "astro"

import { sendPaymentConfirmationEmail } from "@/lib/services/emailService"
import { updateRegistration } from "@/lib/services/registrationService"
import { createUserClient } from "@/lib/supabase"

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()

    const { registrationId, userEmail, userName, eventName } = body

    if (!userEmail || !userName || !eventName) {
      return new Response(
        JSON.stringify({
          error: "Faltan campos requeridos: userEmail, userName, eventName",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const supabase = await createUserClient(cookies)
    await updateRegistration(supabase, registrationId, { status: "confirmed" })

    const emailData = {
      userEmail,
      userName,
      eventName,
    }

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
