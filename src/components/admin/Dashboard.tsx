import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { AccreditationTable } from "@/components/admin/AccreditationTable"
import { QRScanner } from "@/components/admin/QRScanner"
import { RegistrationsTable } from "@/components/admin/registrations/RegistrationsTable"
import { RegistrationsTeamsTable } from "@/components/admin/registrations/RegistrationsTeamsTable"
import { AdminSidebar } from "@/components/admin/sidebar/AdminSidebar"
import { SiteHeader } from "@/components/admin/sidebar/SiteHeader"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const VIEW_STORAGE_KEY = "admin_current_view"

export type ViewType = "registrations" | "registrationsTeams" | "accreditation" | "scanner"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
    },
  },
})

export interface Activity {
  name: string
  label: string
}

export interface UserData {
  name: string
  email: string
  avatar: string
  isAdmin: boolean
  staffRoles: Record<string, string>
}

export interface DashboardProps {
  userData: UserData
  events: {
    id: number
    name: string
    slug: string
    date: string
    registrationOpen: boolean
    activities: Activity[]
  }[]
}

function DashboardContainer({ userData, events }: DashboardProps) {
  const [eventSlug, setEventSlug] = useState(events[0]?.slug ?? "")
  const selectedEvent = events.find(e => e.slug === eventSlug)
  const currentRole = userData.staffRoles[eventSlug]

  const [currentView, setCurrentView] = useState<ViewType>(() => {
    if (typeof window === "undefined") return "registrations"
    return (localStorage.getItem(VIEW_STORAGE_KEY) || "registrations") as ViewType
  })

  useEffect(() => {
    localStorage.setItem(VIEW_STORAGE_KEY, currentView)
  }, [currentView])

  useEffect(() => {
    if (!userData.isAdmin && !userData.staffRoles[eventSlug]) {
      window.location.href = "/"
    }
  }, [userData, eventSlug])

  if (!selectedEvent) {
    return <main className="p-8">No event available</main>
  }

  const views: Record<ViewType, { title: string; component: React.ReactNode }> = {
    registrations: {
      title: "Registro de Participantes",
      component: <RegistrationsTable eventSlug={eventSlug} eventName={selectedEvent.name} />,
    },
    registrationsTeams: {
      title: "Registro de Equipos",
      component: <RegistrationsTeamsTable eventSlug={eventSlug} />,
    },
    accreditation: {
      title: "Acreditación del Evento",
      component: <AccreditationTable eventSlug={eventSlug} activities={selectedEvent.activities} />,
    },
    scanner: {
      title: "Escanear QR",
      component: <QRScanner eventSlug={eventSlug} activities={selectedEvent.activities} />,
    },
  }

  return (
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
        currentRole={currentRole}
        currentView={currentView}
        onNavigate={setCurrentView}
      />
      <SidebarInset>
        <SiteHeader
          sectionTitle={views[currentView].title}
          events={events}
          eventSlug={eventSlug}
          setEventSlug={setEventSlug}
        />
        <main className="p-4 lg:px-6">{views[currentView].component}</main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export function Dashboard({ userData, events }: DashboardProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContainer userData={userData} events={events} />
    </QueryClientProvider>
  )
}
