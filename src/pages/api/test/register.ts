import type { APIRoute } from "astro"
import { sendRegistrationConfirmationEmail } from "@/lib/services/emailService"

export const GET: APIRoute = async () => {
  try {
    console.log("🧪 Iniciando prueba de email de registro...")
    
    await sendRegistrationConfirmationEmail({
      userEmail: "gonzalestitosebastian@gmail.com", 
      userName: "Sebastian Test",
      eventName: "Google I/O Extended Sucre 2025",
      eventSlug: "io-extended-25",
    })
    
    console.log("✅ Email de registro enviado exitosamente!")
    return new Response(`
      <h1>✅ Email de registro enviado!</h1>
    `, { 
      status: 200,
      headers: { "Content-Type": "text/html" }
    })
  } catch (error) {
    console.error("❌ Error enviando email:", error)
    return new Response(`
      <h1>❌ Error enviando email</h1>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${error}</pre>
      <a href="/" style="color: blue;">← Volver al inicio</a>
    `, { 
      status: 500,
      headers: { "Content-Type": "text/html" }
    })
  }
} 