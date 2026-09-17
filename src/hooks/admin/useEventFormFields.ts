import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import { toast } from "sonner"

export interface EventFormField {
  id: number
  event_id: number
  order: number
  name: string
  label: string
  type: "text" | "select" | "file"
  required: boolean
  options: string[] | null
  image_url: string | null
}

export interface EventFormFieldInput {
  order?: number | null
  name: string
  label: string
  type: "text" | "select" | "file"
  required: boolean
  options?: string[] | null
  image_url?: string | null
}

export function useEventFormFields(eventId: number) {
  const queryClient = useQueryClient()
  const queryKey = ["event-form-fields", eventId]

  const { data: formFields = [], isLoading } = useQuery<EventFormField[]>({
    queryKey,
    queryFn: async ({ signal }) => {
      const response = await fetch(`/api/event-form-fields?event_id=${eventId}`, { signal })
      if (!response.ok) throw new Error("Network response was not ok")
      return response.json()
    },
    enabled: eventId > 0,
  })

  const createMutation = useMutation({
    mutationFn: async (field: EventFormFieldInput) => {
      const response = await fetch("/api/event-form-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: eventId, ...field }),
      })
      if (!response.ok) throw new Error("Error al crear el campo")
      return response.json()
    },
    onSuccess: () => {
      toast.success("Campo creado")
      queryClient.invalidateQueries({ queryKey })
    },
    onError: () => toast.error("Error al crear el campo"),
  })

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...field }: EventFormFieldInput & { id: number }) => {
      const response = await fetch("/api/event-form-fields", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...field }),
      })
      if (!response.ok) throw new Error("Error al actualizar el campo")
      return response.json()
    },
    onSuccess: () => {
      toast.success("Campo actualizado")
      queryClient.invalidateQueries({ queryKey })
    },
    onError: () => toast.error("Error al actualizar el campo"),
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/event-form-fields?id=${id}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Error al eliminar el campo")
    },
    onSuccess: () => {
      toast.success("Campo eliminado")
      queryClient.invalidateQueries({ queryKey })
    },
    onError: () => toast.error("Error al eliminar el campo"),
  })

  return {
    formFields,
    isLoading,
    createField: createMutation.mutateAsync,
    updateField: updateMutation.mutateAsync,
    deleteField: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  }
}
