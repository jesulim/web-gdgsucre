import { Box } from "lucide-react"
import type { ComponentProps } from "react"

import { NavMain } from "@/components/admin/sidebar/NavMain"
import { UserMenu } from "@/components/admin/sidebar/UserMenu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

import type { UserData, ViewType } from "../Dashboard"

export function AdminSidebar({
  userData,
  currentView = "registrations",
  onNavigate,
  ...props
}: ComponentProps<typeof Sidebar> & {
  userData: UserData
  currentView: ViewType
  onNavigate?: (view: ViewType) => void
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:p-1.5!">
              <a href="/">
                <Box className="size-5!" />
                <span className="text-base font-semibold">GDG Sucre</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain currentView={currentView} onNavigate={onNavigate} />
      </SidebarContent>

      <SidebarFooter>
        <UserMenu user={userData} />
      </SidebarFooter>
    </Sidebar>
  )
}
