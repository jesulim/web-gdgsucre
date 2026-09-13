import { useQuery } from "@tanstack/react-query"

export default function useOrganizers(slug: string) {
  const {
    data: organizers,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey: ["organizers", slug],
    queryFn: async ({ signal }) => {
      const url = new URL("/api/organizers", window.location.origin)
      url.search = new URLSearchParams({ slug }).toString()

      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },
    enabled: !!slug,
  })

  return { organizers, isLoading, isFetching, refetch }
}
