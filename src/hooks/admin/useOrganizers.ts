import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"

interface OrganizerInput {
  first_name: string
  last_name: string
  email: string
  phone_number: string
  profile_id?: string
  avatar_url?: string | null
}

export interface OrganizerSearchResult {
  success?: boolean
  error?: string
  data?: Array<{
    id: string
    email: string
    first_name: string
    last_name: string
    phone_number: string
    avatar_url: string | null
  }> | null
}

async function parseError(response: Response, fallback: string) {
  const data = await response.json().catch(() => null)
  throw new Error(data?.error || data?.message || fallback)
}

export default function useOrganizers(slug: string) {
  const queryClient = useQueryClient()
  const queryKey = ["organizers", slug]

  const {
    data: organizers,
    isLoading,
    isFetching,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: async ({ signal }) => {
      const url = new URL("/api/organizers", window.location.origin)
      url.search = new URLSearchParams({ slug }).toString()

      const response = await fetch(url, { signal })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },
    enabled: !!slug,
  })

  const addMutation = useMutation({
    mutationFn: async (values: OrganizerInput) => {
      const response = await fetch("/api/organizers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, eventSlug: slug }),
      })
      if (!response.ok) await parseError(response, "Error al agregar organizador")
    },
    onSuccess: () => {
      toast.success("Organizador agregado exitosamente")
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...values }: OrganizerInput & { id: number }) => {
      const response = await fetch("/api/organizers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...values }),
      })
      if (!response.ok) await parseError(response, "Error al actualizar")
    },
    onSuccess: () => {
      toast.success("Organizador actualizado exitosamente")
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch("/api/organizers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      })
      if (!response.ok) await parseError(response, "Error al eliminar")
    },
    onSuccess: () => {
      toast.success("Organizador eliminado exitosamente")
      queryClient.invalidateQueries({ queryKey })
    },
  })

  const searchMutation = useMutation({
    mutationFn: async (query: string): Promise<OrganizerSearchResult> => {
      const response = await fetch("/api/organizers/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      })
      return response.json()
    },
  })

  const staffMutation = useMutation({
    mutationFn: async ({ id, is_staff }: { id: number; is_staff: boolean }) => {
      const response = await fetch("/api/organizers/toggle-staff", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, is_staff }),
      })
      if (!response.ok) await parseError(response, "Error al actualizar el staff")
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  const avatarMutation = useMutation({
    mutationFn: async ({ blob, profileId }: { blob: Blob; profileId: string }) => {
      const formData = new FormData()
      formData.append("avatar", blob, "avatar.webp")
      formData.append("profile_id", profileId)

      const response = await fetch("/api/organizers/avatar", {
        method: "POST",
        body: formData,
      })
      if (!response.ok) await parseError(response, "Error al subir la foto de perfil")

      const json = await response.json()
      return json.avatar_url as string
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  })

  return {
    organizers,
    isLoading,
    isFetching,
    refetch,
    addOrganizer: addMutation.mutateAsync,
    updateOrganizer: updateMutation.mutateAsync,
    deleteOrganizer: deleteMutation.mutateAsync,
    isSaving: addMutation.isPending || updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
    searchOrganizer: searchMutation.mutateAsync,
    isSearching: searchMutation.isPending,
    toggleStaff: staffMutation.mutateAsync,
    isTogglingStaff: staffMutation.isPending,
    uploadAvatar: avatarMutation.mutateAsync,
  }
}
