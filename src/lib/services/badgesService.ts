import type { SupabaseClient } from "@supabase/supabase-js";

export async function getUserAndBadgeIds(
  supabase: SupabaseClient,
  registrationId: number,
  variant: "Participante" | "Organizer" = "Participante",
) {
  const { data: registration, error: registrationError } = await supabase
    .from("registrations")
    .select("user_id, event_id, events(name)")
    .eq("id", registrationId)
    .maybeSingle();

  if (registrationError || !registration) {
    throw new Error(
      `Error fetching registration: ${registrationError?.message}`,
    );
  }

  const { data: badge, error: badgeError } = await supabase
    .from("badges")
    .select("id")
    .eq("name", `${variant} ${registration.events.name}`)
    .maybeSingle();

  if (badgeError || !badge) {
    throw new Error(`Error fetching badge: ${badgeError?.message}`);
  }

  return {
    userId: registration.user_id,
    badgeId: badge.id,
  };
}

export async function getBadges(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("user_badges")
    .select("badges(name, image_url)")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });

  if (error) return null;
  return data.map((badge) => ({
    ...badge.badges,
  }));
}

export async function claimEasterEggBadge(
  supabase: SupabaseClient,
  userId: string,
) {
  const badgeName = "Dino Hacker";
  const defaultImageUrl = "/badges/dino-hacker.svg";

  let { data: badge } = await supabase
    .from("badges")
    .select("id, name, image_url")
    .eq("name", badgeName)
    .maybeSingle();

  if (!badge) {
    const { data: newBadge } = await supabase
      .from("badges")
      .insert([{ name: badgeName, image_url: defaultImageUrl }])
      .select("id, name, image_url")
      .maybeSingle();

    if (newBadge) {
      badge = newBadge;
    }
  }

  if (badge) {
    const { error: userBadgeError } = await supabase
      .from("user_badges")
      .upsert(
        { badge_id: badge.id, user_id: userId },
        { onConflict: "badge_id,user_id" },
      );

    if (userBadgeError) {
      console.warn(
        "Could not insert user_badge in database:",
        userBadgeError.message,
      );
    }
  }

  return {
    name: badgeName,
    image_url: badge?.image_url || defaultImageUrl,
  };
}
