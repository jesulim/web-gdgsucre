import type { RaffleParticipant } from "@/lib/services/raffleService"

export type EventOption = { slug: string; name: string }
export type Selection = {
  eventSlug: string
  role: string
  packageName: string
  paymentConfirmed: boolean
}
export type RoundEntry = { person: RaffleParticipant; outcome: "confirmed" | "excluded" }

export function participantName(person: RaffleParticipant) {
  return `${person.first_name} ${person.last_name}`.trim() || `Inscripción ${person.id}`
}

export function participantPackage(person: RaffleParticipant) {
  const name = person.package?.trim()
  return !name || name.toLocaleLowerCase("es").startsWith("sin paquete") ? "Sin paquete" : name
}
