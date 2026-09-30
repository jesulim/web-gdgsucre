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
  image: string
  imageAlt: string
  accent: "blue" | "yellow" | "turquoise"
  featured: boolean
  features: { label: string; type: PackageFeatureType }[]
  availability: { enabled: boolean; percentage: number; status: "available" | "low" | "sold-out" }
}

// Replace these files in public/events/iwd-26/packages/ when the portraits are ready.
export const packages: EventPackage[] = [
  {
    id: "bartolina",
    packageNumber: 2,
    firstName: "BARTOLINA",
    lastName: "Sisa",
    description: "Un recuerdo especial para vivir el encuentro.",
    price: 30,
    image: "/events/iwd-26/packages/bartolina-sisa.webp",
    imageAlt: "Ilustración de Bartolina Sisa",
    accent: "blue",
    featured: false,
    features: [
      { label: "Refrigerio", type: "snack" },
      { label: "Credencial", type: "credential" },
      { label: "Scrunchie", type: "scrunchie" },
      { label: "Aretes (exclusivos del Día de la Mujer Boliviana)", type: "earrings" },
      { label: "Stickers", type: "stickers" },
    ],
    availability: { enabled: false, percentage: 100, status: "available" },
  },
  {
    id: "adela",
    packageNumber: 1,
    firstName: "ADELA",
    lastName: "Zamudio",
    description: "La experiencia más completa del evento.",
    price: 45,
    image: "/events/iwd-26/packages/adela-zamudio.webp",
    imageAlt: "Ilustración de Adela Zamudio",
    accent: "yellow",
    featured: true,
    features: [
      { label: "Refrigerio", type: "snack" },
      { label: "Credencial", type: "credential" },
      { label: "Vaso (edición limitada)", type: "cup" },
      { label: "Velitas", type: "candle" },
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
    description: "Lo esencial para acompañarte en esta experiencia.",
    price: 15,
    image: "/events/iwd-26/packages/juana-azurduy.webp",
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
