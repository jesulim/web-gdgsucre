import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { Toaster, toast } from "sonner"
import { z } from "zod"
import { FormFileInput } from "@/components/registration/FormFileInput"
import { FormSelect } from "@/components/registration/FormSelect"
import ProfileFormFields from "@/components/registration/ProfileFormFields"
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
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { buildZodSchemaFromFields, type FormFieldSchema } from "@/lib/validators/formFields"

interface JoinTeamFormProps {
  event: { id: string; slug: string; name: string }
  formFields: FormFieldSchema[]
  profile: { id: string; first_name: string; last_name: string } | null
  teamCode?: string
}

export function JoinTeamForm({ formFields, profile, event, teamCode }: JoinTeamFormProps) {
  const [loading, setLoading] = useState(false)

  let formSchema = buildZodSchemaFromFields(formFields)
  let defaultValues = Object.fromEntries(
    formFields.map(field => [field.name, field.type === "file" ? undefined : ""])
  )

  if (!profile?.last_name) {
    formSchema = formSchema.extend({
      first_name: z.string().trim().min(1, "El nombre es requerido"),
      last_name: z.string().trim().min(1, "El apellido es requerido"),
      phone_number: z.string().trim().min(1, "El número de teléfono es requerido"),
    })

    defaultValues = {
      first_name: "",
      last_name: "",
      phone_number: "",
      ...defaultValues,
    }
  }

  formSchema = formSchema.extend({
    team_code: z.string().trim().length(6, "El código de equipo debe tener 6 caracteres"),
  })

  defaultValues = {
    ...defaultValues,
    team_code: teamCode || "",
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true)

    const formData = new FormData()
    formData.append("event_id", event.id)
    formData.append("event_slug", event.slug)
    formData.append("event_name", event.name)

    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value)
    }

    try {
      const res = await fetch("/api/registerTeam", {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        window.location.href = `/registro/${event.slug}/pendiente`
      } else {
        toast.error(await res.text())
      }
    } catch (error) {
      console.error("Error al registrar:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <Toaster position="top-right" richColors />
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        {profile?.last_name ? (
          <p className="text-lg">¡Nos alegra verte de nuevo, {profile.first_name}!</p>
        ) : (
          <ProfileFormFields form={form} />
        )}

        {formFields.map(formField => (
          <FormField
            key={formField.id}
            control={form.control}
            name={formField.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  {formField.required ? (
                    <>
                      {formField.label} <span className="text-destructive">*</span>
                    </>
                  ) : (
                    `(Opcional) ${formField.label}`
                  )}
                </FormLabel>
                {formField.image_url && (
                  <img
                    src={formField.image_url}
                    width="400"
                    alt={formField.label}
                    className="mx-auto"
                  />
                )}
                <FormControl>
                  {formField.type === "select" && formField.options ? (
                    <FormSelect label={formField.label} options={formField.options} field={field} />
                  ) : formField.type === "file" ? (
                    <FormFileInput
                      className="dark:file:text-gray-300 dark:file:pe-2"
                      field={field}
                    />
                  ) : (
                    <Input {...field} type={formField.type} />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <div className="pt-4 mt-8 border-t border-border">
          <h3 className="text-lg font-medium mb-4">Código de Equipo</h3>
          <FormField
            control={form.control}
            name="team_code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Ingresa el código <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <InputOTP
                    maxLength={6}
                    readOnly={!!teamCode}
                    disabled={!!teamCode}
                    // TODO: use onComplete={} to fetch team name
                    {...field}
                  >
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSeparator />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button className="w-full bg-blue-500 dark:text-white" type="submit">
          {loading && <Loader2Icon className="animate-spin" />}
          Regístrate
        </Button>
      </form>
    </Form>
  )
}
