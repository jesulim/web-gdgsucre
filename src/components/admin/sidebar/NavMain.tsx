import { List, type LucideIcon, ScanQrCode, Ticket, Users } from "lucide-react"

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
}

const sidebarSections: SidebarSection[] = [
  {
    title: "Eventos",
    view: "events",
    icon: Ticket,
  },
  {
    title: "Registro de Participantes",
    view: "registrations",
    icon: List,
  },
  {
    title: "Acreditación del Evento",
    view: "accreditation",
    icon: Users,
  },
  {
    title: "Escanear QR",
    view: "scanner",
    icon: ScanQrCode,
  },
]

export function NavMain({
  currentView,
  onNavigate,
}: {
  currentView: ViewType
  onNavigate?: (view: ViewType) => void
}) {
  const { isMobile, setOpenMobile } = useSidebar()

  const handleClick = (view: ViewType) => {
    onNavigate?.(view)
    // Cerrar el sidebar en móvil después de hacer clic
    if (isMobile) setOpenMobile(false)
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {sidebarSections.map(item => (
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
