/**
 * Secciones de navegación de la landing de NWD-26.
 *
 * ESTE ES EL ÚNICO LUGAR donde se edita el menú de navegación.
 *
 * Para agregar, quitar o reordenar una sección del header, edita `NWD26_SECTIONS`.
 * No hace falta tocar `components/events/nwd-26/Header.astro`: el desktop y el
 * menú móvil se generan desde acá, y todas las páginas que reutilizan el header
 * (la landing y las de registro/acreditación) los reciben igual.
 *
 * El `href` debe ser el ancla de la sección en la landing, y el `id` de esa
 * sección en su componente debe coincidir. Ej. para una sección "Agenda":
 *   1. acá:      { href: "#agenda", label: "Agenda" }
 *   2. en el componente de la sección: <section id="agenda">
 */

export interface NavSection {
  /** Ancla dentro de la landing, ej. "#inicio" */
  href: string
  label: string
}

/** Ruta canónica de la landing. `/` también la sirve, pero esta es la estable. */
export const NWD26_LANDING_HREF = "/eventos/nwd-26"

/** Ancla del inicio de la landing. La comparten el primer link y el logo. */
export const NWD26_HOME_ANCHOR = "#inicio"

export const NWD26_SECTIONS: NavSection[] = [
  { href: NWD26_HOME_ANCHOR, label: "Inicio" },
  { href: "#sobre-el-evento", label: "Sobre el Evento" },
  { href: "#paquetes", label: "Paquetes" },
  { href: "#eventos-pasados", label: "Eventos pasados" },
  { href: "#organizers", label: "Organizadoras" },
]
