interface CalendarInvite {
  uid: string
  filename: string
  title: string
  start: string
  end: string
  location: string
  description: string
  url: string
}

// Times in UTC (Bolivia is UTC-4 with no DST).
const EVENT_CALENDAR_INVITES: Record<string, CalendarInvite> = {
  "devfest-26": {
    uid: "devfest-26@gdgsucre.com",
    filename: "devfest-sucre-2026.ics",
    title: "DevFest Sucre 2026",
    start: "20261128T120000Z",
    end: "20261128T170000Z",
    location: "Salón Pukara - Centro Cultural La Sombrerería, Sucre, Bolivia",
    description:
      "Muestra el QR de tu credencial al ingresar: https://gdgsucre.com/registro/devfest-26/confirmado\n" +
      "Cómo llegar: https://www.google.com/maps/search/?api=1&query=Centro%20Cultural%20La%20Sombrerer%C3%ADa%2C%20Sucre",
    url: "https://gdgsucre.com/",
  },
}

const ICS_MAX_LINE_BYTES = 75

function escapeIcsText(text: string) {
  return text.replace(/[\\;,]/g, char => `\\${char}`).replace(/\r?\n/g, "\\n")
}

function foldIcsLine(line: string) {
  const encoder = new TextEncoder()
  const lines: string[] = []
  let current = ""
  let size = 0

  for (const char of line) {
    const bytes = encoder.encode(char).length
    if (size + bytes > ICS_MAX_LINE_BYTES) {
      lines.push(current)
      current = " "
      size = 1
    }
    current += char
    size += bytes
  }
  lines.push(current)

  return lines.join("\r\n")
}

function buildCalendarInvite(invite: CalendarInvite) {
  const now = new Date()
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "")

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//GDG Sucre//send-email//ES",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${invite.uid}`,
    `DTSTAMP:${now}`,
    `DTSTART:${invite.start}`,
    `DTEND:${invite.end}`,
    `SUMMARY:${escapeIcsText(invite.title)}`,
    `LOCATION:${escapeIcsText(invite.location)}`,
    `DESCRIPTION:${escapeIcsText(invite.description)}`,
    `URL:${invite.url}`,
    "STATUS:CONFIRMED",
    "END:VEVENT",
    "END:VCALENDAR",
  ]

  return `${lines.map(foldIcsLine).join("\r\n")}\r\n`
}

export function getCalendarInviteAttachment(eventSlug: string) {
  if (!Object.hasOwn(EVENT_CALENDAR_INVITES, eventSlug)) return undefined

  const invite = EVENT_CALENDAR_INVITES[eventSlug]
  const ics = new TextEncoder().encode(buildCalendarInvite(invite))

  return {
    contentType: "text/calendar; method=PUBLISH; charset=UTF-8",
    filename: invite.filename,
    encoding: "base64" as const,
    content: btoa(String.fromCharCode(...ics)),
  }
}
