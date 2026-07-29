import { z } from "zod"
import { es } from "zod/locales"

z.config(es())

export const EVENT_FORMATS = ["in-person", "virtual"] as const
export type EventFormat = (typeof EVENT_FORMATS)[number]

const optionalUrl = z.union([z.literal(""), z.url()]).optional()

export const calendarEventSchema = z
  .object({
    name: z.string().trim().min(3, "El nombre debe tener al menos 3 caracteres"),
    community_id: z
      .number()
      .int()
      .refine(value => value !== 0, { error: "Elige una comunidad" }),
    start_datetime: z.string().trim().min(1, "La fecha de inicio es requerida"),
    end_datetime: z.string().trim().min(1, "La fecha de fin es requerida"),
    format: z.enum(EVENT_FORMATS, { error: "Elige una modalidad" }),
    location: z.string().trim().min(1, "Este campo es requerido"),
    registration_link: optionalUrl,
  })
  .refine(values => new Date(values.end_datetime) > new Date(values.start_datetime), {
    error: "La fecha de fin debe ser posterior a la de inicio",
    path: ["end_datetime"],
  })

export type CalendarEventFormValues = z.infer<typeof calendarEventSchema>

export const newCommunitySchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  short_name: z.string().trim().optional(),
  website: optionalUrl,
  contact_email: z.email("Ingresá un email válido"),
})

export type NewCommunityFormValues = z.infer<typeof newCommunitySchema>
