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

// Default to Bolivian time zone, as it is the one used by the form.
const TIME_ZONE = "America/La_Paz"
const LOCALE = "es-BO"

const dayFormatter = new Intl.DateTimeFormat(LOCALE, { day: "2-digit", timeZone: TIME_ZONE })
const monthFormatter = new Intl.DateTimeFormat(LOCALE, { month: "short", timeZone: TIME_ZONE })
const weekdayFormatter = new Intl.DateTimeFormat(LOCALE, { weekday: "short", timeZone: TIME_ZONE })
const yearFormatter = new Intl.DateTimeFormat(LOCALE, { year: "numeric", timeZone: TIME_ZONE })
const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: TIME_ZONE,
})

// Some ICU builds append a period to abbreviated months and weekdays ("jul.").
const withoutTrailingDot = (value: string) => value.replace(/\.$/, "")

export function formatEventDate(datetime: string) {
  if (!datetime) return { day: "", month: "", weekday: "", time: "" }
  const date = new Date(datetime)

  return {
    day: dayFormatter.format(date),
    month: withoutTrailingDot(monthFormatter.format(date)),
    weekday: withoutTrailingDot(weekdayFormatter.format(date)),
    time: timeFormatter.format(date),
  }
}

/** Builds the "15.ago.2026" date shown in the hero's terminal line. */
export function formatHeroDate(datetime: string) {
  if (!datetime) return "Fecha por definir"

  const date = new Date(datetime)
  const { day, month } = formatEventDate(datetime)
  return `${day}.${month}.${yearFormatter.format(date)}`
}

export function nameToSlug(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_")
}
