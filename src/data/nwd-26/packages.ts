import adelaImage from "@/assets/events/nwd-26/packages/adela_zamudio.webp"
import bartolinaImage from "@/assets/events/nwd-26/packages/bartolina_sisa.webp"
import juanaImage from "@/assets/events/nwd-26/packages/juana_azurduy.webp"

export type PackageFeatureType =
  | "snack"
  | "credential"
  | "cup"
  | "candle"
  | "scrunchie"
  | "stickers"
  | "earrings"

export interface EventPackage {
  id: "bartolina" | "adela" | "juana"
  packageNumber: number
  firstName: string
  lastName: string
  description: string
  price: number
  image: ImageMetadata
  imageAlt: string
  accent: "blue" | "yellow" | "turquoise"
  featured: boolean
  features: { label: string; type: PackageFeatureType }[]
  availability: {
    enabled: boolean
    percentage: number
    status: "available" | "low" | "sold-out"
  }
}

// Availability is deliberately data-only until its UI is enabled.
export const packages: EventPackage[] = [
  {
    id: "bartolina",
    packageNumber: 1,
    firstName: "BARTOLINA",
    lastName: "Sisa",
    description: "Un recuerdo especial para vivir el encuentro.",
    price: 30,
    image: bartolinaImage,
    imageAlt: "Ilustración de Bartolina Sisa",
    accent: "blue",
    featured: false,
    features: [
      { label: "Refrigerio", type: "snack" },
      { label: "Credencial", type: "credential" },
      { label: "Scrunchie", type: "scrunchie" },
      {
        label: "Aretes (exclusivos del Día de la Mujer Boliviana)",
        type: "earrings",
      },
      { label: "Stickers", type: "stickers" },
    ],
    availability: { enabled: false, percentage: 100, status: "available" },
  },
  {
    id: "adela",
    packageNumber: 2,
    firstName: "ADELA",
    lastName: "Zamudio",
    description: "La experiencia más completa del evento.",
    price: 45,
    image: adelaImage,
    imageAlt: "Ilustración de Adela Zamudio",
    accent: "yellow",
    featured: true,
    features: [
      { label: "Refrigerio", type: "snack" },
      { label: "Credencial", type: "credential" },
      { label: "Vaso (edición limitada)", type: "cup" },
      { label: "Velita", type: "candle" },
      { label: "Scrunchie", type: "scrunchie" },
      { label: "Stickers", type: "stickers" },
    ],
    availability: { enabled: false, percentage: 100, status: "available" },
  },
  {
    id: "juana",
    packageNumber: 3,
    firstName: "JUANA",
    lastName: "Azurduy",
    description: "Lo esencial para tu experiencia.",
    price: 16,
    image: juanaImage,
    imageAlt: "Ilustración de Juana Azurduy",
    accent: "turquoise",
    featured: false,
    features: [
      { label: "Refrigerio", type: "snack" },
      { label: "Credencial", type: "credential" },
      { label: "Stickers", type: "stickers" },
    ],
    availability: { enabled: false, percentage: 100, status: "available" },
  },
]
