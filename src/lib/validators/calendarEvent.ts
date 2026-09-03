import { z } from "zod"
import { es } from "zod/locales"

z.config(es())

export const EVENT_FORMATS = ["in-person", "virtual"] as const
export type EventFormat = (typeof EVENT_FORMATS)[number]

const optionalUrl = z
  .union([
    z.literal(""),
    z
      .string()
      .regex(
        /^(https?:\/\/)?(([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+)?[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,}([/?#].*)?$/i,
        "Ingresa una URL válida"
      ),
  ])
  .optional()

export const calendarEventSchema = z
  .object({
    name: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres"),
    community_id: z
      .number()
      .int()
      .refine(value => value !== 0, { error: "Elige una comunidad" }),
    start_datetime: z.string(),
    end_datetime: z.string(),
    format: z.enum(EVENT_FORMATS, { error: "Elige una modalidad" }),
    location: z.string().optional(),
    registration_link: optionalUrl,
    dates_tbd: z.boolean(),
  })
  .superRefine((values, ctx) => {
    if (values.dates_tbd) return

    const start = values.start_datetime.trim()
    const end = values.end_datetime.trim()

    if (!start) {
      ctx.addIssue({
        code: "custom",
        path: ["start_datetime"],
        message: "La fecha de inicio es requerida",
      })
    }
    if (!end) {
      ctx.addIssue({
        code: "custom",
        path: ["end_datetime"],
        message: "La fecha de fin es requerida",
      })
    }

    if (start && end && !(new Date(end) > new Date(start))) {
      ctx.addIssue({
        code: "custom",
        path: ["end_datetime"],
        message: "La fecha de fin debe ser posterior a la de inicio",
      })
    }
  })

export type CalendarEventFormValues = z.infer<typeof calendarEventSchema>

export const newCommunitySchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  short_name: z.string().trim().optional(),
  website: optionalUrl,
  contact_email: z.email("Ingresa un email válido"),
})

export type NewCommunityFormValues = z.infer<typeof newCommunitySchema>
