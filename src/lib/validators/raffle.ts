import { z } from "zod"

export const RaffleFiltersSchema = z.object({
  eventSlug: z.string().trim().min(1).max(200),
  paymentConfirmed: z
    .enum(["true", "false"])
    .default("false")
    .transform(value => value === "true"),
  role: z.enum(["Participante", "Organizer"]).optional(),
})

export type RaffleFilters = z.infer<typeof RaffleFiltersSchema>
