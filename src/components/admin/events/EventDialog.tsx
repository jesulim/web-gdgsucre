import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

const formSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "El nombre del evento es requerido."),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "El slug solo puede contener minúsculas, números y guiones."),
  date: z.coerce.date(),
  registration_open: z.boolean().default(false),
})

import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"

interface Event {
  id?: number
  name: string
  slug: string
  date: Date
  registration_open: boolean
}

interface DialogProps {
  open: boolean
  event?: Event
  onCancel: () => void
}

export function EventDialog({ open, event, onCancel }: DialogProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: event?.id,
      name: event?.name,
      slug: event?.slug,
      date: event?.date,
      registration_open: event?.registration_open,
    },
  })

  async function onSubmit(data: z.infer<typeof formSchema>) {
    console.log(data)
    const response = await fetch("/api/events", {
      method: data.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })

    if (response.ok) {
      onCancel()
    } else {
      console.error("Error al actualizar evento")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl">{event ? "Editar" : "Nuevo"} evento</DialogTitle>
        </DialogHeader>

        <form id="form-event" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="name">Nombre del evento</FieldLabel>
                  <Input {...field} id="name" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />

            <Controller
              name="slug"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="slug">Slug</FieldLabel>
                  <Input {...field} id="slug" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="date">Fecha</FieldLabel>
                  <Input {...field} id="date" type="date" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
            <Controller
              name="registration_open"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="registration_open">Registro abierto</FieldLabel>
                  <Checkbox
                    id="registration_open"
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter className="gap-4">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" form="form-event" className="bg-green-500">
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
