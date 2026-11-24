import type { ImageMetadata } from "astro"

import tenMindsLogo from "@/assets/sponsors/10minds.webp"
import cisichLogo from "@/assets/sponsors/CISISH.webp"
import cbaLogo from "@/assets/sponsors/cba.webp"
import ccaLogo from "@/assets/sponsors/cca.webp"
import ccaDarkLogo from "@/assets/sponsors/cca2.webp"
import delveLogo from "@/assets/sponsors/delve.webp"
import dhLogo from "@/assets/sponsors/dh.webp"
import droBotsLogo from "@/assets/sponsors/dro-bots.webp"
import educationUsaLogo from "@/assets/sponsors/education_usa.webp"
import facultadEconomiaLogo from "@/assets/sponsors/facultad-economia.webp"
import helvetasLogo from "@/assets/sponsors/helvetas.webp"
import ismoLogo from "@/assets/sponsors/ISMO.webp"
import itGroupLogo from "@/assets/sponsors/it-group.webp"
import iteraLogo from "@/assets/sponsors/itera.webp"
import jalauLogo from "@/assets/sponsors/jalau.webp"
import jetbrainsLogo from "@/assets/sponsors/jetbrains.webp"
import nibleLogo from "@/assets/sponsors/logo-nible-dark.webp"
import nibleDarkLogo from "@/assets/sponsors/logo-nible-light.webp"
import nibleEmblemLogo from "@/assets/sponsors/logo-nible-N-dark.webp"
import meruLogo from "@/assets/sponsors/Meru.webp"
import magisterioRuralLogo from "@/assets/sponsors/magisterio-rural.webp"
import nappLogo from "@/assets/sponsors/napp.webp"
import nappDarkLogo from "@/assets/sponsors/napp-dark.webp"
import saritaSportLogo from "@/assets/sponsors/SaritaSport.webp"
import sibLogo from "@/assets/sponsors/SIB.webp"
import salviettiLogo from "@/assets/sponsors/salvietti.webp"
import sistemaEmprendedorLogo from "@/assets/sponsors/sistema_emprendedor.webp"
import unosquareLogo from "@/assets/sponsors/unosquare.webp"
import vaquitaLogo from "@/assets/sponsors/vaquita-logo.webp"
import xyzLogo from "@/assets/sponsors/xyz.webp"

export type SponsorCategory =
  | "Tecnología & Software"
  | "Educación & Talento"
  | "Ecosistema & Comunidad"
  | "Industria & Servicios"

export type SponsorMasonrySize = "compact" | "regular" | "featured"

export type SponsorLogoTreatment =
  | "theme-pair"
  | "monochrome-dark"
  | "dark-stage"
  | "light-stage"
  | "brand-tile"
  | "adaptive"

export interface SponsorItem {
  id: string
  name: string
  category: SponsorCategory
  logo: ImageMetadata
  darkLogo?: ImageMetadata
  emblem?: ImageMetadata
  logoTreatment: SponsorLogoTreatment
  stageBgClass?: string
  imgScaleClass?: string
  darkImgScaleClass?: string
  masonrySize: SponsorMasonrySize
  note: string
  url?: string
  featuredInLanding?: boolean
}

export const SPONSOR_CATEGORY_META: Record<
  SponsorCategory,
  {
    accentBarClass: string
    dotClass: string
    badgeClass: string
    filterActiveClass: string
  }
> = {
  "Tecnología & Software": {
    accentBarClass: "bg-blue-500",
    dotClass: "bg-blue-500",
    badgeClass:
      "bg-blue-pastel/70 text-black border-blue-500/30 dark:bg-blue-500/15 dark:text-io-accent dark:border-blue-500/30",
    filterActiveClass:
      "bg-blue-pastel text-black border-blue-500 dark:bg-blue-500/25 dark:text-white dark:border-io-accent",
  },
  "Educación & Talento": {
    accentBarClass: "bg-green-500",
    dotClass: "bg-green-500",
    badgeClass:
      "bg-green-pastel/70 text-black border-green-500/30 dark:bg-green-500/15 dark:text-io-green-light dark:border-green-500/30",
    filterActiveClass:
      "bg-green-pastel text-black border-green-500 dark:bg-green-500/25 dark:text-white dark:border-io-green-light",
  },
  "Ecosistema & Comunidad": {
    accentBarClass: "bg-yellow-600",
    dotClass: "bg-yellow-600",
    badgeClass:
      "bg-yellow-pastel/80 text-black border-yellow-600/35 dark:bg-yellow-600/15 dark:text-io-yellow dark:border-yellow-600/35",
    filterActiveClass:
      "bg-yellow-pastel text-black border-yellow-600 dark:bg-yellow-600/25 dark:text-white dark:border-io-yellow",
  },
  "Industria & Servicios": {
    accentBarClass: "bg-red-500",
    dotClass: "bg-red-500",
    badgeClass:
      "bg-red-pastel/75 text-black border-red-500/30 dark:bg-red-500/15 dark:text-red-300 dark:border-red-500/30",
    filterActiveClass:
      "bg-red-pastel text-black border-red-500 dark:bg-red-500/25 dark:text-white dark:border-red-400",
  },
}

