import { useQuery } from "@tanstack/react-query"

export default function useRegistrations(slug: string) {
  const {
    data: registrations,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["registrations", slug],
    queryFn: async ({ signal }) => {
      const url = new URL("/api/registrations", window.location.origin)
      url.search = new URLSearchParams({ slug }).toString()

      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },
    enabled: !!slug,
  })

  return { registrations, isLoading, refetch }
}
