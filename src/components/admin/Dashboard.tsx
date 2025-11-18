import { useEffect, useState } from "react"

import { AccreditationTable } from "@/components/admin/AccreditationTable"
import { AppSidebar } from "@/components/admin/AdminSidebar"
import QRScanner from "@/components/admin/QRScanner"
import { AdminTabs } from "@/components/admin/Registrations"
import { SiteHeader } from "@/components/admin/SiteHeader"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

interface UserData {
  name: string
  email: string
  avatar: string
}

type ViewType = "registrations" | "accreditation" | "scanner"

const VIEW_STORAGE_KEY = "admin_current_view"

export function Dashboard({
  isAuthenticated = false,
  user,
}: {
  isAuthenticated?: boolean
  user?: UserData
}) {
  // Inicializar con la vista guardada o "registrations" por defecto
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    if (typeof window !== "undefined") {
      const savedView = localStorage.getItem(VIEW_STORAGE_KEY)
      return (savedView as ViewType) || "registrations"
    }
    return "registrations"
  })

  // Guardar la vista actual en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, currentView)
  }, [currentView])

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
          {currentView === "scanner" && <QRScanner />}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
