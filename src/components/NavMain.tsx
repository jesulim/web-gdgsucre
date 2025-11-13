"use client"

import type { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"

type ViewType = "registrations" | "accreditation"

export function NavMain({
  items,
  currentView,
  onNavigate,
}: {
  items: {
    title: string
    view: ViewType
    icon?: LucideIcon
  }[]
  currentView?: ViewType
  onNavigate?: (view: ViewType) => void
}) {
  const { isMobile, setOpenMobile } = useSidebar()

  const handleClick = (view: ViewType) => {
    onNavigate?.(view)
    // Cerrar el sidebar en móvil después de hacer clic
    if (isMobile) {
      setOpenMobile(false)
    }
  }

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map(item => (
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
