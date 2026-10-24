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

export const DINO_HACKER_BADGE_NAME = "Dino Hacker";
export const DINO_HACKER_STORAGE_PATH = "badges/dino-hacker.svg";

export function getBadgeImageUrl(
  supabase: SupabaseClient,
  imageUrl: string | null | undefined,
): string {
  if (!imageUrl) return "";
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const cleanPath = imageUrl.startsWith("/") ? imageUrl.slice(1) : imageUrl;
  const path = cleanPath.startsWith("badges/")
    ? cleanPath
    : `badges/${cleanPath}`;
  return supabase.storage.from("assets").getPublicUrl(path).data.publicUrl;
}

export async function getBadges(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("user_badges")
    .select("badges(name, image_url)")
    .eq("user_id", userId)
    .order("issued_at", { ascending: false });

  if (error || !data) return null;
  return data
    .map((badge) => {
      const b = badge.badges as unknown as {
        name: string;
        image_url: string;
      } | null;
      if (!b) return null;
      return {
        ...b,
        image_url: getBadgeImageUrl(supabase, b.image_url),
      };
    })
    .filter((b): b is { name: string; image_url: string } => b !== null);
}

export async function claimEasterEggBadge(
  supabase: SupabaseClient,
  userId: string,
) {
  const badgeName = DINO_HACKER_BADGE_NAME;
  const defaultImageUrl = getBadgeImageUrl(supabase, DINO_HACKER_STORAGE_PATH);

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
  } else if (
    badge.image_url === "/badges/dino-hacker.svg" ||
    !badge.image_url?.startsWith("http")
  ) {
    await supabase
      .from("badges")
      .update({ image_url: defaultImageUrl })
      .eq("id", badge.id);
    badge.image_url = defaultImageUrl;
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
