import { zodResolver } from "@hookform/resolvers/zod"
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import type { EventFormField, EventFormFieldInput } from "@/hooks/admin/useEventFormFields"

const FIELD_TYPE_LABELS: Record<EventFormField["type"], string> = {
  text: "Texto",
  select: "Select",
  file: "Archivo",
}

const formSchema = z.object({
  label: z.string().min(1, "La etiqueta es requerida."),
  name: z.string().min(1, "El nombre es requerido."),
  type: z.enum(["text", "select", "file"]),
  required: z.boolean(),
  order: z.string(),
  options: z.string(),
  image_url: z.string(),
})

type FieldFormValues = z.infer<typeof formSchema>

interface FormFieldDialogProps {
  open: boolean
  field: EventFormField | null
  onCancel: () => void
  createField: (field: EventFormFieldInput) => Promise<EventFormField>
  updateField: (field: EventFormFieldInput & { id: number }) => Promise<EventFormField>
  isMutating: boolean
}

export function FormFieldDialog({
  open,
  field,
  onCancel,
  createField,
  updateField,
  isMutating,
}: FormFieldDialogProps) {
  const form = useForm<FieldFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      label: "",
      name: "",
      type: "text",
      required: true,
      order: "",
      options: "",
      image_url: "",
    },
  })

  const selectedType = form.watch("type")

  useEffect(() => {
    if (!open) return

    form.reset({
      label: field?.label ?? "",
      name: field?.name ?? "",
      type: field?.type ?? "text",
      required: field?.required ?? true,
      order: field ? String(field.order) : "",
      options: field?.options?.join(", ") ?? "",
      image_url: field?.image_url ?? "",
    })
  }, [open, field, form])

  function buildPayload(values: FieldFormValues): EventFormFieldInput {
    let parsedOrder: number | null = null
    if (values.order.trim() !== "") {
      parsedOrder = Number(values.order)
    }

    return {
      order: parsedOrder,
      name: values.name.trim(),
      label: values.label.trim(),
      type: values.type,
      required: values.required,
      options:
        values.type === "select"
          ? values.options
              .split(",")
              .map(option => option.trim())
              .filter(Boolean)
          : null,
      image_url: values.image_url.trim() || null,
    }
  }

  async function onSubmit(values: FieldFormValues) {
    if (values.order.trim() !== "" && !Number.isInteger(Number(values.order))) {
      toast.error("El orden debe ser un número entero")
      return
    }

    const payload = buildPayload(values)

    if (field) {
      await updateField({ id: field.id, ...payload })
    } else {
      await createField(payload)
    }
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {field ? "Editar" : "Nuevo"} campo del formulario
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form id="form-field" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Orden</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      placeholder="1"
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
              name="label"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Etiqueta</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="¿Eres alérgico a algo?" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="dietary_restriction" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo</FormLabel>
                  <FormControl>
                    <Select value={field.value ?? ""} onValueChange={field.onChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(FIELD_TYPE_LABELS).map(([value, label]) => (
                          <SelectItem key={value} value={value}>
                            {label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {selectedType === "select" && (
              <FormField
                control={form.control}
                name="options"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Opciones (separadas por coma)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Opción 1, Opción 2"
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL de imagen (opcional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://..."
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
              name="required"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center gap-2 space-y-0">
                  <FormLabel className="font-normal">Obligatorio</FormLabel>
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
            form="form-field"
            className="bg-green-500"
            disabled={form.formState.isSubmitting || isMutating}
          >
            {form.formState.isSubmitting ? <Loader2Icon className="animate-spin" /> : <Save />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