export const ALL_SPONSOR_ASSET_MODULES: readonly ImageMetadata[] = [
  tenMindsLogo,
  cisichLogo,
  ismoLogo,
  meruLogo,
  sibLogo,
  saritaSportLogo,
  cbaLogo,
  ccaLogo,
  ccaDarkLogo,
  delveLogo,
  dhLogo,
  droBotsLogo,
  educationUsaLogo,
  facultadEconomiaLogo,
  helvetasLogo,
  itGroupLogo,
  iteraLogo,
  jalauLogo,
  jetbrainsLogo,
  nibleEmblemLogo,
  nibleLogo,
  nibleDarkLogo,
  magisterioRuralLogo,
  nappDarkLogo,
  nappLogo,
  salviettiLogo,
  sistemaEmprendedorLogo,
  unosquareLogo,
  vaquitaLogo,
  xyzLogo,
]

export const SPONSORS: SponsorItem[] = [
  {
    id: "napp",
    name: "Fundación NAPP",
    category: "Ecosistema & Comunidad",
    logo: nappLogo,
    darkLogo: nappDarkLogo,
    logoTreatment: "theme-pair",
    imgScaleClass: "scale-120",
    masonrySize: "featured",
    note: "Impulso a la innovación, mentoría y emprendimiento tecnológico.",
    url: "https://fundacion-napp.org/",
    featuredInLanding: true,
  },
  {
    id: "10minds",
    name: "10MINDS",
    category: "Educación & Talento",
    logo: tenMindsLogo,
    logoTreatment: "adaptive",
    masonrySize: "regular",
    note: "Formación y comunidad aliada en eventos anuales de Sucre.",
    url: "https://10minds.org/",
    featuredInLanding: true,
  },
  {
    id: "jetbrains",
    name: "JetBrains",
    category: "Tecnología & Software",
    logo: jetbrainsLogo,
    logoTreatment: "adaptive",
    masonrySize: "compact",
    note: "Herramientas y licencias para desarrolladores.",
    url: "https://www.jetbrains.com/",
    featuredInLanding: true,
  },
  {
    id: "meru",
    name: "Meru",
    category: "Tecnología & Software",
    logo: meruLogo,
    logoTreatment: "monochrome-dark",
    masonrySize: "regular",
    note: "Respaldo al ecosistema técnico en Sucre.",
  },
  {
    id: "digital-harbor",
    name: "Digital Harbor",
    category: "Tecnología & Software",
    logo: dhLogo,
    logoTreatment: "monochrome-dark",
    masonrySize: "featured",
    note: "Ingeniería de software conectando talento boliviano con proyectos globales.",
    url: "https://digitalharborbolivia.com/",
    featuredInLanding: true,
  },
  {
    id: "helvetas",
    name: "Helvetas Bolivia",
    category: "Ecosistema & Comunidad",
    logo: helvetasLogo,
    logoTreatment: "light-stage",
    masonrySize: "compact",
    note: "Cooperación y desarrollo sostenible.",
    url: "https://www.helvetas.org/es/bolivia",
  },
  {
    id: "vaquita",
    name: "Vaquita",
    category: "Industria & Servicios",
    logo: vaquitaLogo,
    logoTreatment: "adaptive",
    imgScaleClass: "scale-125",
    masonrySize: "featured",
    note: "Soluciones financieras y pagos digitales para la comunidad.",
    featuredInLanding: true,
  },
  {
    id: "dro-bots",
    name: "Dro-bots",
    category: "Tecnología & Software",
    logo: droBotsLogo,
    logoTreatment: "light-stage",
    masonrySize: "compact",
    note: "Robótica, drones y electrónica educativa.",
    url: "https://www.facebook.com/profile.php?id=100083024454287",
  },
  {
    id: "cca",
    name: "CCA Instituto Técnico",
    category: "Educación & Talento",
    logo: ccaLogo,
    darkLogo: ccaDarkLogo,
    logoTreatment: "theme-pair",
    imgScaleClass: "scale-140",
    darkImgScaleClass: "scale-140",
    masonrySize: "regular",
    note: "Corporación Cibernética Americana · Formación técnica.",
  },
  {
    id: "salvietti",
    name: "Salvietti",
    category: "Industria & Servicios",
    logo: salviettiLogo,
    logoTreatment: "adaptive",
    imgScaleClass: "scale-135",
    masonrySize: "compact",
    note: "Acompañamiento en jornadas de comunidad.",
    url: "https://www.facebook.com/salvietti.oficial",
  },
  {
    id: "nible",
    name: "Nible",
    category: "Tecnología & Software",
    logo: nibleLogo,
    darkLogo: nibleDarkLogo,
    emblem: nibleEmblemLogo,
    logoTreatment: "theme-pair",
    masonrySize: "featured",
    note: "Diseño de producto digital y desarrollo tecnológico.",
    featuredInLanding: true,
  },
  {
    id: "sib-chuquisaca",
    name: "S.I.B. Chuquisaca",
    category: "Ecosistema & Comunidad",
    logo: sibLogo,
    logoTreatment: "light-stage",
    masonrySize: "regular",
    note: "Sociedad de Ingenieros de Bolivia · Departamental Chuquisaca.",
  },
  {
    id: "delve",
    name: "Delve",
    category: "Tecnología & Software",
    logo: delveLogo,
    logoTreatment: "monochrome-dark",
    masonrySize: "compact",
    note: "Tecnología e innovación educativa.",
    url: "https://delveedu.com/",
  },
  {
    id: "jala-university",
    name: "Jala University",
    category: "Educación & Talento",
    logo: jalauLogo,
    logoTreatment: "light-stage",
    imgScaleClass: "scale-115",
    masonrySize: "featured",
    note: "Formación universitaria especializada en ingeniería de software.",
    featuredInLanding: true,
  },
  {
    id: "ismo",
    name: "ISMO",
    category: "Industria & Servicios",
    logo: ismoLogo,
    logoTreatment: "brand-tile",
    masonrySize: "regular",
    note: "Manufactura e ingeniería con presencia regional.",
  },
  {
    id: "education-usa",
    name: "EducationUSA Bolivia",
    category: "Educación & Talento",
    logo: educationUsaLogo,
    logoTreatment: "light-stage",
    masonrySize: "compact",
    note: "Orientación académica y becas internacionales.",
    url: "https://www.facebook.com/EducationUSABolivia",
  },
  {
    id: "cba-sucre",
    name: "CBA Sucre",
    category: "Educación & Talento",
    logo: cbaLogo,
    logoTreatment: "brand-tile",
    stageBgClass: "bg-[#f6f6f6]",
    masonrySize: "featured",
    note: "Centro Boliviano Americano · Educación, cultura e intercambio.",
    url: "https://www.facebook.com/CBAFanPage/",
    featuredInLanding: true,
  },
  {
    id: "itera",
    name: "iTera Soluciones Digitales",
    category: "Tecnología & Software",
    logo: iteraLogo,
    logoTreatment: "dark-stage",
    imgScaleClass: "scale-135",
    masonrySize: "regular",
    note: "Consultoría y desarrollo de soluciones digitales.",
    url: "https://www.facebook.com/profile.php?id=100063753325772",
  },
  {
    id: "sistema-emprendedor",
    name: "Sistema Emprendedor Sucre",
    category: "Ecosistema & Comunidad",
    logo: sistemaEmprendedorLogo,
    logoTreatment: "light-stage",
    masonrySize: "compact",
    note: "Red de impulso emprendedor en Sucre.",
    url: "https://sistema-emprendedor-sucre.web.app/",
  },
  {
    id: "facultad-economia-usfx",
    name: "Facultad de Ciencias Económicas y Empresariales (USFX)",
    category: "Educación & Talento",
    logo: facultadEconomiaLogo,
    logoTreatment: "adaptive",
    masonrySize: "featured",
    note: "Alianza académica y auditorios junto a la USFX.",
    url: "https://economicas.usfx.bo/",
  },
  {
    id: "unosquare",
    name: "Unosquare",
    category: "Tecnología & Software",
    logo: unosquareLogo,
    logoTreatment: "brand-tile",
    masonrySize: "regular",
    note: "Desarrollo de software y talento en ingeniería.",
    url: "https://www.unosquare.com/",
  },
  {
    id: "cisich",
    name: "CISICH",
    category: "Ecosistema & Comunidad",
    logo: cisichLogo,
    logoTreatment: "light-stage",
    masonrySize: "regular",
    note: "Colegio de Ingenieros de Sistemas e Informática de Chuquisaca.",
  },
  {
    id: "sarita-sport",
    name: "Sarita Sport",
    category: "Industria & Servicios",
    logo: saritaSportLogo,
    logoTreatment: "light-stage",
    masonrySize: "compact",
    note: "Indumentaria deportiva para eventos comunitarios.",
  },
  {
    id: "magisterio-rural",
    name: "Cooperativa Magisterio Rural",
    category: "Industria & Servicios",
    logo: magisterioRuralLogo,
    logoTreatment: "brand-tile",
    masonrySize: "featured",
    note: "Cooperativa de Ahorro y Crédito Abierta de Chuquisaca.",
    url: "https://www.facebook.com/CMRChuq/",
  },
  {
    id: "it-group",
    name: "ITGroup Systems",
    category: "Tecnología & Software",
    logo: itGroupLogo,
    logoTreatment: "light-stage",
    masonrySize: "regular",
    note: "Integración tecnológica y sistemas empresariales.",
    url: "https://www.facebook.com/ITGroupSystems/",
  },
  {
    id: "xyz",
    name: "XYZ Sonido e Iluminación",
    category: "Industria & Servicios",
    logo: xyzLogo,
    logoTreatment: "brand-tile",
    stageBgClass: "bg-[#020329]",
    masonrySize: "regular",
    note: "Audio profesional, pantallas LED e iluminación escénica.",
    url: "https://www.facebook.com/profile.php?id=100057052885906&mibextid=ZbWKwL",
  },
]

