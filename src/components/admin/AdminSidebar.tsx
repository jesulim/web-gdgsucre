import { Box, List, ScanQrCode, Users } from "lucide-react"
import type { ComponentProps } from "react"
import { NavMain } from "@/components/admin/NavMain"
import { NavUser } from "@/components/admin/NavUser"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

interface UserData {
  name: string
  email: string
  avatar: string
}

type ViewType = "registrations" | "accreditation" | "scanner"

const defaultData = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Registro de Participantes",
      view: "registrations" as ViewType,
      icon: List,
    },
    {
      title: "Acreditación del Evento",
      view: "accreditation" as ViewType,
      icon: Users,
    },
    {
      title: "Escanear QR",
      view: "scanner" as ViewType,
      icon: ScanQrCode,
    },
  ],
}

export function AppSidebar({
  isAuthenticated = false,
  user,
  currentView = "registrations",
  onNavigate,
  ...props
}: ComponentProps<typeof Sidebar> & {
  isAuthenticated?: boolean
  user?: UserData
  currentView?: ViewType
  onNavigate?: (view: ViewType) => void
}) {
  const userData = user || defaultData.user

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="/">
                <Box className="!size-5" />
                <span className="text-base font-semibold">GDG Sucre</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={defaultData.navMain} currentView={currentView} onNavigate={onNavigate} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={userData} isAuthenticated={isAuthenticated} />
      </SidebarFooter>
    </Sidebar>
  )
}
