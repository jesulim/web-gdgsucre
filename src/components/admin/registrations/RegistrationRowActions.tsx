import type { Row } from "@tanstack/react-table"
import { MoreHorizontal, SendHorizonal, Trash2 } from "lucide-react"
import { useCallback } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { Registrations } from "./RegistrationsTable"

export default function RegistrationRowActions({ row }: { row: Row<Registrations> }) {
  const sendConfirmationEmail = useCallback(async (id: number, email: string, name: string) => {
    toast.info(`Enviando email de confirmación a ${email}...`)

    const response = await fetch("/api/sendPaymentConfirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registrationId: id,
        userEmail: email,
        userName: name,
        eventName: "International Women's Day 2026",
      }),
    })

    const body = await response.json()
    if (body.success) {
      toast.success("Email enviado exitosamente")
    } else {
      toast.error(body.details)
    }
  }, [])
  const deleteRegistration = useCallback(async (id: number) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
    )
    if (!confirmed) return

    toast.info("Eliminando registro")
    const response = await fetch("/api/registrations", {
      method: "DELETE",
      body: JSON.stringify({ registrationId: id }),
    })
    const body = await response.json()
    if (body.success) {
      toast.success("Registro eliminado exitosamente")
    } else {
      toast.error(body.message)
    }
  }, [])

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
        <DropdownMenuItem
          onClick={() =>
            sendConfirmationEmail(row.original.id, row.original.email, row.original.first_name)
          }
        >
          <SendHorizonal />
          {row.original.status === "pending" ? "Enviar confirmación" : "Reenviar confirmación"}
        </DropdownMenuItem>

        <DropdownMenuItem variant="destructive" onClick={() => deleteRegistration(row.original.id)}>
          <Trash2 />
          Eliminar registro
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
