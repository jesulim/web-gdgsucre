/**
 * Datos de marca y del evento que cambian entre comunidades.
 *
 * La función es compartida con GDG, así que DEFAULT_CONFIG reproduce
 * exactamente lo que se enviaba antes: un evento sin entrada propia acá sale
 * igual que siempre. Para un evento nuevo, agrega una entrada con su slug y
 * solo los campos que cambian.
 *
 * Requiere que el caller mande `eventSlug` dentro de `data`.
 */

export interface EventConfig {
  /** Nombre visible del remitente; la dirección sigue siendo la cuenta SMTP */
  senderName: string
  /** Dirección a la que va la respuesta si el usuario contesta el correo */
  replyTo?: string
  /** Nombre largo de la comunidad, en el pie de los correos de registro */
  organizerName: string
  /** Nombre corto, en el pie del correo de confirmación de pago */
  organizerShortName: string
  /** Línea secundaria del pie */
  organizerTagline: string
  /** Enlace a la comunidad de WhatsApp */
  whatsappLink: string
  /** Página web de la comunidad, para el botón del correo de confirmación de pago */
  websiteUrl: string
  /** Los cuatro puntos de color del pie, en orden */
  brandColors: [string, string, string, string]
  /** Fecha del evento, ya formateada */
  eventDate: string
  /** Hora del evento, ya formateada */
  eventTime: string
  /** Lugar del evento */
  eventLocation: string
}

/** Lo que se enviaba antes de tener configuración por evento */
export const DEFAULT_CONFIG: EventConfig = {
  senderName: "GDG Sucre",
  organizerName: "Google Developer Group Sucre",
  organizerShortName: "GDG Sucre",
  organizerTagline: "Google Developer Group",
  whatsappLink: "https://chat.whatsapp.com/EHtkjWuuhPh8cPDY8U9A7O",
  websiteUrl: "https://gdgsucre.com",
  brandColors: ["#4285f4", "#ea4335", "#fbbc05", "#34a853"],
  eventDate: "Por confirmar",
  eventTime: "Por confirmar",
  eventLocation: "Por confirmar",
}

export const EVENT_CONFIG: Record<string, Partial<EventConfig>> = {
  "nwd-26": {
    senderName: "Women Techmakers Sucre",
    replyTo: "wtmsucre@gmail.com",
    organizerName: "Women Techmakers Sucre",
    organizerShortName: "WTM Sucre",
    organizerTagline: "Women Techmakers",
    whatsappLink: "https://chat.whatsapp.com/J7jqHD4MUZy8LmJNBX68HC",
    websiteUrl: "https://wtmsucre.com",
    brandColors: ["#1355CC", "#10A7BC", "#F6BE3A", "#0B3FA0"],
    eventDate: "Sábado 10 de octubre",
    eventTime: "14:00 Hrs.",
    eventLocation: "Facultad de Ciencias y Tecnología",
  },
  "bwai-26": {
    eventDate: "Sábado 15 de agosto",
    eventTime: "08:00 Hrs.",
    eventLocation: "Facultad de Tecnología · Salón Rosendo Carreras",
  },
}

export function getEventConfig(slug: unknown): EventConfig {
  const overrides = typeof slug === "string" ? EVENT_CONFIG[slug] : undefined
  return { ...DEFAULT_CONFIG, ...overrides }
}
