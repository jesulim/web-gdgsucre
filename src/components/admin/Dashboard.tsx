import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { AccreditationTable } from "@/components/admin/AccreditationTable"
import { Events } from "@/components/admin/events/Events"
import { QRScanner } from "@/components/admin/QRScanner"
import { RegistrationsTable } from "@/components/admin/RegistrationsTable"
import { AdminSidebar } from "@/components/admin/sidebar/AdminSidebar"
import { SiteHeader } from "@/components/admin/sidebar/SiteHeader"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const VIEW_STORAGE_KEY = "admin_current_view"

export type ViewType = "events" | "registrations" | "accreditation" | "scanner"

const VIEWS: Record<ViewType, { title: string; component: React.ReactNode }> = {
  events: {
    title: "Eventos",
    component: <Events />,
  },
  registrations: {
    title: "Registro de Participantes",
    component: <RegistrationsTable />,
  },
  accreditation: {
    title: "Acreditación del Evento",
    component: <AccreditationTable />,
  },
  scanner: {
    title: "Escanear QR",
    component: <QRScanner />,
  },
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
})

export interface UserData {
  name: string
  email: string
  avatar: string
}

export function Dashboard({ userData }: { userData: UserData }) {
  // Inicializar con la vista guardada o "events" por defecto
  const [currentView, setCurrentView] = useState<ViewType>(() => {
    if (typeof window === "undefined") {
      return "events"
    }
    return (localStorage.getItem(VIEW_STORAGE_KEY) || "events") as ViewType
  })

  // Guardar la vista actual en localStorage cuando cambie
  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, currentView)
  }, [currentView])

  return (
    <QueryClientProvider client={queryClient}>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AdminSidebar
          variant="inset"
          collapsible="icon"
          userData={userData}
          currentView={currentView}
          onNavigate={setCurrentView}
        />
        <SidebarInset>
          <SiteHeader sectionTitle={VIEWS[currentView].title} />
          <main className="p-4 lg:px-6">{VIEWS[currentView].component}</main>
        </SidebarInset>
      </SidebarProvider>
    </QueryClientProvider>
  )
}
