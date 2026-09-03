import {
  Boxes,
  CalendarDays,
  ClipboardCheck,
  Form,
  List,
  type LucideIcon,
  ScanQrCode,
  SquareUserRound,
  Ticket,
  UserStar,
  Users,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import type { ViewType } from "../Dashboard"

interface SidebarSection {
  group?: string
  title: string
  view: ViewType
  icon?: LucideIcon
  allowedRoles?: string[]
}

const sidebarSections: SidebarSection[] = [
  {
    group: "Gestión",
    title: "Registro de Participantes",
    view: "registrations",
    icon: List,
    allowedRoles: ["accreditation"],
  },
  {
    group: "Gestión",
    title: "Acreditación del Evento",
    view: "accreditation",
    icon: SquareUserRound,
    allowedRoles: ["accreditation"],
  },
  {
    group: "Gestión",
    title: "Escanear QR",
    view: "scanner",
    icon: ScanQrCode,
    allowedRoles: ["accreditation"],
  },
  {
    group: "Gestión",
    title: "Registro de Equipos",
    view: "registrationsTeams",
    icon: Boxes,
    allowedRoles: ["accreditation"],
  },
  {
    group: "Gestión",
    title: "Organizadores",
    view: "organizers",
    icon: UserStar,
  },
  {
    group: "Configuración",
    title: "Formulario de Registro",
    view: "formFields",
    icon: Form,
  },
  {
    group: "Configuración",
    title: "Actividades",
    view: "activities",
    icon: ClipboardCheck,
  },
  {
    group: "Plataforma",
    title: "Eventos",
    view: "events",
    icon: Ticket,
  },
  {
    group: "Plataforma",
    title: "Eventos del Calendario",
    view: "calendarEvents",
    icon: CalendarDays,
  },
  {
    group: "Plataforma",
    title: "Comunidades",
    view: "communities",
    icon: Users,
  },
]

export function NavMain({
  currentView,
  isAdmin,
  currentRole,
  onNavigate,
}: {
  currentView: ViewType
  isAdmin?: boolean
  currentRole?: string
  onNavigate?: (view: ViewType) => void
}) {
  const { isMobile, setOpenMobile } = useSidebar()

  const handleClick = (view: ViewType) => {
    onNavigate?.(view)
    // Cerrar el sidebar en móvil después de hacer clic
    if (isMobile) setOpenMobile(false)
  }

  const filteredSections = sidebarSections.filter(section => {
    if (isAdmin) return true
    return section.allowedRoles?.includes(currentRole ?? "")
  })

  const groupedSections = filteredSections.reduce<Record<string, SidebarSection[]>>(
    (acc, section) => {
      const group = section.group ?? "Misceláneo"
      acc[group] = [...(acc[group] ?? []), section]
      return acc
    },
    {} as Record<string, SidebarSection[]>
  )

  return Object.keys(groupedSections).map(group => (
    <SidebarGroup key={group}>
      <SidebarGroupLabel>{group}</SidebarGroupLabel>
      <SidebarMenu>
        {groupedSections[group].map(item => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={currentView === item.view}
              onClick={() => handleClick(item.view)}
            >
              {item.icon && <item.icon />}
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  ))
}
