import { z } from "zod"
import { es } from "zod/locales"

z.config(es())

export const SUPPORTED_TYPES = ["text", "select", "file"] as const
export type FieldType = (typeof SUPPORTED_TYPES)[number]

export const formFieldSchema = z.object({
  id: z.number(),
  name: z.string(),
  label: z.string(),
  type: z.enum(SUPPORTED_TYPES),
  required: z.boolean(),
  options: z.array(z.string()).nullish(),
  image_url: z.string().nullish(),
})

export type FormFieldSchema = z.infer<typeof formFieldSchema>

export function buildZodSchemaFromFields(fields: FormFieldSchema[]) {
  const shape: Record<string, z.ZodString | z.ZodFile> = {}

  for (const field of fields) {
    let base = z.string()

    switch (field.type) {
      case "text":
        base = z.string()
        break

      case "select":
        if (Array.isArray(field.options) && field.options.length > 0) {
          base = z.enum(field.options, {
            error: "Elige una opción de la lista.",
          })
        } else {
          base = z.string().trim()
        }
        break

      case "file":
        base = z.file()
        break

      default:
        base = z.string()
        break
    }

    if (!field.required) {
      base = base.optional()
    }

    shape[field.name] = base
  }

  return z.object(shape)
}
