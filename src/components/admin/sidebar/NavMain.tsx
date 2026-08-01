import {
  Boxes,
  Building2,
  CalendarDays,
  List,
  type LucideIcon,
  ScanQrCode,
  SquareUserRound,
  UserCog,
} from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

import type { ViewType } from "../Dashboard"

interface SidebarSection {
  title: string
  view: ViewType
  icon?: LucideIcon
  allowedRoles?: string[]
}

const sidebarSections: SidebarSection[] = [
  {
    title: "Registro de Participantes",
    view: "registrations",
    icon: List,
    allowedRoles: ["accreditation"],
  },
  {
    title: "Acreditación del Evento",
    view: "accreditation",
    icon: SquareUserRound,
    allowedRoles: ["accreditation"],
  },
  {
    title: "Escanear QR",
    view: "scanner",
    icon: ScanQrCode,
    allowedRoles: ["accreditation"],
  },
  {
    title: "Registro de Equipos",
    view: "registrationsTeams",
    icon: Boxes,
    allowedRoles: ["accreditation"],
  },
  {
    title: "Organizadores",
    view: "organizers",
    icon: UserCog,
  },
  {
    title: "Eventos del Calendario",
    view: "calendarEvents",
    icon: CalendarDays,
  },
  {
    title: "Comunidades",
    view: "communities",
    icon: Building2,
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

  return (
    <SidebarGroup>
      <SidebarMenu>
        {filteredSections.map(item => (
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
  )
}
