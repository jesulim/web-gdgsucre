import type { Row } from "@tanstack/react-table"
import { MoreHorizontal, Trash2 } from "lucide-react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { Community } from "./CommunitiesTable"

const deleteCommunity = async (id: number, refetch: () => void) => {
  const confirmed = window.confirm(
    "¿Estás seguro de que deseas eliminar esta comunidad? Esta acción no se puede deshacer."
  )
  if (!confirmed) return

  try {
    toast.info("Eliminando comunidad")
    const response = await fetch(`/api/communities?id=${id}`, {
      method: "DELETE",
    })
    if (!response.ok) throw new Error("Error HTTP al eliminar la comunidad")

    const body = await response.json()
    body.success ? toast.success("Comunidad eliminada exitosamente") : toast.error(body.error)
    await refetch()
  } catch {
    toast.error("Error eliminando la comunidad")
  }
}

export default function CommunityRowActions({
  row,
  refetch,
}: {
  row: Row<Community>
  refetch: () => void
}) {
  const { id } = row.original

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
        <DropdownMenuItem variant="destructive" onClick={() => deleteCommunity(id, refetch)}>
          <Trash2 />
          Eliminar comunidad
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
