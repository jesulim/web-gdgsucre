import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

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
  type FormFieldSchema,
  buildZodSchemaFromFields,
} from "@/lib/validators/formFields"

import { FormFileInput } from "./FormFileInput"
import { FormSelect } from "./FormSelect"

interface RegisterFormProps {
  event: { id: string; slug: string }
  formFields: FormFieldSchema[]
  profile: { id: string; first_name: string; last_name: string } | null
}

export function RegisterForm({
  formFields,
  profile,
  event,
}: RegisterFormProps) {
  const [loading, setLoading] = useState(false)

  let formSchema = buildZodSchemaFromFields(formFields)
  let defaultValues = Object.fromEntries(
    formFields.map(field => [
      field.name,
      field.type === "file" ? undefined : "",
    ])
  )

  if (!profile) {
    formSchema = formSchema.extend({
      first_name: z.string().trim().min(1, "El nombre es requerido"),
      last_name: z.string().trim().min(1, "El apellido es requerido"),
      phone_number: z
        .string()
        .trim()
        .min(1, "El número de teléfono es requerido"),
    })

    defaultValues = {
      first_name: "",
      last_name: "",
      phone_number: "",
      ...defaultValues,
    }
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues,
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    const formData = new FormData()
    formData.append("event_id", event.id)
    formData.append("event_slug", event.slug)

    for (const [key, value] of Object.entries(values)) {
      formData.append(key, value)
    }

    setLoading(true)
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        body: formData,
      })
      if (res.ok) {
        window.location.href = `/registro/${event.slug}/pendiente`
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form
        className="space-y-4"
        onSubmit={form.handleSubmit(onSubmit, errors => {
          console.error("Errores de validacion:", errors)
        })}
      >
        {!profile && (
          <>
            <FormField
              control={form.control}
              name="first_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre(s)</FormLabel>
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
                  <FormLabel>Apellido(s)</FormLabel>
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
                  <FormLabel>Número de teléfono</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        {formFields.map(formField => (
          <FormField
            key={formField.id}
            control={form.control}
            name={formField.name}
            render={({ field }) => (
              <FormItem>
                <FormLabel>{formField.label}</FormLabel>
                <FormControl>
                  {formField.type === "select" && formField.options ? (
                    <FormSelect
                      label={formField.label}
                      options={formField.options}
                      field={field}
                    />
                  ) : formField.type === "file" ? (
                    <FormFileInput field={field} />
                  ) : (
                    <Input {...field} type={formField.type} />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ))}

        <Button className="w-full bg-[#35a852]" type="submit">
          {loading && <Loader2Icon className="animate-spin" />}
          Regístrate
        </Button>
      </form>
    </Form>
  )
}
