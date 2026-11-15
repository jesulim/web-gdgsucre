import type { SupabaseClient } from "@supabase/supabase-js"
import type { RaffleFilters } from "@/lib/validators/raffle"

export interface RaffleParticipant {
  id: number
  first_name: string
  last_name: string
  role: "Participante" | "Organizer"
  status: string
  package: string | null
  created_at: string
}

export async function fetchRaffleEvents(supabase: SupabaseClient, allowedSlugs?: string[]) {
  if (allowedSlugs?.length === 0) return []
  let query = supabase.from("events").select("slug, name").order("date", { ascending: false })
  if (allowedSlugs) query = query.in("slug", allowedSlugs)
  const { data, error } = await query
  if (error) throw new Error("No se pudieron obtener los eventos")
  return data ?? []
}

/** Uses the existing manual payment-confirmation signal, excluding exempt/no-package entries.
 * sendPaymentConfirmation -> confirmRegistration sets status="confirmed".
 * This is not an independent bank/payment-provider verification.
 */
export function hasConfirmedRafflePayment(
  status: string,
  value: unknown,
  exemptOption?: string | null
) {
  if (status !== "confirmed" || typeof value !== "string") return false
  const normalized = value.trim().toLocaleLowerCase("es")
  return (
    Boolean(normalized) &&
    !normalized.startsWith("sin paquete") &&
    normalized !== exemptOption?.trim().toLocaleLowerCase("es")
  )
}

export async function getRaffleParticipants(supabase: SupabaseClient, filters: RaffleFilters) {
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("slug", filters.eventSlug)
    .maybeSingle()
  if (eventError) throw new Error("No se pudo consultar el evento")
  if (!event) return null

  const { data: packageField, error: packageError } = await supabase
    .from("event_form_fields")
    .select("exempt_option")
    .eq("event_id", event.id)
    .eq("name", "package")
    .maybeSingle()
  if (packageError) throw new Error("No se pudo consultar la configuración del paquete")

  const organizerIds = new Set<string>()
  // Small pages also work with installations configured below Supabase's default 1,000-row cap.
  const pageSize = 100
  for (let offset = 0; ; offset += pageSize) {
    const { data, error } = await supabase
      .from("organizers")
      .select("id, profile_id")
      .eq("event_id", event.id)
      .order("id")
      .range(offset, offset + pageSize - 1)
    if (error) throw new Error("No se pudieron consultar los organizadores")
    for (const row of data ?? []) organizerIds.add(row.profile_id)
    if (!data || data.length < pageSize) break
  }

  const participants: RaffleParticipant[] = []
  const seenUsers = new Set<string>()
  for (let offset = 0; ; offset += pageSize) {
    let query = supabase
      .from("registrations")
      .select(
        "id, user_id, status, created_at, package:responses->>package, profiles(first_name, last_name)"
      )
      .eq("event_id", event.id)
      .order("id")
      .range(offset, offset + pageSize - 1)
    if (filters.paymentConfirmed) query = query.eq("status", "confirmed")
    const { data, error } = await query
    if (error) throw new Error("No se pudieron consultar los participantes")
    for (const row of data ?? []) {
      const role = organizerIds.has(row.user_id) ? "Organizer" : "Participante"
      if (filters.role && filters.role !== role) continue
      if (
        filters.paymentConfirmed &&
        !hasConfirmedRafflePayment(row.status, row.package, packageField?.exempt_option)
      )
        continue
      if (seenUsers.has(row.user_id)) continue
      // A profile hidden by RLS must not become a blank entry in the draw.
      const profile = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles
      if (!profile) continue
      seenUsers.add(row.user_id)
      participants.push({
        id: row.id,
        first_name: profile.first_name ?? "",
        last_name: profile.last_name ?? "",
        role,
        status: row.status,
        package: typeof row.package === "string" ? row.package : null,
        created_at: row.created_at,
      })
    }
    if (!data || data.length < pageSize) break
  }
  return participants
}
