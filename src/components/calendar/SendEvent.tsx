import { zodResolver } from "@hookform/resolvers/zod"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { Loader2Icon, SendIcon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Toaster, toast } from "sonner"

import { Button } from "@/components/ui/button"
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
  type CalendarEventFormValues,
  calendarEventSchema,
  type NewCommunityFormValues,
} from "@/lib/validators/calendarEvent"

import { CommunityCombobox } from "./CommunityCombobox"
import { FormatToggle } from "./FormatToggle"
import { NewCommunityDialog } from "./NewCommunityDialog"

// Sentinel used while a brand-new community is staged locally (see NewCommunityDialog):
// it is not a real id yet, it only marks "create the community first, then use its id".
const NEW_COMMUNITY_ID = -1

const queryClient = new QueryClient()

interface SendEventProps {
  isLoggedIn: boolean
}

async function readErrorMessage(response: Response) {
  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("application/json")) {
    const body = await response.json().catch(() => null)
    if (body?.error) return body.error as string
  }
  const text = await response.text().catch(() => "")
  return text || "Ocurrió un error inesperado. Intenta de nuevo."
}

function SendEventForm({ isLoggedIn }: SendEventProps) {
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [communityLabel, setCommunityLabel] = useState<string | null>(null)
  const [pendingCommunity, setPendingCommunity] = useState<NewCommunityFormValues | null>(null)

  const form = useForm<CalendarEventFormValues>({
    resolver: zodResolver(calendarEventSchema),
    defaultValues: {
      name: "",
      community_id: 0,
      start_datetime: "",
      end_datetime: "",
      format: "in-person",
      location: "",
      registration_link: "",
    },
  })

  function handleSelectCommunity(id: number, label: string) {
    setPendingCommunity(null)
    setCommunityLabel(label)
    form.setValue("community_id", id, { shouldValidate: true })
  }

  function handleCreateCommunity(values: NewCommunityFormValues) {
    setPendingCommunity(values)
    setCommunityLabel(`${values.name} (nueva)`)
    form.setValue("community_id", NEW_COMMUNITY_ID, { shouldValidate: true })
  }

  async function onSubmit(values: CalendarEventFormValues) {
    setLoading(true)
    try {
      let communityId = values.community_id

      // Si se está agregando una nueva comunidad, se crea primero: si esto
      // falla se corta acá y el evento no llega a enviarse.
      if (communityId === NEW_COMMUNITY_ID) {
        if (!pendingCommunity) {
          form.setError("community_id", { type: "manual", message: "Elige una comunidad" })
          return
        }

        const communityRes = await fetch("/api/communities", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: pendingCommunity.name,
            short_name: pendingCommunity.short_name || undefined,
            website: pendingCommunity.website || undefined,
            contact_email: pendingCommunity.contact_email,
          }),
        })

        if (!communityRes.ok) {
          toast.error(await readErrorMessage(communityRes))
          return
        }

        const created = await communityRes.json()
        communityId = created.id
      }

      const eventRes = await fetch("/api/calendar-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name,
          community_id: communityId,
          start_datetime: `${values.start_datetime}:00`,
          end_datetime: `${values.end_datetime}:00`,
          format: values.format,
          registration_link: values.registration_link || undefined,
          location: values.location,
        }),
      })

      if (!eventRes.ok) {
        toast.error(await readErrorMessage(eventRes))
        return
      }

      setSubmitted(true)
      form.reset()
      setCommunityLabel(null)
      setPendingCommunity(null)
    } catch (error) {
      console.error("Error al enviar el evento:", error)
      toast.error("Ocurrió un error inesperado. Intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  const disabled = !isLoggedIn || loading

  if (submitted) {
    return (
      <div className="border p-8 text-center text-white">
        <p className="text-lg font-bold">¡Recibimos tu evento!</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Cuando sea aprobado, se publicará en la agenda.
        </p>
        <Button
          type="button"
          variant="outline"
          className="mt-6 rounded-none"
          onClick={() => setSubmitted(false)}
        >
          Publicar otro evento
        </Button>
      </div>
    )
  }

  return (
    <div className="relative border text-white">
      <Toaster position="top-right" richColors />
      <Form {...form}>
        <form className="flex flex-col gap-6 p-6" onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase">Nombre del evento</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={disabled}
                    placeholder="DevFest Sucre 2026"
                    className="rounded-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="community_id"
            render={() => (
              <FormItem>
                <FormLabel className="text-xs uppercase">Comunidad</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <div className="min-w-0 flex-1">
                      <CommunityCombobox
                        value={form.watch("community_id")}
                        label={communityLabel}
                        onChange={handleSelectCommunity}
                        disabled={disabled}
                      />
                    </div>
                    <NewCommunityDialog onCreate={handleCreateCommunity} disabled={disabled} />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              control={form.control}
              name="start_datetime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase">Inicio</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      disabled={disabled}
                      className="rounded-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="end_datetime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs uppercase">Fin</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="datetime-local"
                      disabled={disabled}
                      className="rounded-none"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="format"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase">Modalidad</FormLabel>
                <FormControl>
                  <FormatToggle value={field.value} onChange={field.onChange} disabled={disabled} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="location"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase">Ubicación / Link de acceso</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={disabled}
                    placeholder="Hub de innovación USFX / Link de acceso"
                    className="rounded-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="registration_link"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs uppercase">Link de registro</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    disabled={disabled}
                    placeholder="https://..."
                    className="rounded-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={disabled}
            className="bg-lime-300 hover:bg-lime-300/90 w-full rounded-none py-6 font-bold text-black uppercase"
          >
            {loading && <Loader2Icon className="animate-spin" />}
            Enviar evento
            <SendIcon className="size-4" />
          </Button>
        </form>
      </Form>

      {!isLoggedIn && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center text-white bg-black/70 backdrop-blur-xs">
          <p className="text-sm uppercase">Inicia sesión para publicar tu evento</p>
          <Button asChild className="bg-lime-300 hover:bg-lime-300/90 rounded-none text-black">
            <a href="/api/auth/signin?next=/calendario">Iniciar sesión</a>
          </Button>
        </div>
      )}
    </div>
  )
}

export function SendEvent(props: SendEventProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SendEventForm {...props} />
    </QueryClientProvider>
  )
}
