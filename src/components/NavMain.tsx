"use client"

import type { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map(item => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              tooltip={item.title}
              isActive={currentView === item.view}
              onClick={() => onNavigate?.(item.view)}
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
