import { useMutation, useQueryClient } from "@tanstack/react-query"

export default function useDeleteTeamMembers() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ registrationId }: { registrationId: number }) => {
      const url = new URL("/api/teams/deleteMember", window.location.origin)
      url.search = new URLSearchParams({
        registrationId: registrationId.toString(),
      }).toString()

      const response = await fetch(url, { method: "DELETE" })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teamMembers"] })
    },
  })
}
