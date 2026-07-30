import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { Controller, useForm } from "react-hook-form"
import { Toaster, toast } from "sonner"
import { z } from "zod"

import { AvatarUpload } from "@/components/profile/AvatarUpload"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "El nombre es requerido"),
  last_name: z.string().trim().min(1, "El apellido es requerido"),
  occupation: z.string().trim().optional(),
  phone_number: z.string().trim().optional(),
  share_data: z.boolean().optional(),
  display_name: z.string().trim().optional(),
})

type ProfileValues = z.infer<typeof profileSchema>

interface ProfileFormProps {
  profile: {
    id: string
    first_name: string
    last_name: string
    occupation?: string | null
    phone_number?: string | null
    email?: string | null
    avatar_url?: string | null
    share_data: boolean
    display_name?: string | null
  }
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [loading, setLoading] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url)

  const form = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      phone_number: profile.phone_number || "",
      occupation: profile.occupation || "",
      share_data: profile.share_data ?? false,
      display_name: profile.display_name || "",
    },
  })

  async function onSubmit(values: ProfileValues) {
    setLoading(true)

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      })
      if (res.ok) {
        toast.success("Perfil actualizado correctamente")
      } else {
        toast.error(await res.text())
      }
    } catch (error) {
      toast.error("Error al actualizar el perfil")
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Toaster position="top-right" richColors />
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2 items-start">
          <FieldLabel>Foto de perfil</FieldLabel>
          <FieldDescription>
            Se utilizará en credenciales virtuales y en la sección de organizadores.
          </FieldDescription>
          <AvatarUpload
            currentAvatarUrl={avatarUrl}
            userName={profile.first_name}
            onAvatarChange={setAvatarUrl}
          />
        </div>

        <Controller
          name="first_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Nombre(s) <span className="text-destructive">*</span>
              </FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="last_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>
                Apellido(s) <span className="text-destructive">*</span>
              </FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="occupation"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Ocupación</FieldLabel>
              <Input
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                placeholder="Estudiante, Desarrollador, Diseñador"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="display_name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Nombre para mostrar</FieldLabel>
              <Input {...field} id={field.name} aria-invalid={fieldState.invalid} />
              <FieldDescription>
                Cómo aparecerá tu nombre en credenciales y listas públicas.
              </FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="phone_number"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Teléfono</FieldLabel>
              <Input {...field} id={field.name} inputMode="tel" aria-invalid={fieldState.invalid} />
              <FieldDescription>Si no es de Bolivia, incluye el código de area.</FieldDescription>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="share_data"
          control={form.control}
          render={({ field, fieldState }) => (
            <FieldGroup data-slot="checkbox-group">
              <Field
                className={`border p-2 rounded-lg ${field.value && "border-gray-500"}`}
                orientation="horizontal"
                data-invalid={fieldState.invalid}
              >
                <Checkbox
                  id={field.name}
                  name={field.name}
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  aria-invalid={fieldState.invalid}
                />
                <FieldContent>
                  <FieldLabel htmlFor={field.name} className="font-normal">
                    Compartir información con sponsors
                  </FieldLabel>
                  <FieldDescription>
                    Tu información podría utilizarse con fines promocionales o propuestas de
                    trabajo.
                  </FieldDescription>
                </FieldContent>
              </Field>
            </FieldGroup>
          )}
        />

        <Button className="w-full bg-blue-500 dark:text-white" type="submit" disabled={loading}>
          {loading && <Loader2Icon className="animate-spin" />}
          Guardar cambios
        </Button>
      </form>
    </>
  )
}
