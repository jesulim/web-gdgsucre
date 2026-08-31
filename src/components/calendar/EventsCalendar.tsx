import { QueryClient, QueryClientProvider, useQuery } from "@tanstack/react-query"
import { addMonths, format, getDay, getMonth, getYear, isSameDay, startOfWeek } from "date-fns"
import { es } from "date-fns/locale/es"
import { ChevronLeftIcon, ChevronRightIcon, Loader2Icon } from "lucide-react"
import { useCallback, useMemo, useState } from "react"
import { Calendar, dateFnsLocalizer, type SlotInfo } from "react-big-calendar"

import "react-big-calendar/lib/css/react-big-calendar.css"
import "./EventsCalendar.css"

const locales = { es }

const localizer = dateFnsLocalizer({
  format,
  parse: Date.parse,
  startOfWeek: (date, options) => startOfWeek(date, { ...options, weekStartsOn: 1 }),
  getDay,
  locales,
})

interface CalendarEventPayload {
  id: number
  name: string
  community_id: number
  start_datetime: string
  end_datetime: string
  communities: {
    id: number
    name: string
    short_name: string | null
  } | null
}

interface CalendarEvent {
  id: number
  name: string
  start: Date
  end: Date
  label: string
  community_id: number
  community: string
}

const ACCENT_COLORS = [
  { key: "blue", color: "#4285f4" },
  { key: "red", color: "#ea4335" },
  { key: "yellow", color: "#f9ab00" },
  { key: "green", color: "#34a853" },
] as const

