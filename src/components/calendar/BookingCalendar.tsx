import { ChevronLeftIcon, ChevronRightIcon, Loader2Icon } from "lucide-react"
import moment from "moment"
import "moment/locale/es"
import { useCallback, useEffect, useMemo, useState } from "react"
import { Calendar, momentLocalizer, type SlotInfo } from "react-big-calendar"

import "react-big-calendar/lib/css/react-big-calendar.css"

moment.locale("es")
const localizer = momentLocalizer(moment)

export interface BookingCalendarEvent {
  id: number
  title: string
  start: string | Date
  end: string | Date
  communityId?: number | null
  communityName?: string | null
}

interface BookingCalendarProps {
  onSelectSlot?: (slotInfo: SlotInfo) => void
}

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

// Accent palette matching the accent colors used across the page cards.
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

interface BookingToolbarProps {
  date: Date
  eventCount: number
  loading: boolean
  onPrev: () => void
  onNext: () => void
}

function formatMonthName(date: Date) {
  const month = moment(date).locale("es").format("MMMM")
  const year = moment(date).year()

  return `${month.charAt(0).toUpperCase()}${month.slice(1)} ${year}`
}

function formatMonthShort(date: Date) {
  const month = moment(date).locale("es").format("MMM")

  return `${month.charAt(0).toUpperCase()}${month.slice(1).replace(/\.$/, "")}`
}

function BookingToolbar({ date, eventCount, loading, onPrev, onNext }: BookingToolbarProps) {
  return (
    <div className="booking-calendar__toolbar font-monospace mb-4 flex items-center justify-between gap-4 border-b border-white/25 pb-4">
      <div className="flex items-center gap-3 text-white">
        <button
          type="button"
          aria-label="Mes anterior"
          className="flex size-9 items-center justify-center border border-white bg-white/5 transition-colors hover:bg-white/15"
          onClick={onPrev}
        >
          <ChevronLeftIcon className="size-5" />
        </button>

        <span className="min-w-28 text-center text-base font-semibold text-white">
          {formatMonthName(date)}
        </span>

        <button
          type="button"
          aria-label="Mes siguiente"
          className="flex size-9 items-center justify-center border border-white bg-white/5 transition-colors hover:bg-white/15"
          onClick={onNext}
        >
          <ChevronRightIcon className="size-5" />
        </button>
      </div>

      <div className="min-w-0 text-right text-sm font-medium text-white/85">
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Loader2Icon className="size-4 animate-spin" />
            cargando
          </span>
        ) : (
          `${eventCount} Eventos - ${formatMonthShort(date)}`
        )}
      </div>
    </div>
  )
}

