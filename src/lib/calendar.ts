/**
 * Shape returned by `GET /api/calendar-events/upcoming`, matching the embedded
 * `communities` join already used by `getCalendarEvents`.
 */
export interface UpcomingCalendarEvent {
  id: number
  name: string
  start_datetime: string
  end_datetime: string
  format: string | null
  registration_link: string | null
  location: string | null
  communities: {
    id: number
    name: string
    short_name: string | null
    image: string | null
  } | null
}

// `start_datetime` is a timestamptz, but the publish form sends the value with
// no offset (see SendEvent.tsx), so Postgres stores it as UTC. Formatting back
// in UTC therefore renders the same wall-clock time the community typed in.
// Switch this to "America/La_Paz" only once the POST starts sending the offset.
const TIME_ZONE = "UTC"
const LOCALE = "es-BO"

const dayFormatter = new Intl.DateTimeFormat(LOCALE, { day: "2-digit", timeZone: TIME_ZONE })
const monthFormatter = new Intl.DateTimeFormat(LOCALE, { month: "short", timeZone: TIME_ZONE })
const weekdayFormatter = new Intl.DateTimeFormat(LOCALE, { weekday: "short", timeZone: TIME_ZONE })
const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
})

// Some ICU builds append a period to abbreviated months and weekdays ("jul.").
const withoutTrailingDot = (value: string) => value.replace(/\.$/, "")

export function formatEventDate(datetime: string) {
  const date = new Date(datetime)

  return {
    day: dayFormatter.format(date),
    month: withoutTrailingDot(monthFormatter.format(date)),
    weekday: withoutTrailingDot(weekdayFormatter.format(date)),
    time: timeFormatter.format(date),
  }
}

/** Builds the "jul—ago · 04" summary shown next to the section title. */
export function formatRangeLabel(events: UpcomingCalendarEvent[]) {
  const count = String(events.length).padStart(2, "0")

  if (events.length === 0) return count

  const first = formatEventDate(events[0].start_datetime).month
  const last = formatEventDate(events[events.length - 1].start_datetime).month
  const range = first === last ? first : `${first}—${last}`

  return `${range} · ${count}`
}
