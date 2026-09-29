/**
 * Datos que cambian entre eventos y se muestran en las páginas de registro.
 *
 * Esas rutas son dinámicas (`/registro/[eventSlug]/...`), así que sirven a
 * todos los eventos: lo que varía vive acá en vez de estar hardcodeado en cada
 * página. Para un evento nuevo, agrega una entrada con su slug y solo los
 * campos que cambian respecto a DEFAULT_EVENT_DATA.
 */

export interface EventData {
  /** Comunidad de WhatsApp a la que se invita al participante */
  whatsappLink: string
}

/** GDG Sucre: lo que se usa cuando el evento no tiene datos propios */
const DEFAULT_EVENT_DATA: EventData = {
  whatsappLink: "https://chat.whatsapp.com/EHtkjWuuhPh8cPDY8U9A7O",
}

const EVENT_DATA: Record<string, Partial<EventData>> = {
  // Women Techmakers Sucre
  "nwd-26": {
    whatsappLink: "https://chat.whatsapp.com/J7jqHD4MUZy8LmJNBX68HC",
  },
}

export function getEventData(slug: string): EventData {
  return { ...DEFAULT_EVENT_DATA, ...EVENT_DATA[slug] }
}
