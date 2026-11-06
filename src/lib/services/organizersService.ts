import type { SupabaseClient } from "@supabase/supabase-js"
import { getProfileByEmail } from "./profileService"

const capitalizeName = (name: string) => {
  if (!name) return ""
  return name
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ")
}

export interface PublicOrganizer {
  id: number
  image: string | null
  first_name: string
  last_name: string
}

export interface OrganizerResult extends PublicOrganizer {
  profile_id: string
  email: string | null
  phone_number: string | null
}

export interface SearchedUser {
  id: string
  email: string
  first_name: string
  last_name: string
  phone_number: string
  avatar_url: string | null
}

export interface AddOrganizerParams {
  email: string
  eventSlug: string
  first_name?: string
  last_name?: string
  phone_number?: string
}

type OrganizerMutationResult =
  | { success: true; data?: unknown }
  | { success: false; reason: string; message?: string }

export async function getOrganizers(
  supabase: SupabaseClient,
  eventSlug: string
): Promise<PublicOrganizer[] | null> {
  const { data, error } = await supabase
    .from("organizers")
    .select(
      "id, profile_id, profiles!inner (first_name, last_name, avatar_url), events!inner(slug)"
    )
    .eq("events.slug", eventSlug)

  if (error) {
    console.error("Error fetching organizers", error)
    return null
  }

  return data.map(organizer => {
    const profile = Array.isArray(organizer.profiles) ? organizer.profiles[0] : organizer.profiles
    return {
      id: organizer.id,
      image: profile?.avatar_url ?? null,
      first_name: capitalizeName(profile?.first_name ?? ""),
      last_name: capitalizeName(profile?.last_name ?? ""),
    }
  })
}

export async function getOrganizersForAdmin(
  supabase: SupabaseClient,
  eventSlug: string
): Promise<OrganizerResult[] | null> {
  const { data, error } = await supabase
    .from("organizers")
    .select(
      "id, profile_id, profiles!inner (id, first_name, last_name, avatar_url, email, phone_number), events!inner(slug)"
    )
    .eq("events.slug", eventSlug)

  if (error) {
    console.error("Error fetching organizers", error)
    return null
  }

  return data.map(organizer => {
    const profile = Array.isArray(organizer.profiles) ? organizer.profiles[0] : organizer.profiles
    return {
      id: organizer.id,
      profile_id: organizer.profile_id ?? profile?.id,
      image: profile?.avatar_url ?? null,
      first_name: capitalizeName(profile?.first_name ?? ""),
      last_name: capitalizeName(profile?.last_name ?? ""),
      email: profile?.email ?? null,
      phone_number: profile?.phone_number ?? null,
    }
  })
}

export async function searchUserByEmail(
  supabase: SupabaseClient,
  email: string
): Promise<{ source: "profiles" | "auth"; user: SearchedUser } | null> {
  const profile = await getProfileByEmail(supabase, email)
  if (profile) {
    return {
      source: "profiles",
      user: {
        id: profile.id,
        email: profile.email || email,
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone_number: profile.phone_number || "",
        avatar_url: profile.avatar_url || null,
      },
    }
  }

  const { data: authUser, error: rpcError } = await supabase.rpc("get_user_by_email", {
    p_email: email,
  })

  if (rpcError) {
    console.error("Error searching auth user by email via RPC", rpcError)
  }

  if (authUser?.id) {
    const meta = authUser.raw_user_meta_data || {}
    const fullName: string = meta.full_name || meta.name || ""
    let firstName = meta.first_name || ""
    let lastName = meta.last_name || ""
    if (!firstName && fullName) {
      const parts = fullName.trim().split(" ")
      firstName = parts[0] || ""
      lastName = parts.slice(1).join(" ")
    }

    return {
      source: "auth",
      user: {
        id: authUser.id,
        email: authUser.email || email,
        first_name: firstName,
        last_name: lastName,
        phone_number: meta.phone_number || meta.phone || "",
        avatar_url: meta.avatar_url || null,
      },
    }
  }

  return null
}

