import type { APIRoute } from "astro"

import { sendPaymentConfirmationEmail } from "@/lib/services/emailService"
import { updateRegistrationStatus } from "@/lib/services/registrationService"
import { createUserClient } from "@/lib/supabase"

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json()

    const { userEmail, userName, eventName, eventSlug } = body

    if (!userEmail || !userName || !eventName || !eventSlug) {
      return new Response(
        JSON.stringify({
          error:
            "Faltan campos requeridos: userEmail, userName, eventName, eventSlug",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const supabase = await createUserClient(cookies)

    const emailData = {
      userEmail,
      userName,
      eventName,
      eventSlug,
      qrCodeUrl: body.qrCodeUrl,
      eventDate: body.eventDate,
      eventLocation: body.eventLocation,
    }

    const result = await sendPaymentConfirmationEmail(emailData)

    try {
      await updateRegistrationStatus(
        supabase,
        userEmail,
        eventSlug,
        "confirmed"
      )
    } catch (updateError) {
      console.error("Error:", updateError)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message:
          "Email de confirmación de pago enviado exitosamente y estado actualizado",
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
