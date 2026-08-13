import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

export default function useAccreditations(params = {}) {
  return useQuery({
    queryKey: ["accreditation", params],
    queryFn: async ({ signal }) => {
      const url = new URL("/api/accreditation", window.location.origin)
      url.search = new URLSearchParams(params).toString()

      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },
    enabled: !!params?.slug,
  })
}

export function useUpdateAccreditation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ registrationId, activityId, activityName, value, params }) => {
      const response = await fetch("/api/accreditation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          registrationId,
          activityId,
          activityName,
          value,
        }),
      })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },

    onMutate: async ({ registrationId, activityId, activityName, value, params }) => {
      await queryClient.cancelQueries({ queryKey: ["accreditation", params] })
      const previousData = queryClient.getQueryData(["accreditation", params])

      queryClient.setQueryData(["accreditation", params], (old: any) => {
        return old.map((item: any) =>
          item.id === registrationId ? { ...item, [activityName]: value } : item
        )
      })

      return { previousData }
    },

    onError: (error, { params }, context) => {
      queryClient.setQueryData(["accreditation", params], context?.previousData)
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["accreditation"], refetchType: "none" })
    },
  })
}