export const FEATURED_SPONSORS = SPONSORS.filter(sponsor => sponsor.featuredInLanding)

export const INSTITUTIONAL_CONTACT = {
  email: "gdgsucre@gmail.com",
  emailHref:
    "mailto:gdgsucre@gmail.com?subject=%5BSponsor%20GDG%20Sucre%5D%20Consulta%20de%20patrocinio",
  websiteLabel: "gdgsucre.com",
  websiteUrl: "https://gdgsucre.com",
  calendarLabel: "calendario.gdgsucre.com",
  calendarUrl: "https://calendario.gdgsucre.com",
  handle: "@gdg.sucre",
  socials: [
    {
      name: "LinkedIn",
      href: "https://www.linkedin.com/company/gdgsucre/",
      handle: "company/gdgsucre",
    },
    {
      name: "Instagram",
      href: "https://www.instagram.com/gdg.sucre/",
      handle: "@gdg.sucre",
    },
    {
      name: "Facebook",
      href: "https://www.facebook.com/gdgsucre",
      handle: "/gdgsucre",
    },
    {
      name: "TikTok",
      href: "https://www.tiktok.com/@gdgsucre",
      handle: "@gdgsucre",
    },
    {
      name: "X (Twitter)",
      href: "https://twitter.com/gdg_sucre",
      handle: "@gdg_sucre",
    },
    {
      name: "YouTube",
      href: "https://www.youtube.com/@gdgsucre",
      handle: "@gdgsucre",
    },
  ],
} as const

