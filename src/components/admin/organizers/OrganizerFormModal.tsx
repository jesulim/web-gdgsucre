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

type Step = "form" | "confirm"

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

function EmailSearch({
  onFound,
  searchOrganizer,
  isSearching,
}: {
  onFound: (values: OrganizerFormValues) => void
  searchOrganizer: (email: string) => Promise<OrganizerSearchResult>
  isSearching: boolean
}) {
  const [email, setEmail] = useState("")

  const handleSearch = async () => {
    const trimmed = email.trim()
    if (!trimmed) {
      toast.error("Por favor ingresa un correo para buscar")
      return
    }

    try {
      const result = await searchOrganizer(trimmed)

      if (!result.success) {
        toast.error(result.error || "Usuario no encontrado")
        return
      }

      if (!result.data) {
        toast.error("Usuario no encontrado")
        return
      }

      onFound({
        first_name: result.data.first_name || "",
        last_name: result.data.last_name || "",
        email: result.data.email || trimmed,
        phone_number: result.data.phone_number || "",
        avatar_url: result.data.avatar_url || null,
        profile_id: result.data.id,
      })

      if (result.source === "auth") {
        toast.info("Usuario encontrado en la plataforma. Completa sus datos si es necesario.")
      } else {
        toast.success("Perfil encontrado y cargado")
      }
    } catch (error) {
      console.error("Error buscando usuario", error)
      toast.error("Error al buscar usuario")
    }
  }

  return (
    <div className="bg-muted rounded-md p-3 space-y-2">
      <p className="text-xs text-muted-foreground">Buscar usuario registrado por correo</p>
      <div className="flex gap-2">
        <Input
          placeholder="correo@ejemplo.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault()
              handleSearch()
            }
          }}
          className="text-sm"
        />
        <Button variant="outline" size="sm" onClick={handleSearch} disabled={isSearching}>
          {isSearching ? "Buscando..." : "Buscar"}
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Busca primero en perfiles y luego en cuentas registradas
      </p>
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
    setStep("form")
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
        {step === "form" ? (
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

            {!isEdit && (
              <EmailSearch
                onFound={values => form.reset(values)}
                searchOrganizer={searchOrganizer}
                isSearching={isSearching}
              />
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
                            <Input {...field} placeholder="+591 7xxxxxxx" />
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
