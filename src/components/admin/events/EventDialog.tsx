import { zodResolver } from "@hookform/resolvers/zod"
import { useQueryClient } from "@tanstack/react-query"
import { Loader2Icon, Save } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import type { EventFormField } from "@/hooks/admin/useEventFormFields"

import type { AdminEvent } from "./EventsTable"

const formSchema = z.object({
  name: z.string().min(1, "El nombre del evento es requerido."),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/, "El slug solo puede contener minúsculas, números y guiones."),
  date: z.string().min(1, "La fecha es requerida."),
  registration_open: z.boolean(),
  packages: z.string(),
})

type EventFormValues = z.infer<typeof formSchema>

interface DialogProps {
  open: boolean
  event: AdminEvent | null
  onCancel: () => void
}

function toDateInputValue(value: Date | string | null | undefined) {
  if (!value) return ""

  if (typeof value === "string") {
    const match = /^\d{4}-\d{2}-\d{2}/.exec(value)
    if (match) return match[0]

    const date = new Date(value)
    if (!Number.isNaN(date.getTime())) return date.toISOString().slice(0, 10)
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

function parsePackages(value: string | undefined) {
  if (!value?.trim()) return []
  return value
    .split(",")
    .map(packageName => packageName.trim())
    .filter(Boolean)
}

async function syncPackageField(eventId: number, packageOptions: string[]) {
  const fieldsResponse = await fetch(`/api/event-form-fields?event_id=${eventId}`)
  if (!fieldsResponse.ok) throw new Error("Error al obtener los campos del formulario")
  const fields = await fieldsResponse.json()
  const existing = fields.find((field: EventFormField) => field.name === "package")

  const payload = {
    event_id: eventId,
    name: "package",
    label: "Paquete",
    type: "select" as const,
    required: true,
    options: packageOptions,
  }

  const response = existing
    ? await fetch("/api/event-form-fields", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: existing.id, ...payload }),
      })
    : await fetch("/api/event-form-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

  if (!response.ok) throw new Error("Error al guardar los paquetes")
}

export function EventDialog({ open, event, onCancel }: DialogProps) {
  const queryClient = useQueryClient()
  const isEdit = Boolean(event)

  const form = useForm<EventFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      date: "",
      registration_open: false,
      packages: "",
    },
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      name: event?.name ?? "",
      slug: event?.slug ?? "",
      date: event?.date ?? "",
      registration_open: event?.registration_open ?? false,
      packages: event?.packages?.join(", ") ?? "",
    })
  }, [open, event, form])

  async function onSubmit(values: EventFormValues) {
    const eventId = event?.id
    const payload = {
      name: values.name,
      slug: values.slug,
      date: values.date,
      registration_open: values.registration_open,
    }

    try {
      const response = await fetch("/api/events", {
        method: eventId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(eventId ? { id: eventId, ...payload } : payload),
      })

      if (!response.ok) throw new Error("Error al guardar el evento")

      const saved = await response.json()
      const savedId = eventId ?? (Array.isArray(saved) ? saved[0]?.id : saved?.id)

      const originalPackages = event?.packages ?? []
      const newPackages = parsePackages(values.packages)
      const packagesChanged = JSON.stringify(originalPackages) !== JSON.stringify(newPackages)

      if (savedId && packagesChanged && newPackages.length > 0) {
        await syncPackageField(savedId, newPackages)
      }

      toast.success(eventId ? "Evento actualizado" : "Evento creado")
      queryClient.invalidateQueries({ queryKey: ["events"] })
      onCancel()
    } catch {
      toast.error("Error al guardar el evento")
    }
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{isEdit ? "Editar" : "Nuevo"} evento</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form id="form-event" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del evento</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={toDateInputValue(field.value)}
                      onChange={e => field.onChange(e.target.value)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="packages"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Paquetes disponibles (separados por coma)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="WebVerse (35Bs), IO Extended (50Bs)"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="registration_open"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormLabel className="font-normal">Registro abierto</FormLabel>
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={checked => field.onChange(Boolean(checked))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <DialogFooter className="gap-4">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="form-event"
            className="bg-green-500"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? <Loader2Icon className="animate-spin" /> : <Save />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
