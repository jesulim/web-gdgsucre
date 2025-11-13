"use client"

import { useState } from "react"
import { AccreditationTable } from "@/components/admin/AccreditationTable"
import { AdminTabs } from "@/components/admin/AdminTabs"
import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/SiteHeader"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface UserData {
  name: string
  email: string
  avatar: string
}

type ViewType = "registrations" | "accreditation"

export function Dashboard({
  isAuthenticated = false,
  user,
}: {
  isAuthenticated?: boolean
  user?: UserData
}) {
  const [currentView, setCurrentView] = useState<ViewType>("registrations")

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        isAuthenticated={isAuthenticated}
        user={user}
        currentView={currentView}
        onNavigate={setCurrentView}
      />
      <SidebarInset>
        <SiteHeader />
        <main>
          {currentView === "registrations" && <AdminTabs />}
          {currentView === "accreditation" && (
            <div className="w-full p-4 lg:p-8">
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">Acreditación del Evento</h2>
                <div className="text-sm text-gray-600 mb-4">
                  Controla el check-in y entrega de paquetes a los participantes.
                </div>
                <AccreditationTable />
              </div>
            </div>
          )}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
