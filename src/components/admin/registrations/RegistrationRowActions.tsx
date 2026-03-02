import type { Row } from "@tanstack/react-table"
import { MoreHorizontal, SendHorizontal, Trash2 } from "lucide-react"

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

const sendConfirmationEmail = async (
  id: number,
  eventName: string,
  email: string,
  name: string
) => {
  try {
    toast.info(`Enviando email de confirmación a ${email}...`)

    const response = await fetch("/api/sendPaymentConfirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registrationId: id,
        eventName: eventName,
        userEmail: email,
        userName: name,
      }),
    })

    if (!response.ok) throw new Error("Error HTTP al enviar la confirmación")

    const body = await response.json()
    body.success ? toast.success("Email enviado exitosamente") : toast.error(body.details)
  } catch {
    toast.error("Error enviando email de confirmación")
  }
}

const deleteRegistration = async (id: number) => {
  const confirmed = window.confirm(
    "¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
  )
  if (!confirmed) return

  try {
    toast.info("Eliminando registro")
    const response = await fetch("/api/registrations", {
      method: "DELETE",
      body: JSON.stringify({ registrationId: id }),
    })
    if (!response.ok) throw new Error("Error HTTP al eliminar el registro")

    const body = await response.json()
    body.success ? toast.success("Registro eliminado exitosamente") : toast.error(body.details)
  } catch {
    toast.error("Error eliminando el registro")
  }
}

export default function RegistrationRowActions({
  row,
  eventName,
}: {
  row: Row<Registrations>
  eventName: string
}) {
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
            sendConfirmationEmail(
              row.original.id,
              eventName,
              row.original.email,
              row.original.first_name
            )
          }
        >
          <SendHorizontal />
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
