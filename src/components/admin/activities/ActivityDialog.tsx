import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
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

import type { EventActivity, EventActivityInput } from "@/hooks/admin/useActivities"

const formSchema = z.object({
  name: z.string().min(1, "El nombre es requerido."),
  label: z.string().min(1, "La etiqueta es requerida."),
})

type ActivityFormValues = z.infer<typeof formSchema>

interface ActivityDialogProps {
  open: boolean
  activity: EventActivity | null
  onCancel: () => void
  createActivity: (activity: EventActivityInput) => Promise<EventActivity>
  updateActivity: (activity: EventActivityInput & { id: number }) => Promise<EventActivity>
  isMutating: boolean
}

export function ActivityDialog({
  open,
  activity,
  onCancel,
  createActivity,
  updateActivity,
  isMutating,
}: ActivityDialogProps) {
  const form = useForm<ActivityFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      label: "",
    },
  })

  useEffect(() => {
    if (!open) return

    form.reset({
      name: activity?.name ?? "",
      label: activity?.label ?? "",
    })
  }, [open, activity, form])

  async function onSubmit(values: ActivityFormValues) {
    if (activity) {
      await updateActivity({ id: activity.id, ...values })
    } else {
      await createActivity(values)
    }
    onCancel()
  }

  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl">{activity ? "Editar" : "Nueva"} actividad</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form id="form-activity" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="check_in" />
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
                    <Input {...field} placeholder="Check-in" />
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
            form="form-activity"
            className="bg-green-500"
            disabled={form.formState.isSubmitting || isMutating}
          >
            {form.formState.isSubmitting && <Loader2Icon className="animate-spin" />}
            Guardar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
