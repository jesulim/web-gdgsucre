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
  FormDescription,
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

export function NewCommunityDialog({ open, onOpenChange, onCreate }: NewCommunityDialogProps) {
  const form = useForm<NewCommunityFormValues>({
    resolver: zodResolver(newCommunitySchema),
    defaultValues: { name: "", short_name: "", website: "", contact_email: "", color: "#f0f0f0" },
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
        className="bg-black rounded-none border-white font-monospace text-white py-8"
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
                  <FormLabel className="text-xs uppercase">
                    Nombre <span className="text-red-500">*</span>
                  </FormLabel>
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
                  <FormLabel className="text-xs uppercase">
                    Email de contacto <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input {...field} type="email" enterKeyHint="done" className="rounded-none" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase">Color de acento</FormLabel>
                  <FormDescription>Elige un color claro con suficiente contraste.</FormDescription>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input
                        {...field}
                        type="text"
                        enterKeyHint="done"
                        className="rounded-none font-mono"
                        placeholder="#f0f0f0"
                      />
                      <label
                        className="size-10 shrink-0 cursor-pointer border border-off-white"
                        style={{ backgroundColor: field.value }}
                        title="Abrir selector de color"
                      >
                        <input
                          type="color"
                          value={field.value}
                          onChange={e => field.onChange(e.target.value)}
                          className="size-0 opacity-0"
                        />
                      </label>
                    </div>
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
