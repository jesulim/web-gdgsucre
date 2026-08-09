import { Pencil, Plus, Trash2 } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Toaster } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { type EventFormField, useEventFormFields } from "@/hooks/admin/useEventFormFields"

import { FormFieldDialog } from "./FormFieldDialog"

const FIELD_TYPE_LABELS: Record<EventFormField["type"], string> = {
  text: "Texto",
  select: "Select",
  file: "Archivo",
}

interface FormFieldsManagerProps {
  eventId: number
}

export function FormFieldsManager({ eventId }: FormFieldsManagerProps) {
  const { formFields, isLoading, createField, updateField, deleteField, isMutating } =
    useEventFormFields(eventId)

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedField, setSelectedField] = useState<EventFormField | null>(null)

  function openCreate() {
    setSelectedField(null)
    setDialogOpen(true)
  }

  function openEdit(field: EventFormField) {
    setSelectedField(field)
    setDialogOpen(true)
  }

  async function handleDelete(field: EventFormField) {
    if (!window.confirm(`¿Eliminar el campo "${field.label}"?`)) return
    await deleteField(field.id)
  }

  async function handleToggleRequired(field: EventFormField) {
    await updateField({
      id: field.id,
      name: field.name,
      label: field.label,
      type: field.type,
      required: !field.required,
      order: field.order,
      options: field.options,
      image_url: field.image_url,
    })
  }

  return (
    <div className="space-y-4">
      <Toaster position="top-right" />

      <Button className="bg-blue-500 rounded-sm" onClick={openCreate}>
        <Plus />
        Nuevo campo
      </Button>

      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Orden</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Etiqueta</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Obligatorio</TableHead>
              <TableHead>Opciones</TableHead>
              <TableHead className="w-24">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {formFields.length ? (
              formFields.map(field => (
                <TableRow key={field.id}>
                  <TableCell>{field.order}</TableCell>
                  <TableCell className="text-xs font-monospace">{field.name}</TableCell>
                  <TableCell className="max-w-64 truncate">{field.label}</TableCell>
                  <TableCell>{FIELD_TYPE_LABELS[field.type] ?? field.type}</TableCell>
                  <TableCell className="flex">
                    <Checkbox
                      className="mx-auto"
                      aria-label={`Alternar obligatorio de ${field.label}`}
                      checked={field.required}
                      onCheckedChange={() => handleToggleRequired(field)}
                    />
                  </TableCell>
                  <TableCell className="max-w-40 truncate">
                    {field.options?.join(", ") ?? "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Editar ${field.label}`}
                        onClick={() => openEdit(field)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Eliminar ${field.label}`}
                        onClick={() => handleDelete(field)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  {isLoading ? "Cargando campos..." : "Sin campos."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <FormFieldDialog
        open={dialogOpen}
        field={selectedField}
        onCancel={() => {
          setSelectedField(null)
          setDialogOpen(false)
        }}
        createField={createField}
        updateField={updateField}
        isMutating={isMutating}
      />
    </div>
  )
}
