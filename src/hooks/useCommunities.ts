import { keepPreviousData, useQuery } from "@tanstack/react-query"

import { useDebouncedValue } from "@/hooks/useDebouncedValue"

export interface Community {
  id: number
  name: string
  short_name: string | null
  website: string | null
  contact_email: string
  image: string | null
  accepted: boolean
}

const DEBOUNCE_MS = 350

export function useCommunities(search: string) {
  const debouncedSearch = useDebouncedValue(search.trim(), DEBOUNCE_MS)

  const query = useQuery({
    queryKey: ["communities", debouncedSearch],
    queryFn: async ({ signal }): Promise<Community[]> => {
      const url = new URL("/api/communities", window.location.origin)
      if (debouncedSearch) url.searchParams.set("name", debouncedSearch)

      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error("No se pudieron cargar las comunidades")
      return response.json()
    },
    placeholderData: keepPreviousData,
  })

  return {
    refetch: query.refetch,
    communities: query.data ?? [],
    isLoading: query.isLoading,
    isFetching: query.isFetching,
  }
}
