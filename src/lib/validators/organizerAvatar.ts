import { z } from "zod"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_IMAGE_TYPES = ["image/webp", "image/png", "image/jpeg", "image/jpg"]

export const organizerAvatarSchema = z.object({
  profile_id: z.string().trim().uuid("El profile_id no es un UUID válido"),
  avatar: z
    .custom<File>(val => typeof File !== "undefined" && val instanceof File, {
      message: "No se envió ninguna imagen de avatar",
    })
    .refine(file => file.size > 0, "El archivo de imagen no puede estar vacío")
    .refine(file => file.size <= MAX_FILE_SIZE, "La imagen no debe superar los 5MB")
    .refine(
      file => ALLOWED_IMAGE_TYPES.includes(file.type),
      "Formato de imagen no soportado. Debe ser WebP, PNG o JPEG"
    ),
})

export type OrganizerAvatarInput = z.infer<typeof organizerAvatarSchema>
