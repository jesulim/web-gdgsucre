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
  exempt_option: z.string().nullish(),
  image_url: z.string().nullish(),
})

export type FormFieldSchema = z.infer<typeof formFieldSchema>

/**
 * Un select con `exempt_option` deja los archivos del evento opcionales cuando el
 * participante elige esa opción (ej. "Sin paquete" → sin comprobante).
 */
export function areFilesOptional(fields: FormFieldSchema[], values: Record<string, unknown>) {
  return fields.some(
    field =>
      field.type === "select" && !!field.exempt_option && values[field.name] === field.exempt_option
  )
}

export function isFieldRequired(
  field: FormFieldSchema,
  fields: FormFieldSchema[],
  values: Record<string, unknown>
) {
  if (!field.required) return false
  if (field.type !== "file") return true
  return !areFilesOptional(fields, values)
}

export function buildZodSchemaFromFields(fields: FormFieldSchema[]) {
  const shape: Record<string, z.ZodType<string | File | undefined, string | File | undefined>> = {}

  for (const field of fields) {
    let base: z.ZodType<string | File | undefined, string | File | undefined>

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
        base = z.file().max(5_000_000, "El archivo debe pesar menos de 5MB").optional()
        break

      default:
        base = z.string()
        break
    }

    if (!field.required && field.type !== "file") {
      base = base.optional()
    }

    shape[field.name] = base
  }

  return z.object(shape).superRefine((values, ctx) => {
    const filesOptional = areFilesOptional(fields, values)

    for (const field of fields) {
      if (field.type !== "file" || !field.required || filesOptional) continue

      const value = values[field.name]
      if (value === undefined || value === "") {
        ctx.addIssue({
          code: "custom",
          path: [field.name],
          message: `${field.label} es obligatorio`,
        })
      }
    }
  })
}
