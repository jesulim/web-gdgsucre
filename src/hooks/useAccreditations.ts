import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export default function useAccreditations(params = {}) {
  const {
    data: accreditations,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["activities", params],
    queryFn: async ({ signal }) => {
      const url = new URL("/api/activities", window.location.origin)
      url.search = new URLSearchParams(params).toString()

      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },
    enabled: !!params?.slug,
  })

  return { accreditations, isLoading, refetch }
}

export function useUpdateAccreditation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, eventSlug, field, value, params }) => {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          eventSlug,
          field,
          value,
        }),
      })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },

    onMutate: async ({ id, eventSlug, field, value, params }) => {
      await queryClient.cancelQueries({ queryKey: ["activities", params] })

      queryClient.setQueryData(["activities", params], (old: any) => {
        return old.map((item: any) => (item.id === id ? { ...item, [field]: value } : item))
      })

      const previousData = queryClient.getQueryData(["activities", params])
      console.log("previousData", previousData)

      return { previousData }
    },

    onError: (error, newData, context) => {
      queryClient.setQueryData(["activities"], context?.previousData)
    },

    onSettled: data => {
      queryClient.invalidateQueries({ queryKey: ["activities"] })
    },
  })
}
