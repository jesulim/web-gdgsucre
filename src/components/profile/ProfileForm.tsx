import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Toaster, toast } from "sonner"
import { z } from "zod"

import { AvatarUpload } from "@/components/profile/AvatarUpload"

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
import { FieldDescription } from "../ui/field"

const profileSchema = z.object({
  first_name: z.string().trim().min(1, "El nombre es requerido"),
  last_name: z.string().trim().min(1, "El apellido es requerido"),
  occupation: z.string().trim().optional(),
  phone_number: z.string().trim().optional(),
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
    },
  })

  async function onSubmit(values: ProfileValues) {
    setLoading(true)

    const formData = new FormData()
    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value ?? "")
    }

    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        body: formData,
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
    <Form {...form}>
      <Toaster position="top-right" richColors />
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="flex flex-col gap-2 items-start">
          <FormLabel>Foto de perfil</FormLabel>
          <FieldDescription>
            Se utilizará en credenciales virtuales y en la sección de organizadores.
          </FieldDescription>
          <AvatarUpload
            currentAvatarUrl={avatarUrl}
            userName={profile.first_name}
            onAvatarChange={setAvatarUrl}
          />
        </div>

        <FormField
          control={form.control}
          name="first_name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Nombre(s) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
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
              <FormLabel>
                Apellido(s) <span className="text-destructive">*</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
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
                <Input {...field} inputMode="tel" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="occupation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ocupación</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button className="w-full bg-blue-500 dark:text-white" type="submit" disabled={loading}>
          {loading && <Loader2Icon className="animate-spin" />}
          Guardar cambios
        </Button>
      </form>
    </Form>
  )
}
