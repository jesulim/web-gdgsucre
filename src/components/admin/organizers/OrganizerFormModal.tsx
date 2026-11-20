import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { AvatarUpload } from "@/components/profile/AvatarUpload"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
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
import useOrganizers, { type OrganizerSearchResult } from "@/hooks/admin/useOrganizers"
import { cn } from "@/lib/utils"

import type { OrganizerData } from "./OrganizersTable"

const formSchema = z.object({
  first_name: z.string().min(1, "El nombre es requerido."),
  last_name: z.string().min(1, "El apellido es requerido."),
  email: z.string().min(1, "El correo es requerido."),
  phone_number: z.string(),
  profile_id: z.string().optional(),
  avatar_url: z.string().nullish(),
})

type OrganizerFormValues = z.infer<typeof formSchema>

const emptyForm: OrganizerFormValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
  avatar_url: null,
}

type Step = "search" | "form" | "confirm"

interface OrganizerFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventSlug: string
  organizer: OrganizerData | null
}

function OrganizerSummary({
  values,
  className,
}: {
  values: OrganizerFormValues
  className?: string
}) {
  const initials = `${values.first_name?.[0] ?? ""}${values.last_name?.[0] ?? ""}`.toUpperCase()

  return (
    <div className={cn("flex items-center gap-3", className)}>
      <Avatar className="size-12 shrink-0 border">
        <AvatarImage src={values.avatar_url || ""} alt={values.first_name} />
        <AvatarFallback className="bg-blue-100 text-blue-800 text-sm font-medium">
          {initials || "?"}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="font-medium text-sm">
          {values.first_name || values.last_name
            ? `${values.first_name} ${values.last_name}`
            : "Usuario registrado"}
        </p>
        <p className="text-xs text-muted-foreground truncate">{values.email}</p>
        {values.phone_number && (
          <p className="text-xs text-muted-foreground">{values.phone_number}</p>
        )}
      </div>
    </div>
  )
}

type SearchUser = NonNullable<OrganizerSearchResult["data"]>[number]

