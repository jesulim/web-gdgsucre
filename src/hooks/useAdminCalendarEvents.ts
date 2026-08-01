import { useQuery } from "@tanstack/react-query"

export interface AdminCalendarEvent {
  id: number
  created_at: string
  name: string
  community_id: number
  communities: {
    id: number
    name: string
    short_name: string | null
  } | null
  start_datetime: string
  end_datetime: string
  format: string | null
  registration_link: string | null
  location: string | null
  accepted: boolean
}

export function useAdminCalendarEvents() {
  const {
    data: calendarEvents,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin", "calendar-events"],
    queryFn: async ({ signal }): Promise<AdminCalendarEvent[]> => {
      const url = new URL("/api/calendar-events", window.location.origin)
      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },
  })

  return { calendarEvents, isLoading, isFetching, refetch }
}
