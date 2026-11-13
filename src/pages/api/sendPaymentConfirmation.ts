import { z } from "zod"

import { eventFromRegistrationId, registrationIdFromBody, withStaffOrAdmin } from "@/lib/auth"
import { confirmRegistration, getRegistrationContact } from "@/lib/services/registrationService"

const PaymentConfirmationSchema = z.object({
  registrationId: z.coerce.number().int().positive(),
})

export const POST = withStaffOrAdmin(
  eventFromRegistrationId(registrationIdFromBody),
  async ({ request, auth }) => {
    const parsed = PaymentConfirmationSchema.safeParse(await request.json().catch(() => null))

    if (!parsed.success) {
      return Response.json(
        { error: "Datos inválidos", details: z.prettifyError(parsed.error) },
        { status: 400 }
      )
    }

    try {
      const { registrationId } = parsed.data
      const contact = await getRegistrationContact(auth.supabase, registrationId)

      await confirmRegistration(auth.supabase, registrationId)

      if (contact.email) {
        auth.supabase.functions.invoke("send-email", {
          body: {
            type: "payment",
            data: {
              userEmail: contact.email,
              userName: contact.name,
              eventName: contact.eventName,
              eventSlug: contact.eventSlug,
            },
          },
        })
      }

      return Response.json({
        success: true,
        message: "Email de confirmación de pago enviado exitosamente y estado actualizado",
      })
    } catch (error) {
      console.error("Error enviando email de confirmación de pago:", error)

      return Response.json(
        {
          error: "Error interno del servidor al enviar email",
          details: error instanceof Error ? error.message : "Error desconocido",
        },
        { status: 500 }
      )
    }
  }
)
