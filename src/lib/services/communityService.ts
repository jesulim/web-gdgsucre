import { and, count, desc, eq, ilike, or } from "drizzle-orm"

import { db } from "@/db/client"
import { calendarEvents, communities } from "@/db/schema"
import type { CreateCommunityInput, UpdateCommunityInput } from "@/lib/validators/calendarEvent"

export async function getCommunities(name?: string) {
  const rows = await db
    .select({
      id: communities.id,
      created_at: communities.createdAt,
      name: communities.name,
      short_name: communities.shortName,
      website: communities.website,
      contact_email: communities.contactEmail,
      color: communities.color,
      accepted: communities.accepted,
    })
    .from(communities)
    .where(
      name
        ? or(ilike(communities.name, `%${name}%`), ilike(communities.shortName, `%${name}%`))
        : undefined
    )
    .orderBy(desc(communities.createdAt))

  return rows
}

export async function createCommunity(community: CreateCommunityInput) {
  const [inserted] = await db
    .insert(communities)
    .values({
      name: community.name,
      shortName: community.short_name,
      website: community.website,
      contactEmail: community.contact_email,
      image: community.image,
      color: community.color,
    })
    .returning({ id: communities.id })

  return inserted?.id ?? null
}

export async function updateCommunity(id: number, community: Omit<UpdateCommunityInput, "id">) {
  const values: Partial<typeof communities.$inferInsert> = {}
  if (community.name !== undefined) values.name = community.name
  if (community.short_name !== undefined) values.shortName = community.short_name
  if (community.website !== undefined) values.website = community.website
  if (community.contact_email !== undefined) values.contactEmail = community.contact_email
  if (community.image !== undefined) values.image = community.image
  if (community.color !== undefined) values.color = community.color
  if (community.accepted !== undefined) values.accepted = community.accepted

  try {
    const updated = await db
      .update(communities)
      .set(values)
      .where(eq(communities.id, id))
      .returning()

    if (updated.length === 0) return null

    return updated.map(row => ({
      id: row.id,
      created_at: row.createdAt,
      name: row.name,
      short_name: row.shortName,
      website: row.website,
      contact_email: row.contactEmail,
      image: row.image,
      color: row.color,
      accepted: row.accepted,
    }))
  } catch (error) {
    console.error("error updating community:", error)
    return null
  }
}

export async function deleteCommunity(id: number) {
  try {
    const deleted = await db
      .delete(communities)
      .where(eq(communities.id, id))
      .returning({ id: communities.id })

    return deleted.length > 0
  } catch (error) {
    console.error("error deleting community:", error)
    return false
  }
}

export async function acceptCommunityOnFirstEvent(event_id: number) {
  const event = await db.query.calendarEvents.findFirst({
    where: { id: event_id },
    with: { community: { columns: { id: true, accepted: true } } },
  })

  if (!event?.community) {
    console.error(`Error getting community for event ${event_id}`)
    return false
  }

  if (event.community.accepted) return

  try {
    await db
      .update(communities)
      .set({ accepted: true })
      .where(eq(communities.id, event.community.id))
  } catch (error) {
    console.error("Error updating community:", error)
  }
}

export interface CommunityWithCount {
  id: number
  name: string
  short_name: string | null
  website: string | null
  color: string | null
  event_count: number
}

export async function getCommunitiesWithEventCount(): Promise<CommunityWithCount[]> {
  const rows = await db
    .select({
      id: communities.id,
      name: communities.name,
      short_name: communities.shortName,
      website: communities.website,
      color: communities.color,
      event_count: count(calendarEvents.id),
    })
    .from(communities)
    .leftJoin(
      calendarEvents,
      and(eq(calendarEvents.communityId, communities.id), eq(calendarEvents.accepted, true))
    )
    .where(eq(communities.accepted, true))
    .groupBy(communities.id)
    .orderBy(communities.name)

  return rows
}
