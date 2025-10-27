import { useEffect, useState } from "react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EventOption {
  id: number
  name: string
  slug: string
}

export default function EventSelector({
  eventSlug,
  setEventSlug,
}: {
  eventSlug: string
  setEventSlug: (value: string) => void
}) {
  const [events, setEvents] = useState<EventOption[]>([])

  useEffect(() => {
    const fetchEvents = async () => {
      const response = await fetch("/api/events")
      const result = await response.json()

      setEvents(result)
      setEventSlug(result[0]?.slug)
    }

    fetchEvents()
  }, [setEventSlug])

  return (
    <div className="flex gap-2 items-center">
      <span className="text-lg font-medium">Evento</span>

      <Select onValueChange={value => setEventSlug(value)} value={eventSlug} disabled={!events}>
        <SelectTrigger>
          <SelectValue placeholder="Cargando eventos" />
        </SelectTrigger>
        <SelectContent>
          {events?.map(({ id, slug, name }) => (
            <SelectItem key={id} value={slug}>
              {name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
