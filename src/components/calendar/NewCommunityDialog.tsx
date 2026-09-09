import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { type NewCommunityFormValues, newCommunitySchema } from "@/lib/validators/calendarEvent"

interface NewCommunityDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreate: (values: NewCommunityFormValues) => void
}

// NOTE: this dialog must stay mounted outside the combobox popup (see
// CommunityCombobox): the popup unmounts when it closes (e.g. on window blur),
// which would otherwise destroy the dialog and its form state with it.
export function NewCommunityDialog({ open, onOpenChange, onCreate }: NewCommunityDialogProps) {
  const form = useForm<NewCommunityFormValues>({
    resolver: zodResolver(newCommunitySchema),
    defaultValues: { name: "", short_name: "", website: "", contact_email: "" },
  })

  function onSubmit(values: NewCommunityFormValues) {
    onCreate(values)
    form.reset()
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        if (!next) form.reset()
        onOpenChange(next)
      }}
    >
      <DialogContent
        className="bg-[#2e2e2e] rounded-none border-white font-monospace text-white py-8"
        onInteractOutside={event => event.preventDefault()}
        onEscapeKeyDown={event => event.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Nueva comunidad</DialogTitle>
          <DialogDescription className="normal-case">
            Se envía junto al evento y queda pendiente de revisión.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase">Nombre</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      enterKeyHint="next"
                      className="rounded-none"
                      placeholder="Google Developer Group Sucre"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="short_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase">Nombre corto</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      enterKeyHint="next"
                      className="rounded-none"
                      placeholder="GDG Sucre"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase">Sitio web</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="url"
                      enterKeyHint="next"
                      placeholder="https://..."
                      className="rounded-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contact_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase">Email de contacto</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" enterKeyHint="done" className="rounded-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="submit"
                className="bg-white hover:bg-white hover:shadow-[4px_4px_0_0_var(--color-red-500)] w-full rounded-none font-bold text-black"
              >
                Agregar comunidad
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
