import { eq } from "drizzle-orm"

import { db } from "@/db/client"
import { calendarEvents } from "@/db/schema"
import type {
  CreateCalendarEventInput,
  UpdateCalendarEventInput,
} from "@/lib/validators/calendarEvent"

interface MappableCalendarEvent {
  id: number
  createdAt: string
  updatedAt?: string
  name: string
  communityId: number
  startDatetime: string | null
  endDatetime: string | null
  format: string | null
  registrationLink: string | null
  location: string | null
  accepted: boolean
  community?: {
    id: number
    name: string
    shortName: string | null
    color: string | null
    image?: string | null
    contactEmail?: string
  } | null
}

function mapCalendarEvent(event: MappableCalendarEvent) {
  return {
    id: event.id,
    created_at: event.createdAt,
    name: event.name,
    community_id: event.communityId,
    start_datetime: event.startDatetime,
    end_datetime: event.endDatetime,
    format: event.format,
    registration_link: event.registrationLink,
    location: event.location,
    accepted: event.accepted,
    communities: event.community
      ? {
          id: event.community.id,
          name: event.community.name,
          short_name: event.community.shortName,
          color: event.community.color,
          image: event.community.image,
          contact_email: event.community.contactEmail,
        }
      : null,
  }
}

export async function getCalendarEvents(start: string, end: string) {
  const events = await db.query.calendarEvents.findMany({
    where: {
      accepted: true,
      startDatetime: { gte: start, lte: end },
    },
    orderBy: { startDatetime: "asc" },
    with: {
      community: {
        columns: {
          id: true,
          name: true,
          shortName: true,
          color: true,
        },
      },
    },
  })

  return events.map(mapCalendarEvent)
}

export async function getUpcomingCalendarEvents(limit = 4) {
  const nowInBolivia = new Date(Date.now() - 4 * 60 * 60 * 1000)

  const events = await db.query.calendarEvents.findMany({
    where: {
      accepted: true,
      OR: [
        { endDatetime: { gte: nowInBolivia.toISOString() } },
        { startDatetime: { isNull: true } },
      ],
    },
    orderBy: {
      startDatetime: "asc",
    },
    limit,
    with: {
      community: {
        columns: {
          id: true,
          name: true,
          shortName: true,
          image: true,
          color: true,
        },
      },
    },
  })

  return events.map(mapCalendarEvent)
}

export async function getAllCalendarEvents() {
  const events = await db.query.calendarEvents.findMany({
    orderBy: (eventsTable, { desc }) => [desc(eventsTable.createdAt)],
    with: {
      community: {
        columns: {
          id: true,
          name: true,
          shortName: true,
          contactEmail: true,
          image: true,
          color: true,
        },
      },
    },
  })

  return events.map(mapCalendarEvent)
}

export async function createCalendarEvent(event: CreateCalendarEventInput): Promise<number | null> {
  try {
    const [inserted] = await db
      .insert(calendarEvents)
      .values({
        name: event.name,
        communityId: event.community_id,
        startDatetime: event.start_datetime ?? null,
        endDatetime: event.end_datetime ?? null,
        format: event.format ?? null,
        registrationLink: event.registration_link || null,
        location: event.location ?? null,
        accepted: false,
      })
      .returning({ id: calendarEvents.id })

    return inserted?.id ?? null
  } catch (error) {
    console.error("error creating calendar event:", error)
    return null
  }
}

export async function updateCalendarEvent(id: number, event: Omit<UpdateCalendarEventInput, "id">) {
  const values: Partial<typeof calendarEvents.$inferInsert> = {}
  if (event.name !== undefined) values.name = event.name
  if (event.community_id !== undefined) values.communityId = event.community_id
  if (event.start_datetime !== undefined) values.startDatetime = event.start_datetime
  if (event.end_datetime !== undefined) values.endDatetime = event.end_datetime
  if (event.format !== undefined) values.format = event.format
  if (event.registration_link !== undefined)
    values.registrationLink = event.registration_link || null
  if (event.location !== undefined) values.location = event.location
  if (event.accepted !== undefined) values.accepted = event.accepted

  try {
    const updated = await db
      .update(calendarEvents)
      .set(values)
      .where(eq(calendarEvents.id, id))
      .returning()

    if (updated.length === 0) return null

    return updated.map(row => ({
      id: row.id,
      created_at: row.createdAt,
      updated_at: row.updatedAt,
      name: row.name,
      community_id: row.communityId,
      start_datetime: row.startDatetime,
      end_datetime: row.endDatetime,
      format: row.format,
      registration_link: row.registrationLink,
      location: row.location,
      accepted: row.accepted,
    }))
  } catch (error) {
    console.error("error updating calendar event:", error)
    return null
  }
}

export async function deleteCalendarEvent(id: number): Promise<boolean> {
  try {
    const deleted = await db
      .delete(calendarEvents)
      .where(eq(calendarEvents.id, id))
      .returning({ id: calendarEvents.id })

    return deleted.length > 0
  } catch (error) {
    console.error("error deleting calendar event:", error)
    return false
  }
}
