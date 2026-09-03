import { zodResolver } from "@hookform/resolvers/zod"
import { PlusIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
  onCreate: (values: NewCommunityFormValues) => void
  disabled?: boolean
}

export function NewCommunityDialog({ onCreate, disabled }: NewCommunityDialogProps) {
  const [open, setOpen] = useState(false)

  const form = useForm<NewCommunityFormValues>({
    resolver: zodResolver(newCommunitySchema),
    defaultValues: { name: "", short_name: "", website: "", contact_email: "" },
  })

  function onSubmit(values: NewCommunityFormValues) {
    onCreate(values)
    form.reset()
    setOpen(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        setOpen(next)
        if (!next) form.reset()
      }}
    >
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={disabled}
          className="shrink-0 rounded-none border bg-white text-black hover:bg-white"
          aria-label="Agregar nueva comunidad"
        >
          <PlusIcon className="size-4" /> Nueva comunidad
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-[#2e2e2e] rounded-none border-white font-monospace text-white py-8">
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
                    <Input {...field} className="rounded-none" placeholder="GDG Sucre" />
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
                    <Input {...field} type="email" className="rounded-none" />
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
