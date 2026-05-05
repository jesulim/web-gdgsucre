import { useQuery } from "@tanstack/react-query"

export default function useTeamMembers(teamId: number, registrationId: number) {
  return useQuery({
    queryKey: ["teamMembers", teamId, registrationId],
    queryFn: async ({ signal }) => {
      const url = new URL("/api/teams/members", window.location.origin)
      url.search = new URLSearchParams({
        teamId: teamId.toString(),
        registrationId: registrationId.toString(),
      }).toString()

      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },
    enabled: !!teamId && !!registrationId,
  })
}
