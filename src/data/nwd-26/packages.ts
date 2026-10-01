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

export interface PackageColors {
  accent: string // Número, nombre cursiva y líneas de acento
  border: string // Borde de la tarjeta
  cardBg?: string // Fondo de la tarjeta (opcional)
  priceBg: string // Pastilla de precio
  divider: string // Línea divisora
  bullet: string // Punto de los beneficios
  blob: string // Gradiente detrás del personaje
}

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
  colors: PackageColors
  featured: boolean
  features: { label: string; type: PackageFeatureType }[]
  availability: {
    enabled: boolean
    percentage: number
    status: "available" | "low" | "sold-out"
  }
}

export const packages: EventPackage[] = [
  {
    id: "juana",
    packageNumber: 1,
    firstName: "JUANA",
    lastName: "Azurduy",
    description: "Lo esencial para tu experiencia.",
    price: 16,
    image: juanaImage,
    imageAlt: "Ilustración de Juana Azurduy",
    accent: "turquoise",
    featured: false,
    colors: {
      accent: "#08aebd",
      border: "#8ee7ef",
      priceBg: "#cef7fb",
      divider: "rgba(43, 196, 210, 0.52)",
      bullet: "#6edce6",
      blob: "radial-gradient(ellipse at 44% 48%, rgba(78, 199, 239, 0.47) 0%, rgba(139, 221, 247, 0.31) 54%, rgba(192, 239, 253, 0.15) 75%, transparent 76%)",
    },
    features: [
      { label: "Refrigerio", type: "snack" },
      { label: "Credencial", type: "credential" },
      { label: "Stickers", type: "stickers" },
    ],
    availability: { enabled: false, percentage: 100, status: "available" },
  },
  {
    id: "bartolina",
    packageNumber: 2,
    firstName: "BARTOLINA",
    lastName: "Sisa",
    description: "Un recuerdo especial para vivir el encuentro.",
    price: 30,
    image: bartolinaImage,
    imageAlt: "Ilustración de Bartolina Sisa",
    accent: "yellow",
    featured: true,
    colors: {
      accent: "#f3ac00",
      border: "#f6be3a",
      cardBg: "#fffdf7",
      priceBg: "#fff0bd",
      divider: "rgba(226, 172, 36, 0.58)",
      bullet: "#f2c746",
      blob: "radial-gradient(ellipse at 44% 48%, rgba(246, 190, 58, 0.2) 0%, rgba(246, 190, 58, 0.09) 54%, rgba(246, 190, 58, 0.09) 75%, transparent 76%)",
    },
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
    packageNumber: 3,
    firstName: "ADELA",
    lastName: "Zamudio",
    description: "La experiencia más completa del evento.",
    price: 45,
    image: adelaImage,
    imageAlt: "Ilustración de Adela Zamudio",
    accent: "blue",
    featured: false,
    colors: {
      accent: "#1355cc",
      border: "#add8ff",
      priceBg: "#e5f1ff",
      divider: "rgba(70, 156, 235, 0.48)",
      bullet: "#7db9f4",
      blob: "radial-gradient(ellipse at 44% 48%, rgba(78, 199, 239, 0.47) 0%, rgba(139, 221, 247, 0.31) 54%, rgba(192, 239, 253, 0.15) 75%, transparent 76%)",
    },
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
]
