import { useQuery } from "@tanstack/react-query"

export interface AdminCommunity {
  id: number
  created_at: string
  name: string
  short_name: string | null
  website: string | null
  contact_email: string
  accepted: boolean
}

export function useAdminCommunities() {
  const {
    data: communities,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["admin", "communities"],
    queryFn: async ({ signal }): Promise<AdminCommunity[]> => {
      const url = new URL("/api/communities", window.location.origin)
      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },
  })

  return { communities, isLoading, isFetching, refetch }
}
