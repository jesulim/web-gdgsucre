import { useQuery } from "@tanstack/react-query"

export default function useFetchEvents(params = {}) {
  const fetchEvents = async (signal: AbortSignal) => {
    const url = new URL("/api/events", window.location.origin)
    url.search = new URLSearchParams(params).toString()

    const response = await fetch(url, { signal })
    if (!response.ok) throw new Error("Network response was not ok")
    return response.json()
  }

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["events", params],
    queryFn: async ({ signal }) => fetchEvents(signal),
  })

  return { events, isLoading }
}