function colorForCommunity(communityId: number | null | undefined) {
  if (communityId == null) return ACCENT_COLORS[3]
  return ACCENT_COLORS[Math.abs(communityId) % ACCENT_COLORS.length]
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function formatMonthName(date: Date) {
  return `${capitalize(format(date, "MMMM", { locale: es }))} ${format(date, "yyyy")}`
}

function formatMonthShort(date: Date) {
  return capitalize(format(date, "MMM", { locale: es }).replace(/\.$/, ""))
}

function formatDayName(date: Date) {
  return capitalize(format(date, "EEEE", { locale: es }))
}

function formatDayNumber(date: Date) {
  return format(date, "d")
}

function formatMonthYear(date: Date) {
  return `${capitalize(format(date, "MMMM", { locale: es }))} ${format(date, "yyyy")}`
}

function formatEventTime(date: Date) {
  return format(date, "HH:mm")
}

function transformEvent(raw: CalendarEventPayload): CalendarEvent {
  return {
    ...raw,
    start: new Date(raw.start_datetime),
    end: new Date(raw.end_datetime),
    title: raw.name,
    community: raw.communities?.short_name ?? raw.communities?.name ?? "",
  }
}

const queryClient = new QueryClient()

function useCalendarEvents(year: number, month: number) {
  return useQuery<CalendarEvent[]>({
    queryKey: ["calendar-events", year, month],
    queryFn: async () => {
      const response = await fetch(`/api/calendar-events?year=${year}&month=${month}`)
      if (!response.ok) throw new Error(`HTTP ${response.status}`)
      const payload = (await response.json()) as CalendarEventPayload[]
      return payload.map(transformEvent)
    },
  })
}

interface DayDetailPanelProps {
  selectedDate: Date | null
  events: CalendarEvent[]
}

function DayDetailPanel({ selectedDate, events }: DayDetailPanelProps) {
  if (!selectedDate) {
    selectedDate = new Date()
  }

  const dayEvents = events.filter(event => isSameDay(event.start, selectedDate))

  return (
    <div className="border border-white bg-red-500/20 p-8 py-4 text-white">
      <div className="flex items-center gap-4 pb-4">
        <span className="text-2xl leading-none font-bold md:text-5xl">
          {formatDayNumber(selectedDate)}
        </span>
        <div className="flex flex-col text-sm text-white">
          <span>{formatDayName(selectedDate)}</span>
          <span className="text-muted-foreground">{formatMonthYear(selectedDate)}</span>
        </div>
      </div>

      <hr className="border-white pb-4" />

      <div className="flex flex-col gap-3">
        {dayEvents.length === 0 ? (
          <p className="text-sm text-white/60">Sin eventos para este día.</p>
        ) : (
          dayEvents.map(event => (
            <div key={event.id} className="flex gap-4 text-white">
              <div
                className="w-2 mb-1"
                style={{ background: colorForCommunity(event.community_id).color }}
              ></div>
              <div className="flex flex-col gap-1">
                <h3 className="text-lg leading-tight font-bold">{event.title}</h3>
                <p className="text-muted-foreground mt-1 text-sm">
                  {formatEventTime(event.start)} · {event.location} · {event.community}
                </p>
                {event.registration_link && (
                  <a
                    href={event.registration_link}
                    rel="noopener noreferrer"
                    className="hover:underline"
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

interface EventsToolbarProps {
  date: Date
  eventCount: number
  loading: boolean
  onPrev: () => void
  onNext: () => void
}

function EventsToolbar({ date, eventCount, loading, onPrev, onNext }: EventsToolbarProps) {
  return (
    <div className="booking-calendar__toolbar font-monospace mb-4 flex items-center justify-between gap-4">
      <button
        type="button"
        aria-label="Mes anterior"
        className="flex size-9 items-center justify-center border border-white transition-colors hover:bg-red-500/50"
        onClick={onPrev}
      >
        <ChevronLeftIcon className="size-5" />
      </button>
      <button
        type="button"
        aria-label="Mes siguiente"
        className="flex size-9 items-center justify-center border border-white transition-colors hover:bg-red-500/50"
        onClick={onNext}
      >
        <ChevronRightIcon className="size-5" />
      </button>

      <span className="min-w-28 text-center text-base font-semibold text-white">
        {formatMonthName(date)}
      </span>

      <div className="hidden sm:block ml-auto min-w-0 text-right text-sm font-medium text-white">
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2Icon className="size-4 animate-spin" />
            cargando
          </span>
        ) : (
          `${eventCount} eventos · ${formatMonthShort(date)}`
        )}
      </div>
    </div>
  )
}

function EventsCalendarInner() {
  const [date, setDate] = useState(() => new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  const year = getYear(date)
  const month = getMonth(date) + 1

  const { data: events = [], isLoading } = useCalendarEvents(year, month)

  const navigateMonth = useCallback((offset: number) => {
    setDate(current => addMonths(current, offset))
  }, [])

  const onPrev = useCallback(() => navigateMonth(-1), [navigateMonth])
  const onNext = useCallback(() => navigateMonth(1), [navigateMonth])

  const handleSelectSlot = useCallback((slotInfo: SlotInfo) => {
    setSelectedDate(slotInfo.start)
  }, [])

  const communities = useMemo(() => {
    const map = new Map<string, { label: string; color: string }>()

    for (const event of events) {
      if (event.community_id == null) continue
      const key = String(event.community_id)
      if (map.has(key)) continue
      map.set(key, {
        label: event.community,
        color: colorForCommunity(event.community_id).color,
      })
    }

    return [...map.values()]
  }, [events])

  const eventPropGetter = useCallback(
    (event: CalendarEvent) => ({
      style: { backgroundColor: colorForCommunity(event.community_id).color, borderRadius: 0 },
    }),
    []
  )

  return (
    <section id="calendario" className="font-monospace mx-auto max-w-6xl px-4 pt-16 lg:pt-24">
      <div className="grid gap-8 lg:grid-cols-[2fr_3fr] lg:items-start lg:gap-16">
        <section className="flex flex-col gap-6 lg:sticky lg:top-28">
          <p className="text-xs uppercase">[ 04 · calendario ]</p>
          <DayDetailPanel selectedDate={selectedDate} events={events} />
        </section>

        <div className="booking-calendar font-monospace p-3 text-white sm:p-4">
          <Calendar
            localizer={localizer}
            culture="es"
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: "100%" }}
            views={["month"]}
            date={date}
            onNavigate={setDate}
            components={{
              toolbar: ({ date }) => (
                <EventsToolbar
                  date={date}
                  eventCount={events.length}
                  loading={isLoading}
                  onPrev={onPrev}
                  onNext={onNext}
                />
              ),
            }}
            eventPropGetter={eventPropGetter}
            selectable
            onSelectSlot={handleSelectSlot}
          />

          {communities.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 ">
              {communities.map(item => (
                <span key={item.label} className="flex items-center gap-2 text-sm text-white/80">
                  <span className="size-3 shrink-0" style={{ backgroundColor: item.color }} />
                  {item.label}
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
