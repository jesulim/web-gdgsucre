export type SiteId = "gdg" | "wtm"

export interface SiteConfig {
  id: SiteId
  name: string
  description: string
  favicon: string
  ogImage: string
}

const SITES: Record<SiteId, SiteConfig> = {
  gdg: {
    id: "gdg",
    name: "Google Developer Group Sucre",
    description: "Google Developer Group Sucre",
    favicon: "/favicon.svg",
    ogImage: "/og.png",
  },
  wtm: {
    id: "wtm",
    name: "Women Techmakers Sucre",
    description: "Women Techmakers Sucre",
    favicon: "/WTM_Logo_Icon_32x32.png",
    ogImage: "/og-wtm.png",
  },
}

const siteId = (import.meta.env.PUBLIC_SITE ?? "gdg") as SiteId

/**
 * Configuración del sitio que se está sirviendo. Se define con la variable de
 * entorno PUBLIC_SITE ("gdg" | "wtm"); cada proyecto de Vercel usa un valor distinto
 * para desplegar gdgsucre.com y wtmsucre.com desde el mismo repositorio.
 */
export const site: SiteConfig = SITES[siteId] ?? SITES.gdg
