import { z } from "zod"

export const suggestionSchema = z.object({
  subject: z
    .string()
    .trim()
    .min(3, "El asunto debe tener al menos 3 caracteres")
    .max(120, "El asunto no puede superar los 120 caracteres"),
  message: z
    .string()
    .trim()
    .min(10, "El mensaje debe tener al menos 10 caracteres")
    .max(1000, "El mensaje no puede superar los 1000 caracteres"),
})

export type SuggestionInput = z.infer<typeof suggestionSchema>
