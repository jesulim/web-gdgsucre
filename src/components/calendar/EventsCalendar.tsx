import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import clsx from "clsx"
import { ChevronLeftIcon, ChevronRightIcon, Loader2Icon } from "lucide-react"
import { useCallback, useMemo, useState } from "react"

const fmt = (date: Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("es", opts).format(date)

const fullMonth = (date: Date) => fmt(date, { month: "long" })
const dayNumber = (date: Date) => fmt(date, { day: "2-digit" })
const weekdayLong = (date: Date) => fmt(date, { weekday: "long" })
const timeStr = (date: Date) => fmt(date, { hour: "2-digit", minute: "2-digit", hour12: false })

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate()

const sameMonth = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth()

const today = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

function buildGrid(date: Date): Date[] {
  const first = new Date(date.getFullYear(), date.getMonth(), 1)
  const start = new Date(first)
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7))
  const current = new Date(start)

  const last = new Date(date.getFullYear(), date.getMonth() + 1, 0)
  const end = new Date(last)
  const endWeekDay = end.getDay()
  if (endWeekDay !== 0) {
    end.setDate(end.getDate() + (7 - endWeekDay))
  }

  const days: Date[] = []
  while (current <= end) {
    days.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }

  return days
}

const ACCENT_COLORS = ["bg-blue-500", "bg-red-500", "bg-yellow-500", "bg-green-500"] as const

function colorForCommunity(id: number | null | undefined) {
  if (id == null) return ACCENT_COLORS[3]
  return ACCENT_COLORS[id % ACCENT_COLORS.length]
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1)
}

interface CalendarEventPayload {
  id: number
  name: string
  community_id: number
  start_datetime: string
  end_datetime: string
  location?: string
  registration_link?: string
  communities: { id: number; name: string; short_name: string | null } | null
}

interface CalendarEvent {
  id: number
  name: string
  start: Date
  end: Date
  community_id: number
  community: string
  location?: string
  registration_link?: string
}
function transformEvent(raw: CalendarEventPayload): CalendarEvent {
  return {
    ...raw,
    start: new Date(raw.start_datetime),
    end: new Date(raw.end_datetime),
    community: raw.communities?.short_name ?? raw.communities?.name ?? "",
  }
}

const queryClient = new QueryClient()

