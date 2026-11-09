import type { APIRoute } from "astro"

import { getProfile, getUser } from "@/lib/services/profileService"
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
      const firstIssue = parsed.error.issues[0]?.message || "Datos inválidos"
      return new Response(
        JSON.stringify({
          error: firstIssue,
          details: parsed.error.format(),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    const { subject, message } = parsed.data

    // Garantizar que exista una fila en public.profiles para evitar error de FK
    // en caso de que el usuario haya iniciado sesión con OAuth y aún no tenga perfil guardado.
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", profile.id)
      .maybeSingle()

    if (!existingProfile) {
      await supabase.from("profiles").upsert(
        {
          id: profile.id,
          first_name: profile.first_name || "Usuario",
          last_name: profile.last_name || "",
          email: profile.email ?? null,
          avatar_url: profile.avatar_url ?? null,
        },
        { onConflict: "id" }
      )
    }

    await createSuggestion(supabase, profile.id, { subject, message })

    // Disparar email en try/catch para que un fallo en el proveedor de correos
    // no aborte ni afecte la respuesta exitosa tras guardar en la base de datos.
    try {
      const user = await getUser(supabase)
      const userEmail = profile.email || user?.email || ""
      const fullName =
        `${profile.first_name ?? ""} ${profile.last_name ?? ""}`.trim() ||
        userEmail ||
        "Usuario de GDG Sucre"

      const { error: emailError } = await supabase.functions.invoke("send-email", {
        body: {
          type: "suggestion",
          data: {
            userName: fullName,
            userEmail,
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
