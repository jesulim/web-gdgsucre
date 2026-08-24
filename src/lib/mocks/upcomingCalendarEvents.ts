import type { UpcomingCalendarEvent } from "@/lib/calendar"

// TEMPORARY SCAFFOLDING — delete this file once `GET /api/calendar-events/upcoming`
// exists. NextEvents only falls back to it while running `astro dev`, so the
// agenda can be reviewed against the design before the endpoint lands.

const SAMPLE = [
  { name: "DevFest Sucre", community: "gdg sucre", location: "Hub USFX", hour: 9, inDays: 3 },
  { name: "Flutter Lab", community: "flutter sucre", location: "Online", hour: 19, inDays: 10 },
  { name: "Data Night", community: "python sucre", location: "Café Capital", hour: 20, inDays: 17 },
  { name: "UX Sprint", community: "ladies that ux", location: "Hub USFX", hour: 10, inDays: 24 },
]

// Dates are derived from today so the list always reads as genuinely upcoming
// instead of going stale, and are built in UTC to match how the real rows are
// stored and formatted (see the TIME_ZONE note in src/lib/calendar.ts).
function isoAt(inDays: number, hour: number) {
  const date = new Date()
  date.setUTCDate(date.getUTCDate() + inDays)
  date.setUTCHours(hour, 0, 0, 0)
  return date.toISOString()
}

export function getMockUpcomingEvents(limit: number): UpcomingCalendarEvent[] {
  return SAMPLE.slice(0, limit).map((sample, index) => ({
    id: index + 1,
    name: sample.name,
    start_datetime: isoAt(sample.inDays, sample.hour),
    end_datetime: isoAt(sample.inDays, sample.hour + 2),
    format: sample.location === "Online" ? "virtual" : "in-person",
    registration_link: null,
    location: sample.location,
    communities: {
      id: index + 1,
      name: sample.community,
      short_name: sample.community,
      image: null,
    },
  }))
}