function useCalendarEvents(start: string, end: string) {
  return useQuery<CalendarEvent[]>({
    queryKey: ["calendar-events", start, end],
    queryFn: async () => {
      const res = await fetch(`/api/calendar-events?start=${start}&end=${end}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return ((await res.json()) as CalendarEventPayload[]).map(transformEvent)
    },
  })
}

function DayDetailPanel({ date, events }: { date: Date; events: CalendarEvent[] }) {
  const dayEvents = events.filter(e => sameDay(e.start, date))

  return (
    <div className="border border-white bg-black p-4 sm:p-8 text-white">
      <div className="flex items-center gap-4 pb-4">
        <span className="text-3xl sm:text-5xl leading-none font-bold">{dayNumber(date)}</span>
        <div className="flex flex-col text-sm">
          <span>{weekdayLong(date)}</span>
          <span className="text-muted-foreground">
            {fullMonth(date)} {date.getFullYear()}
          </span>
        </div>
      </div>

      <hr className="border-white pb-4" />

      <div className="flex flex-col gap-3">
        {dayEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin eventos para este día.</p>
        ) : (
          dayEvents.map(event => (
            <div key={event.id} className="flex gap-4 text-white">
              <div className={clsx("w-2 min-h-full mb-1", colorForCommunity(event.community_id))} />
              <div className="flex flex-col gap-1">
                <h3 className="text-lg leading-tight font-bold">{event.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {timeStr(event.start)} · {event.location} · {event.community}
                </p>
                {event.registration_link && (
                  <a
                    href={event.registration_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:underline"
                  >
                    Regístrate
                  </a>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

interface DayCellProps {
  day: Date
  todayDate: Date
  currentDate: Date
  selectedDate: Date
  setSelectedDate: (date: Date) => void
  dayEvents: CalendarEvent[]
}

function DayCell({
  day,
  todayDate,
  currentDate,
  selectedDate,
  setSelectedDate,
  dayEvents,
}: DayCellProps) {
  const inMonth = sameMonth(day, currentDate)
  const isToday = sameDay(day, todayDate)
  const isSelected = sameDay(day, selectedDate)

  return (
    <button
      type="button"
      onClick={() => setSelectedDate(day)}
      className={`
        flex flex-col items-center border border-white
        transition-colors cursor-pointer w-full p-1
        sm:min-h-16 min-h-12
        ${isToday ? "bg-red-500" : isSelected ? "bg-white/30" : "hover:bg-white/10"}
        ${!inMonth ? "text-muted-foreground" : ""}
      `}
    >
      <span className="text-xs sm:text-sm md:text-base">{dayNumber(day)}</span>

      {dayEvents.length > 0 && (
        <div className="mt-auto justify-center w-full flex gap-0.5">
          {dayEvents.slice(0, 4).map(event => (
            <span
              key={event.id}
              className={clsx(
                "min-w-2 min-h-2 text-xs text-black line-clamp-1 text-ellipsis",

                colorForCommunity(event.community_id)
              )}
            >
              <span className="hidden sm:inline mx-0.5">{event.name}</span>
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

const weekdays = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"]

function EventsCalendarInner() {
  const [currentDate, setCurrentDate] = useState(today)
  const [selectedDate, setSelectedDate] = useState(today)

  const grid = useMemo(() => buildGrid(currentDate), [currentDate])

  const gridStart = useMemo(() => {
    const d = new Date(grid[0])
    d.setUTCHours(0, 0, 0, 0)
    return d.toISOString()
  }, [grid])

  const gridEnd = useMemo(() => {
    const d = new Date(grid[grid.length - 1])
    d.setUTCHours(23, 59, 59, 999)
    return d.toISOString()
  }, [grid])

  const { data: events = [], isLoading } = useCalendarEvents(gridStart, gridEnd)

  const todayDate = useMemo(() => today(), [])

  const eventsByDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const event of events) {
      const key = `${event.start.getFullYear()}-${event.start.getMonth()}-${event.start.getDate()}`
      const list = map.get(key)
      if (list) list.push(event)
      else map.set(key, [event])
    }
    return map
  }, [events])

  const monthEvents = useMemo(
    () => events.filter(e => sameMonth(e.start, currentDate)),
    [events, currentDate]
  )

  const communities = useMemo(() => {
    const seen = new Map<number, string>()
    for (const e of monthEvents) {
      if (!seen.has(e.community_id)) seen.set(e.community_id, e.community)
    }
    return [...seen.entries()].map(([id, label]) => ({ id, label }))
  }, [monthEvents])

  const navigate = useCallback((offset: number) => {
    setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + offset, 1))
  }, [])

  return (
    <section className="mx-auto max-w-6xl px-4 pt-16 font-monospace text-white lg:pt-24">
      <p className="text-xs uppercase pb-8">[ 04 · calendario ]</p>
      <div className="grid gap-8 lg:grid-cols-[1fr_1.5fr] lg:items-start lg:gap-16">
        <section className="flex flex-col gap-6 order-1 lg:order-0">
          <DayDetailPanel date={selectedDate} events={events} />
        </section>

        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <button
              type="button"
              aria-label="Mes anterior"
              className="flex size-10 items-center justify-center border border-white transition-colors hover:bg-red-500/50"
              onClick={() => navigate(-1)}
            >
              <ChevronLeftIcon className="size-5" />
            </button>

            <span className="flex gap-4 text-base font-medium">
              {capitalize(fullMonth(currentDate))} {currentDate.getFullYear()}
              <span className="flex items-center gap-2 text-muted-foreground font-normal">
                {isLoading ? <Loader2Icon className="size-4 animate-spin" /> : monthEvents.length}{" "}
                eventos
              </span>
            </span>

            <div className="flex items-center gap-2">
              <button
                type="button"
                aria-label="Mes siguiente"
                className="flex size-10 items-center justify-center border border-white transition-colors hover:bg-red-500/50"
                onClick={() => navigate(1)}
              >
                <ChevronRightIcon className="size-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 border border-white">
            {weekdays.map(day => (
              <div key={day} className="flex justify-center border border-white py-2">
                {day}
              </div>
            ))}

            {grid.map(day => {
              const dayKey = `${day.getFullYear()}-${day.getMonth()}-${day.getDate()}`
              const dayEvents = eventsByDay.get(dayKey) ?? []

              return (
                <DayCell
                  key={day.toISOString()}
                  day={day}
                  todayDate={todayDate}
                  currentDate={currentDate}
                  selectedDate={selectedDate}
                  setSelectedDate={setSelectedDate}
                  dayEvents={dayEvents}
                />
              )
            })}
          </div>

          {communities.length > 0 && (
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {communities.map(community => (
                <span key={community.label} className="flex items-center gap-2 text-sm text-white">
                  <span className={clsx("size-3 shrink-0", colorForCommunity(community.id))} />
                  {community.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export function EventsCalendar() {
  return (
    <QueryClientProvider client={queryClient}>
      <EventsCalendarInner />
    </QueryClientProvider>
  )
}
