import { z } from "zod"
import { es } from "zod/locales"

z.config(es())

export const EVENT_FORMATS = ["in-person", "virtual"] as const
export type EventFormat = (typeof EVENT_FORMATS)[number]

const URL_REGEX =
  /^(https?:\/\/)?(([a-z0-9]([a-z0-9-]*[a-z0-9])?\.)+)?[a-z0-9]([a-z0-9-]*[a-z0-9])?\.[a-z]{2,}([/?#].*)?$/i

const optionalUrl = z
  .union([z.literal(""), z.string().regex(URL_REGEX, "Ingresa una URL válida")])
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
    location: z.string().trim().min(1, "La ubicación es requerida"),
    registration_link: optionalUrl,
    dates_tbd: z.boolean(),
    accept_moderation: z.literal(true, {
      error: "Debes aceptar la revisión para agregar tu evento",
    }),
  })
  .superRefine((values, ctx) => {
    if (values.format === "virtual" && values.location && !URL_REGEX.test(values.location)) {
      ctx.addIssue({
        code: "custom",
        path: ["location"],
        message: "Ingresa una URL válida",
      })
    }

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

export const createCalendarEventSchema = z.object({
  name: z.string().trim().min(1, "El nombre es requerido"),
  community_id: z.coerce.number().int().positive("Elige una comunidad"),
  start_datetime: z.string().trim().min(1).optional().nullable(),
  end_datetime: z.string().trim().min(1).optional().nullable(),
  format: z.enum(EVENT_FORMATS).optional().nullable(),
  registration_link: optionalUrl.nullable(),
  location: z.string().trim().optional().nullable(),
})

export type CreateCalendarEventInput = z.infer<typeof createCalendarEventSchema>

export const updateCalendarEventSchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
  name: z.string().trim().min(1).optional(),
  community_id: z.coerce.number().int().positive().optional(),
  start_datetime: z.string().trim().min(1).optional().nullable(),
  end_datetime: z.string().trim().min(1).optional().nullable(),
  format: z.enum(EVENT_FORMATS).optional().nullable(),
  registration_link: optionalUrl.nullable(),
  location: z.string().trim().optional().nullable(),
  accepted: z.boolean().optional(),
})

export type UpdateCalendarEventInput = z.infer<typeof updateCalendarEventSchema>

export const deleteCalendarEventSchema = z.object({
  id: z.coerce.number().int().positive("ID requerido"),
})

export type DeleteCalendarEventInput = z.infer<typeof deleteCalendarEventSchema>

export const getCalendarEventsQuerySchema = z.object({
  start: z.string().trim().min(1).optional(),
  end: z.string().trim().min(1).optional(),
  year: z.coerce.number().int().min(2000).max(3000).optional(),
  month: z.coerce.number().int().min(1).max(12).optional(),
})

export type GetCalendarEventsQuery = z.infer<typeof getCalendarEventsQuerySchema>

export const getCommunitiesQuerySchema = z.object({
  name: z.string().trim().min(1).optional(),
})

export type GetCommunitiesQuery = z.infer<typeof getCommunitiesQuerySchema>

export const createCommunitySchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  short_name: z.string().trim().optional().nullable(),
  website: optionalUrl.nullable(),
  contact_email: z.string().trim().email("Ingresa un email válido"),
  image: z.string().trim().optional().nullable(),
  color: z.string().trim().optional().nullable(),
})

export type CreateCommunityInput = z.infer<typeof createCommunitySchema>

export const updateCommunitySchema = z.object({
  id: z.coerce.number().int().positive("ID inválido"),
  name: z.string().trim().min(2).optional(),
  short_name: z.string().trim().optional().nullable(),
  website: optionalUrl.nullable(),
  contact_email: z.string().trim().email("Ingresa un email válido").optional(),
  image: z.string().trim().optional().nullable(),
  color: z.string().trim().optional().nullable(),
  accepted: z.boolean().optional(),
})

export type UpdateCommunityInput = z.infer<typeof updateCommunitySchema>

export const deleteCommunitySchema = z.object({
  id: z.coerce.number().int().positive("ID requerido"),
})

export type DeleteCommunityInput = z.infer<typeof deleteCommunitySchema>

export const newCommunitySchema = z.object({
  name: z.string().trim().min(2, "El nombre debe tener al menos 2 caracteres"),
  short_name: z.string().trim().optional(),
  website: optionalUrl,
  contact_email: z.email("Ingresa un email válido"),
  color: z.string().trim().optional(),
})

export type NewCommunityFormValues = z.infer<typeof newCommunitySchema>