function EmailSearch({
  onSelect,
  searchOrganizer,
  isSearching,
}: {
  onSelect: (values: OrganizerFormValues) => void
  searchOrganizer: (query: string) => Promise<OrganizerSearchResult>
  isSearching: boolean
}) {
  const [query, setQuery] = useState("")
  const [matches, setMatches] = useState<SearchUser[]>([])
  const [searched, setSearched] = useState(false)

  const handleSearch = async () => {
    const trimmed = query.trim()
    if (!trimmed) {
      toast.error("Por favor ingresa un correo o nombre para buscar")
      return
    }

    try {
      const result = await searchOrganizer(trimmed)
      setMatches(result.success ? (result.data ?? []) : [])
      setSearched(true)
      if (!result.success) toast.error(result.error || "No se encontraron resultados")
    } catch (error) {
      console.error("Error buscando usuario", error)
      toast.error("Error al buscar usuario")
    }
  }

  const handleSelect = (user: SearchUser) => {
    onSelect({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone_number: user.phone_number,
      avatar_url: user.avatar_url,
      profile_id: user.id,
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input
          placeholder="Correo o nombre"
          value={query}
          onChange={e => setQuery(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleSearch()
            }
          }}
          className="text-sm"
        />
        <Button onClick={handleSearch} disabled={isSearching}>
          {isSearching ? "Buscando..." : "Buscar"}
        </Button>
      </div>

      {matches.length > 0 && (
        <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
          {matches.map(user => (
            <button
              key={user.id}
              type="button"
              onClick={() => handleSelect(user)}
              className="w-full rounded-md border bg-muted/40 p-2.5 text-left transition-colors hover:bg-accent"
            >
              <OrganizerSummary
                values={{
                  first_name: user.first_name,
                  last_name: user.last_name,
                  email: user.email,
                  phone_number: user.phone_number,
                  avatar_url: user.avatar_url,
                }}
              />
            </button>
          ))}
        </div>
      )}

      {searched && matches.length === 0 && !isSearching && (
        <p className="py-2 text-center text-sm text-muted-foreground">
          No se encontraron usuarios. Puedes registrar uno desde cero.
        </p>
      )}

      <Button variant="secondary" className="w-full" onClick={() => onSelect({ ...emptyForm })}>
        Agregar desde cero
      </Button>
    </div>
  )
}

export function OrganizerFormModal({
  open,
  onOpenChange,
  eventSlug,
  organizer,
}: OrganizerFormModalProps) {
  const [step, setStep] = useState<Step>("form")
  const [isCropping, setIsCropping] = useState(false)

  const { addOrganizer, updateOrganizer, isSaving, searchOrganizer, isSearching, uploadAvatar } =
    useOrganizers(eventSlug)

  const isEdit = Boolean(organizer)

  const form = useForm<OrganizerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: emptyForm,
  })

  useEffect(() => {
    if (!open) return

    form.reset(
      organizer
        ? {
            first_name: organizer.first_name,
            last_name: organizer.last_name,
            email: organizer.email ?? "",
            phone_number: organizer.phone_number ?? "",
            profile_id: organizer.profile_id,
            avatar_url: organizer.image,
          }
        : emptyForm
    )
    setStep(organizer ? "form" : "search")
    setIsCropping(false)
  }, [open, organizer, form])

  const values = form.watch()

  const handleConfirm = async () => {
    const formValues = form.getValues()
    try {
      if (isEdit && organizer) {
        await updateOrganizer({ id: organizer.id, ...formValues })
      } else {
        await addOrganizer(formValues)
      }
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : isEdit
            ? "Error al actualizar organizador"
            : "Error al agregar organizador"
      toast.error(message)
    }
  }

  const handleAvatarUpload = (blob: Blob) => {
    const profileId = form.getValues("profile_id")
    if (!profileId) return Promise.reject(new Error("No se encontró el ID de perfil"))
    return uploadAvatar({ blob, profileId })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {step === "search" ? (
          <>
            <DialogHeader>
              <DialogTitle>Agregar organizador</DialogTitle>
              <DialogDescription>Busca un usuario por email o nombre.</DialogDescription>
            </DialogHeader>

            <EmailSearch
              onSelect={values => {
                form.reset(values)
                setStep("form")
              }}
              searchOrganizer={searchOrganizer}
              isSearching={isSearching}
            />
          </>
        ) : step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>{isEdit ? "Editar organizador" : "Agregar organizador"}</DialogTitle>
            </DialogHeader>

            {isEdit && values.profile_id && (
              <div className="flex flex-col items-center justify-center py-2">
                <AvatarUpload
                  currentAvatarUrl={values.avatar_url}
                  userName={`${values.first_name} ${values.last_name}`.trim()}
                  avatarClassName="size-28"
                  onAvatarChange={newUrl => form.setValue("avatar_url", newUrl)}
                  onUpload={handleAvatarUpload}
                  onCroppingChange={setIsCropping}
                />
              </div>
            )}

            {!isEdit && values.profile_id && (
              <OrganizerSummary values={values} className="bg-muted/50 border rounded-md p-2.5" />
            )}

            {!isCropping && (
              <>
                <Form {...form}>
                  <form
                    id="organizer-form"
                    noValidate
                    className="space-y-4"
                    onSubmit={form.handleSubmit(() => setStep("confirm"))}
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <FormField
                        control={form.control}
                        name="first_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre(s)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="Ana" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="last_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Apellido(s)</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="García" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Correo electrónico</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="ana@ejemplo.com"
                              disabled={isEdit}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone_number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="71234567" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>

                <DialogFooter>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" form="organizer-form" className="bg-blue-500">
                    Continuar
                  </Button>
                </DialogFooter>
              </>
            )}
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {isEdit ? "Confirmar cambios" : "Confirmar nuevo organizador"}
              </DialogTitle>
              <DialogDescription>
                {isEdit
                  ? "¿Deseas guardar los cambios de este organizador?"
                  : "¿Deseas agregar este organizador al evento?"}
              </DialogDescription>
            </DialogHeader>

            <OrganizerSummary values={values} className="bg-muted rounded-md p-3" />

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("form")}>
                Volver
              </Button>
              <Button className="bg-blue-500" onClick={handleConfirm} disabled={isSaving}>
                {isSaving ? "Guardando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