export async function addOrganizer(
  supabase: SupabaseClient,
  params: AddOrganizerParams
): Promise<OrganizerMutationResult> {
  const { email, eventSlug, first_name, last_name, phone_number } = params

  const { data: eventData, error: eventError } = await supabase
    .from("events")
    .select("id")
    .eq("slug", eventSlug)
    .maybeSingle()

  if (eventError || !eventData) {
    console.error("Error fetching event ID", eventError)
    return {
      success: false,
      reason: "event_not_found",
      message: "Evento no encontrado",
    }
  }

  const eventId = eventData.id

  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  let targetProfileId = existingProfile?.id

  // If there's no profile, get auth data.
  if (!targetProfileId) {
    const { data: authUser, error: rpcError } = await supabase.rpc("get_user_by_email", {
      p_email: email,
    })

    if (rpcError) {
      console.error("Error looking up auth user by email", rpcError)
      return {
        success: false,
        reason: "lookup_failed",
        message: "No se pudo verificar el usuario",
      }
    }

    if (!authUser?.id) {
      return {
        success: false,
        reason: "user_not_found",
        message: "Usuario no registrado en la plataforma. Debe registrarse primero.",
      }
    }

    targetProfileId = authUser.id
    const meta = authUser.raw_user_meta_data || {}
    const { error: insertProfileError } = await supabase.from("profiles").insert({
      id: targetProfileId,
      email: authUser.email || email,
      first_name: first_name || meta.first_name || "",
      last_name: last_name || meta.last_name || "",
      phone_number: phone_number || meta.phone_number || null,
      avatar_url: meta.avatar_url || null,
    })

    if (insertProfileError) {
      console.error("Error creating profile for organizer", insertProfileError)
      return {
        success: false,
        reason: "profile_creation_failed",
        message: insertProfileError.message,
      }
    }
  }

  const { data: existingOrganizer, error: checkOrganizerError } = await supabase
    .from("organizers")
    .select("id")
    .eq("profile_id", targetProfileId)
    .eq("event_id", eventId)
    .maybeSingle()

  if (checkOrganizerError) {
    console.error("Error checking existing organizer", checkOrganizerError)
  }

  if (existingOrganizer) {
    return {
      success: false,
      reason: "already_organizer",
      message: "El usuario ya es un organizador de este evento",
    }
  }

  // Only write the fields the caller sent, so adding an organizer never blanks a profile.
  if (existingProfile) {
    const profileUpdates: {
      first_name?: string
      last_name?: string
      phone_number?: string
    } = {}
    if (first_name) profileUpdates.first_name = first_name
    if (last_name) profileUpdates.last_name = last_name
    if (phone_number) profileUpdates.phone_number = phone_number

    if (Object.keys(profileUpdates).length > 0) {
      const { error: updateError } = await supabase
        .from("profiles")
        .update(profileUpdates)
        .eq("id", targetProfileId)

      if (updateError) {
        console.error("Error updating profile for organizer", updateError)
        return {
          success: false,
          reason: "profile_update_failed",
          message: updateError.message,
        }
      }
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from("organizers")
    .insert({
      profile_id: targetProfileId,
      event_id: eventId,
    })
    .select()
    .single()

  if (insertError) {
    console.error("Error inserting organizer", insertError)
    return {
      success: false,
      reason: "insert_failed",
      message: insertError.message,
    }
  }

  return { success: true, data: inserted }
}

export async function removeOrganizerById(
  supabase: SupabaseClient,
  organizerId: number
): Promise<boolean> {
  const { error } = await supabase.from("organizers").delete().eq("id", organizerId)
  if (error) {
    console.error("Error deleting organizer by id", error)
    return false
  }
  return true
}

export async function toggleOrganizerByRegistration(
  supabase: SupabaseClient,
  registrationId: string | number,
  action: "add" | "remove"
): Promise<OrganizerMutationResult> {
  const { data: registration, error } = await supabase
    .from("registrations")
    .select("user_id, event_id")
    .eq("id", registrationId)
    .maybeSingle()

  if (error || !registration) {
    return {
      success: false,
      reason: "registration_not_found",
      message: error?.message,
    }
  }

  if (action === "add") {
    const { error: organizerError } = await supabase.from("organizers").upsert(
      {
        profile_id: registration.user_id,
        event_id: registration.event_id,
      },
      { onConflict: "profile_id,event_id" }
    )

    if (organizerError) {
      return {
        success: false,
        reason: "insert_failed",
        message: organizerError.message,
      }
    }
    return { success: true }
  }

  const { error: organizerError } = await supabase
    .from("organizers")
    .delete()
    .eq("profile_id", registration.user_id)
    .eq("event_id", registration.event_id)

  if (organizerError) {
    return {
      success: false,
      reason: "delete_failed",
      message: organizerError.message,
    }
  }
  return { success: true }
}
