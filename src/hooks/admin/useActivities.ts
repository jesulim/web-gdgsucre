import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toast } from "sonner"

export interface EventActivity {
  id: number
  event_id: number
  name: string
  label: string
}

export interface EventActivityInput {
  name: string
  label: string
}

export function useActivities(eventId: number) {
  const queryClient = useQueryClient()
  const queryKey = ["event-activities", eventId]

  const { data: activities = [], isLoading } = useQuery<EventActivity[]>({
    queryKey,
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/event-activities?event_id=${eventId}`, { signal })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },
    enabled: eventId > 0,
  })

  const createMutation = useMutation({
    mutationFn: async (activity: EventActivityInput) => {
      const response = await fetch("/api/event-activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, ...activity }),
      })
      if (!response.ok) throw new Error("Error al crear la actividad")
      return response.json()
    },
    onSuccess: () => {
      toast.success("Actividad creada")
      queryClient.invalidateQueries({ queryKey })
    },
    onError: () => toast.error("Error al crear la actividad"),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...activity }: EventActivityInput & { id: number }) => {
      const response = await fetch("/api/event-activities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...activity }),
      })
      if (!response.ok) throw new Error("Error al actualizar la actividad")
      return response.json()
    },
    onSuccess: () => {
      toast.success("Actividad actualizada")
      queryClient.invalidateQueries({ queryKey })
    },
    onError: () => toast.error("Error al actualizar la actividad"),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/event-activities?id=${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Error al eliminar la actividad")
    },
    onSuccess: () => {
      toast.success("Actividad eliminada")
      queryClient.invalidateQueries({ queryKey })
    },
    onError: () => toast.error("Error al eliminar la actividad"),
  })

  return {
    activities,
    isLoading,
    createActivity: createMutation.mutateAsync,
    updateActivity: updateMutation.mutateAsync,
    deleteActivity: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  }
}