export const ANNUAL_MILESTONES = [
  {
    title: "Build with AI",
    metric: "167+ asistentes",
    accentColorClass: "bg-blue-500",
    description:
      "Talleres prácticos de desarrollo y prototipado con modelos de Inteligencia Artificial y Gemini.",
  },
  {
    title: "Google I/O Extended",
    metric: "219+ asistentes · 350 inscritos",
    accentColorClass: "bg-red-500",
    description:
      "Novedades oficiales de Google con charlas técnicas y +951 reproducciones en transmisión online.",
  },
  {
    title: "DevFest Sucre",
    metric: "+200 asistentes por edición",
    accentColorClass: "bg-yellow-600",
    description:
      "Nuestro encuentro tecnológico anual insignia con speakers locales, nacionales e internacionales.",
  },
  {
    title: "Comunidad todo el año",
    metric: "Agenda abierta continua",
    accentColorClass: "bg-green-500",
    description:
      "Meetups, sesiones prácticas y difusión permanente del ecosistema local en calendario.gdgsucre.com.",
  },
] as const

export const TECH_TOPICS = [
  "IA y Gemini",
  "Google Cloud",
  "Android y Flutter",
  "Firebase",
  "Desarrollo Web",
  "UX / UI",
] as const

export const REACH_METRICS = [
  {
    value: "386+",
    label: "Asistentes presenciales en eventos insignia",
    accentClass: "text-blue-600 dark:text-io-accent",
  },
  {
    value: "31.200+",
    label: "Personas alcanzadas en campañas digitales",
    accentClass: "text-green-700 dark:text-io-green-light",
  },
  {
    value: "71.724+",
    label: "Visualizaciones totales en redes sociales",
    accentClass: "text-yellow-700 dark:text-io-yellow",
  },
  {
    value: "951+",
    label: "Reproducciones online en transmisiones técnicas",
    accentClass: "text-red-600 dark:text-red-400",
  },
] as const

