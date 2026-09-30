import type { ImageMetadata } from "astro"

import breakThePatternCover from "@/assets/events/nwd-26/past-events/break-the-pattern-cover.png"
import mothersDayCover from "@/assets/events/nwd-26/past-events/mothers-day-cover.png"

export interface PastEvent {
  title: string
  year: string
  date: string
  dateTime: string
  venue: string
  city: string
  description: string
  cover: ImageMetadata
  coverAlt: string
  /** Ruta interna de la página del evento. */
  href?: `/eventos/${string}`
}

export const pastEvents: PastEvent[] = [
  {
    title: "Break the Pattern",
    year: "IWD - 2024",
    date: "7 de marzo de 2026",
    dateTime: "2026-03-07",
    venue: "Facultad de Ciencias y Tecnología",
    city: "Sucre",
    description:
      "Día Internacional de la Mujer en tecnología. Charlas técnicas, networking y workshops para romper barreras.",
    cover: breakThePatternCover,
    coverAlt: "Portada gráfica del evento Break the Pattern",
    href: "/eventos/iwd-26",
  },
  {
    title: "Mural de Mamá",
    year: "MD - 2026",
    date: "27 de mayo de 2026",
    dateTime: "2026-05-27",
    venue: "Coworking Sucre Digital",
    city: "Sucre",
    description:
      "El mural colaborativo más grande del Día de la Madre. Sube una foto con tu mami y sé parte de la historia.",
    cover: mothersDayCover,
    coverAlt: "Portada gráfica del evento Mother's Day",
    href: "/eventos/md-26",
  },
]
