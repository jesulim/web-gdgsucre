import { useQuery } from "@tanstack/react-query"
import type { AdminTeamsData } from "@/lib/services/teamService"

export default function useTeamsWithMembers(slug: string) {
  const { data, isLoading, isFetching, refetch } = useQuery<AdminTeamsData>({
    queryKey: ["teams-with-members", slug],
    queryFn: async ({ signal }) => {
      const url = new URL("/api/teams/byEvent", window.location.origin)
      url.search = new URLSearchParams({ slug }).toString()

      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },
    enabled: !!slug,
  })

  return { data, isLoading, isFetching, refetch }
}