export function BookingCalendar({ onSelectSlot }: BookingCalendarProps) {
  const [date, setDate] = useState(() => new Date())
  const [events, setEvents] = useState<BookingCalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    setLoading(true)

    const year = moment(date).year()
    const month = moment(date).month() + 1

    fetch(`/api/calendar-events?year=${year}&month=${month}`)
      .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`)
        return response.json() as Promise<CalendarEventPayload[]>
      })
      .then(payload =>
        payload.map(event => ({
          id: event.id,
          title: `${event.name}${event.communities?.name ? ` · ${event.communities.name}` : ""}`,
          start: new Date(event.start_datetime),
          end: new Date(event.end_datetime),
          communityId: event.communities?.id ?? event.community_id ?? null,
          communityName: event.communities?.name ?? null,
        }))
      )
      .then(data => {
        if (active) setEvents(data)
      })
      .catch(error => {
        console.error("Error al cargar eventos del calendario:", error)
        if (active) setEvents([])
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [date])

  const navigateMonth = useCallback((offset: number) => {
    setDate(current => moment(current).add(offset, "month").toDate())
  }, [])

  const onPrev = useCallback(() => navigateMonth(-1), [navigateMonth])
  const onNext = useCallback(() => navigateMonth(1), [navigateMonth])

  const visibleMonthEvents = useMemo(
    () => events.filter(event => moment(event.start).isSame(date, "month")),
    [events, date]
  )

  const legend = useMemo(() => {
    const map = new Map<string, { label: string; color: string }>()

    for (const event of events) {
      if (event.communityId == null || !event.communityName) continue
      if (map.has(String(event.communityId))) continue
      map.set(String(event.communityId), {
        label: event.communityName,
        color: colorForCommunity(event.communityId).color,
      })
    }

    if (map.size === 0 && visibleMonthEvents.length > 0) {
      map.set("default", {
        label: "Comunidad",
        color: colorForCommunity(null).color,
      })
    }

    return [...map.values()]
  }, [events, visibleMonthEvents])

  const eventPropGetter = useCallback(
    (event: BookingCalendarEvent) => ({
      style: { backgroundColor: colorForCommunity(event.communityId).color },
    }),
    []
  )

  return (
    <div className="booking-calendar font-monospace p-3 text-white sm:p-4">
      <Calendar
        localizer={localizer}
        culture="es"
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={["month"]}
        date={date}
        onNavigate={setDate}
        components={{
          toolbar: ({ date: d }) => (
            <BookingToolbar
              date={d}
              eventCount={visibleMonthEvents.length}
              loading={loading}
              onPrev={onPrev}
              onNext={onNext}
            />
          ),
        }}
        eventPropGetter={eventPropGetter}
        selectable
        onSelectSlot={onSelectSlot}
      />

      {legend.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/15 pt-4">
          {legend.map(item => (
            <span key={item.label} className="flex items-center gap-2 text-sm text-white/80">
              <span className="size-3 shrink-0" style={{ backgroundColor: item.color }} />
              {item.label}
            </span>
          ))}
        </div>
      )}

      <style>{`
        .booking-calendar .rbc-calendar,
        .booking-calendar .rbc-month-view,
        .booking-calendar .rbc-header,
        .booking-calendar .rbc-row-bg,
        .booking-calendar .rbc-month-row,
        .booking-calendar .rbc-date-cell,
        .booking-calendar .rbc-day-bg,
        .booking-calendar .rbc-time-content,
        .booking-calendar .rbc-time-header-content,
        .booking-calendar .rbc-time-header,
        .booking-calendar .rbc-toolbar,
        .booking-calendar .rbc-btn-group {
          background: transparent !important;
          color: white;
        }

        .booking-calendar .rbc-toolbar {
          display: none !important;
        }

        .booking-calendar .rbc-header,
        .booking-calendar .rbc-month-row + .rbc-month-row,
        .booking-calendar .rbc-day-bg,
        .booking-calendar .rbc-header + .rbc-header {
          border-color: rgb(255, 255, 255, 0.65) !important;
        }

        .booking-calendar .rbc-month-view {
          border-color: rgb(255, 255, 255, 0.65) !important;
        }

        .booking-calendar .rbc-month-row {
          border-color: rgb(255, 255, 255, 0.65) !important;
        }

        .booking-calendar .rbc-month-view .rbc-row-content {
          display: flex;
          flex-direction: column;
          min-height: 100%;
        }

        .booking-calendar .rbc-month-view .rbc-row-content > .rbc-row:first-child {
          flex: 1;
          display: flex;
        }

        .booking-calendar .rbc-row-content .rbc-date-cell {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .booking-calendar .rbc-row-content .rbc-date-cell .rbc-button-link {
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .booking-calendar .rbc-off-range,
        .booking-calendar .rbc-off-range-bg {
          color: transparent !important;
          background: transparent !important;
        }

        .booking-calendar .rbc-off-range .rbc-button-link,
        .booking-calendar .rbc-off-range .rbc-date-cell {
          visibility: hidden !important;
        }

        .booking-calendar .rbc-button-link,
        .booking-calendar .rbc-toolbar-label,
        .booking-calendar .rbc-month-header,
        .booking-calendar .rbc-header {
          color: rgba(255, 255, 255, 0.92) !important;
        }

        .booking-calendar .rbc-today {
          background-color: rgba(197, 242, 76, 0.12) !important;
        }

        .booking-calendar .rbc-button-link {
          font-family: inherit;
        }

        .booking-calendar .rbc-event,
        .booking-calendar .rbc-day-slot .rbc-event {
          border: 1px solid rgba(255, 255, 255, 0.25) !important;
          color: #1e1e1e !important;
          font-weight: 600;
        }

        .booking-calendar .rbc-event:focus,
        .booking-calendar .rbc-event:hover {
          outline: 2px solid var(--color-green-lime, #c5f24c) !important;
          outline-offset: 2px;
        }

        .booking-calendar .rbc-show-more {
          color: var(--color-green-lime, #c5f24c) !important;
          font-weight: 600;
        }

        .booking-calendar .rbc-selected-cell {
          background-color: rgba(197, 242, 76, 0.08) !important;
        }

        .booking-calendar__toolbar {
          position: relative;
          z-index: 1;
        }
      `}</style>
    </div>
  )
}
