import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useEffect, useState } from "react"

import { AccreditationTable } from "@/components/admin/AccreditationTable"
import { ActivitiesManager } from "@/components/admin/activities/ActivitiesTable"
import { CalendarEventsTable } from "@/components/admin/calendar-events/CalendarEventsTable"
import { CommunitiesTable } from "@/components/admin/communities/CommunitiesTable"
import { EventsTable } from "@/components/admin/events/EventsTable"
import { FormFieldsManager } from "@/components/admin/formFields/FormFieldsTable"
import { OrganizersTable } from "@/components/admin/organizers/OrganizersTable"
import { QRScanner } from "@/components/admin/QRScanner"
import { RegistrationsTable } from "@/components/admin/registrations/RegistrationsTable"
import { AdminSidebar } from "@/components/admin/sidebar/AdminSidebar"
import { SiteHeader } from "@/components/admin/sidebar/SiteHeader"
import { TeamsManager } from "@/components/admin/teams/TeamsManager"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"

const VIEW_STORAGE_KEY = "admin_current_view"

export type ViewType =
  | "registrations"
  | "registrationsTeams"
  | "accreditation"
  | "scanner"
  | "organizers"
  | "communities"
  | "calendarEvents"
  | "events"
  | "activities"
  | "formFields"

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
  const [eventSlug, setEventSlug] = useState(() => {
    if (userData.isAdmin) return events[0]?.slug ?? ""
    const userEvents = Object.keys(userData.staffRoles)
    const match = events.find(e => userEvents.includes(e.slug))
    return match?.slug ?? userEvents[0] ?? events[0]?.slug ?? ""
  })

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
      component: <TeamsManager eventId={selectedEvent.id} eventSlug={eventSlug} />,
    },
    accreditation: {
      title: "Acreditación del Evento",
      component: <AccreditationTable eventSlug={eventSlug} activities={selectedEvent.activities} />,
    },
    scanner: {
      title: "Escanear QR",
      component: <QRScanner eventSlug={eventSlug} activities={selectedEvent.activities} />,
    },
    organizers: {
      title: "Organizadores",
      component: <OrganizersTable eventSlug={eventSlug} />,
    },
    formFields: {
      title: "Formulario de Registro",
      component: <FormFieldsManager eventId={selectedEvent.id} />,
    },
    activities: {
      title: "Actividades",
      component: <ActivitiesManager eventId={selectedEvent.id} />,
    },
    events: {
      title: "Eventos",
      component: <EventsTable />,
    },
    calendarEvents: {
      title: "Eventos del Calendario",
      component: <CalendarEventsTable />,
    },
    communities: {
      title: "Comunidades",
      component: <CommunitiesTable />,
    },
  }

  const isPlatformView = ["events", "calendarEvents", "communities"].includes(currentView)

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
        variant="floating"
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
          showEventSelector={!isPlatformView}
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
