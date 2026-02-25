import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface EventOption {
  id: number
  name: string
  slug: string
}

interface EventSelectorProps {
  events: EventOption[]
  eventSlug: string
  setEventSlug: (value: string) => void
}

export default function EventSelector({ events, eventSlug, setEventSlug }: EventSelectorProps) {
  return (
    <div className="flex gap-2 items-center">
      <span className=" font-medium">Evento</span>

      <Select
        onValueChange={value => setEventSlug(value)}
        value={eventSlug}
        disabled={!events?.length}
      >
        <SelectTrigger>
          <SelectValue placeholder="Cargando eventos" />
        </SelectTrigger>
        <SelectGroup>
          <SelectContent>
            {events?.map(({ id, slug, name }) => (
              <SelectItem key={id} value={slug}>
                {name}
              </SelectItem>
            ))}
          </SelectContent>
        </SelectGroup>
      </Select>
    </div>
  )
}
