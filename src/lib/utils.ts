import type { AstroCookies } from "astro"
import { type ClassValue, clsx } from "clsx"
import { customAlphabet } from "nanoid"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function setSupabaseCookies(
  cookies: AstroCookies,
  access_token: string,
  refresh_token: string,
  expires_in: number
) {
  cookies.set("sb-access-token", access_token, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: expires_in,
  })

  cookies.set("sb-refresh-token", refresh_token, {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // seven days
  })
}

export function deleteSupabaseCookies(cookies: AstroCookies) {
  const options = {
    path: "/",
    httpOnly: true,
    secure: import.meta.env.PROD,
    sameSite: "lax" as const,
  }
  cookies.delete("sb-access-token", options)
  cookies.delete("sb-refresh-token", options)
}

const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 6)

export { nanoid as customAlphabetNanoid }
