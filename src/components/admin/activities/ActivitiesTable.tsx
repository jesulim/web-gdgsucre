import { Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { type EventActivity, useActivities } from "@/hooks/admin/useActivities"

import { ActivityDialog } from "./ActivityDialog"

interface ActivitiesManagerProps {
  eventId: number
}

export function ActivitiesManager({ eventId }: ActivitiesManagerProps) {
  const { activities, isLoading, createActivity, updateActivity, deleteActivity, isMutating } =
    useActivities(eventId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<EventActivity | null>(null)

  function openCreate() {
    setSelectedActivity(null)
    setDialogOpen(true)
  }

  function openEdit(activity: EventActivity) {
    setSelectedActivity(activity)
    setDialogOpen(true)
  }

  async function handleDelete(activity: EventActivity) {
    if (!window.confirm(`¿Eliminar la actividad "${activity.label}"?`)) return
    await deleteActivity(activity.id)
  }

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />

      <Button className="bg-blue-500 rounded-sm" onClick={openCreate}>
        <Plus />
        Nueva actividad
      </Button>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Etiqueta</TableHead>
              <TableHead className="w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length ? (
              activities.map(activity => (
                <TableRow key={activity.id}>
                  <TableCell className="text-xs font-monospace">{activity.name}</TableCell>
                  <TableCell>{activity.label}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${activity.label}`}
                        onClick={() => openEdit(activity)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Eliminar ${activity.label}`}
                        onClick={() => handleDelete(activity)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  {isLoading ? "Cargando actividades..." : "Sin actividades."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ActivityDialog
        open={dialogOpen}
        activity={selectedActivity}
        onCancel={() => {
          setSelectedActivity(null)
          setDialogOpen(false)
        }}
        createActivity={createActivity}
        updateActivity={updateActivity}
        isMutating={isMutating}
      />
    </div>
  )
}
