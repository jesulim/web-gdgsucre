import type { APIRoute } from "astro"
import { sendPaymentConfirmationEmail } from "@/lib/services/emailService"

export const GET: APIRoute = async () => {
  try {
    console.log("🧪 Probando email de confirmación de pago...")
    
    await sendPaymentConfirmationEmail({
      userEmail: "gonzalestitosebastian@gmail.com",
      userName: "Sebastian Test",
      eventName: "Google I/O Extended Sucre 2025",
      eventSlug: "io-extended-25",
      qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=TICKET-IOE25-001",
      eventDate: "09 de Agosto, 2025 - 9:00 AM",
      eventLocation: "Facultad de Ciencias y Tecnología - USFX",
    })
    
    console.log("✅ Email de confirmación de pago enviado!")
    return new Response(`
      <h1>🎉 ¡Email de confirmación de pago enviado!</h1>
    `, { 
      status: 200,
      headers: { "Content-Type": "text/html" }
    })
  } catch (error) {
    console.error("❌ Error enviando email de confirmación:", error)
    return new Response(`
      <h1>❌ Error enviando email de confirmación</h1>
      <pre style="background: #f5f5f5; padding: 10px; border-radius: 5px;">${error}</pre>
      <a href="/" style="color: blue;">← Volver al inicio</a>
    `, { 
      status: 500,
      headers: { "Content-Type": "text/html" }
    })
  }
} 