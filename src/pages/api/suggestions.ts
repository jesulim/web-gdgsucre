import type { APIRoute } from "astro"

import { getProfile } from "@/lib/services/profileService"
import { createSuggestion } from "@/lib/services/suggestionService"
import { createUserClient } from "@/lib/supabase"
import { suggestionSchema } from "@/lib/validators/suggestion"

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const supabase = await createUserClient(cookies)
    const profile = await getProfile(supabase)

    if (!profile) {
      return new Response(
        JSON.stringify({
          error: "No autorizado. Debes iniciar sesión para enviar una sugerencia.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const body = await request.json().catch(() => null)
    const parsed = suggestionSchema.safeParse(body)

    if (!parsed.success) {
      return new Response(
        JSON.stringify({
          error: "Datos inválidos",
          details: parsed.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const { subject, message } = parsed.data

    await createSuggestion(supabase, profile.id, { subject, message })

    // Disparar email en try/catch para que un fallo en el proveedor de correos
    // no aborte ni afecte la respuesta exitosa tras guardar en la base de datos.
    try {
      const fullName =
        `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
        profile.email ||
        "Usuario de GDG Sucre"

      const { error: emailError } = await supabase.functions.invoke("send-email", {
        body: {
          type: "suggestion",
          data: {
            userName: fullName,
            userEmail: profile.email,
            subject,
            message,
          },
        },
      })

      if (emailError) {
        console.error("Error al enviar notificación por email de la sugerencia:", emailError)
      }
    } catch (emailErr) {
      console.error("Excepción al invocar función send-email:", emailErr)
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "¡Gracias por tu sugerencia!",
      }),
      {
        status: 201,
        headers: { "Content-Type": "application/json" },
      }
    )
  } catch (error) {
    console.error("Error en endpoint /api/suggestions:", error)
    return new Response(
      JSON.stringify({
        error: "Error interno del servidor al procesar la sugerencia",
        details: error instanceof Error ? error.message : "Error desconocido",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