export const STRATEGIC_PILLARS = [
  {
    title: "Visibilidad de marca",
    description:
      "Presencia destacada en campañas digitales, sitio web oficial, credenciales y material gráfico de cada actividad.",
    borderAccentClass: "border-t-blue-500",
    tag: "01 // ALCANCE",
  },
  {
    title: "Acceso a talento tech",
    description:
      "Conexión directa con desarrolladores, diseñadores y estudiantes universitarios para pasantías, mentoría y reclutamiento.",
    borderAccentClass: "border-t-green-500",
    tag: "02 // TALENTO",
  },
  {
    title: "Posicionamiento en innovación",
    description:
      "Asocia a tu empresa o institución con el aprendizaje abierto, la tecnología actual y el desarrollo regional en Bolivia.",
    borderAccentClass: "border-t-yellow-600",
    tag: "03 // MARCA",
  },
  {
    title: "Impacto real en la comunidad",
    description:
      "Tu aporte sostiene el acceso gratuito: permite financiar auditorios, equipamiento, refrigerios y talleres abiertos.",
    borderAccentClass: "border-t-red-500",
    tag: "04 // IMPACTO",
  },
] as const

export const AUDIENCE_SEGMENTS = [
  {
    label: "Estudiantes universitarios",
    percentage: 61,
    barColorClass: "bg-blue-500",
    dotClass: "bg-blue-500",
  },
  {
    label: "Profesionales y developers",
    percentage: 23,
    barColorClass: "bg-red-500",
    dotClass: "bg-red-500",
  },
  {
    label: "Startups y emprendedores",
    percentage: 12,
    barColorClass: "bg-yellow-600",
    dotClass: "bg-yellow-600",
  },
  {
    label: "Docentes y otros perfiles",
    percentage: 4,
    barColorClass: "bg-green-500",
    dotClass: "bg-green-500",
  },
] as const

export const CONTRIBUTION_MODALITIES = [
  {
    number: "01",
    title: "Aporte económico",
    description:
      "Respaldo directo para cubrir auditorios, refrigerios, materiales, acreditación y logística operativa de nuestros encuentros.",
    topBorderClass: "border-t-blue-500",
    pillClass: "bg-blue-pastel text-black dark:bg-blue-500/20 dark:text-io-accent",
  },
  {
    number: "02",
    title: "Aporte en especie",
    description:
      "Contribución mediante refrigerios, espacios físicos, equipamiento, conectividad, souvenirs, licencias o premios para asistentes.",
    topBorderClass: "border-t-yellow-600",
    pillClass: "bg-yellow-pastel text-black dark:bg-yellow-600/20 dark:text-io-yellow",
  },
  {
    number: "03",
    title: "Oportunidades",
    description:
      "Becas de formación, cursos, certificaciones, mentorías técnicas o convocatorias de pasantías para miembros activos.",
    topBorderClass: "border-t-green-500",
    pillClass: "bg-green-pastel text-black dark:bg-green-500/20 dark:text-io-green-light",
  },
] as const

export const BRAND_DELIVERABLES = [
  "Logo en piezas gráficas, sitio web y plataformas oficiales de eventos",
  "Menciones en Instagram, TikTok, Facebook y LinkedIn",
  "Agradecimiento en escenario durante cada jornada",
  "Espacio para banner, stand o material promocional en sede",
  "Reporte de alcance e impacto posterior al evento",
  "Presencia en meetups y eventos previos (Road to DevFest)",
  "Material de tu marca en los kits para asistentes",
  "Fotografías y videos oficiales del evento para tus canales",
] as const
