import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { Row } from "@tanstack/react-table"
import { Check, MoreHorizontal, Trash2, X } from "lucide-react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { CalendarEvent } from "./CalendarEventsTable"

const deleteCalendarEvent = async (id: number, refetch: () => void) => {
  const confirmed = window.confirm(
    "¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer."
  )
  if (!confirmed) return

  try {
    toast.info("Eliminando evento")
    const response = await fetch(`/api/calendar-events?id=${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Error HTTP al eliminar el evento")

    const body = await response.json()
    body.success ? toast.success("Evento eliminado exitosamente") : toast.error(body.error)
    await refetch()
  } catch {
    toast.error("Error eliminando el evento")
  }
}

export default function CalendarEventRowActions({
  row,
  refetch,
}: {
  row: Row<CalendarEvent>
  refetch: () => void
}) {
  const { id, accepted } = row.original
  const queryClient = useQueryClient()

  const setAcceptedMutation = useMutation({
    mutationFn: async ({ id, accepted }: { id: number; accepted: boolean }) => {
      const response = await fetch("/api/calendar-events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, accepted }),
      })

      if (!response.ok) throw new Error("Error HTTP al actualizar el evento")
    },
    onMutate: async ({ id, accepted }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "calendar-events"] })

      const previousEvents = queryClient.getQueryData<CalendarEvent[]>(["admin", "calendar-events"])

      queryClient.setQueryData<CalendarEvent[]>(["admin", "calendar-events"], old =>
        old?.map(event => (event.id === id ? { ...event, accepted } : event))
      )

      return { previousEvents }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousEvents) {
        queryClient.setQueryData(["admin", "calendar-events"], context.previousEvents)
      }
      toast.error("Error al actualizar el evento")
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.accepted ? "Evento aceptado" : "Evento rechazado")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "calendar-events"] })
    },
  })

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Abrir menú</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
        {!accepted && (
          <DropdownMenuItem onClick={() => setAcceptedMutation.mutate({ id, accepted: true })}>
            <Check />
            Aceptar evento
          </DropdownMenuItem>
        )}
        {accepted && (
          <DropdownMenuItem onClick={() => setAcceptedMutation.mutate({ id, accepted: false })}>
            <X />
            Rechazar evento
          </DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onClick={() => deleteCalendarEvent(id, refetch)}>
          <Trash2 />
          Eliminar evento
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
