import { Boxes, List, type LucideIcon, ScanQrCode, UserCog, Users } from "lucide-react"

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
    title: "Registro de Equipos",
    view: "registrationsTeams",
    icon: Boxes,
  },
  {
    title: "Acreditación del Evento",
    view: "accreditation",
    icon: Users,
    allowedRoles: ["accreditation"],
  },
  {
    title: "Escanear QR",
    view: "scanner",
    icon: ScanQrCode,
    allowedRoles: ["accreditation"],
  },
  {
    title: "Organizadores",
    view: "organizers",
    icon: UserCog,
    // sin allowedRoles → solo admins lo ven (el filtro ya lo maneja isAdmin)
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
