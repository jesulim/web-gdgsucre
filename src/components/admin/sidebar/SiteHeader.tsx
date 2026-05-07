import EventSelector from "@/components/admin/EventSelector"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface SiteHeaderProps {
  sectionTitle: string
  events: any[]
  eventSlug: string
  setEventSlug: (slug: string) => void
}

export function SiteHeader({ sectionTitle, events, eventSlug, setEventSlug }: SiteHeaderProps) {
  return (
    <header className="flex shrink-0 items-center justify-between gap-2 border-b py-2 px-4 lg:px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex flex-wrap md:flex-row items-center gap-1 lg:gap-2 w-full">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h2 className="mr-auto text-lg font-semibold">{sectionTitle}</h2>
        <EventSelector events={events} eventSlug={eventSlug} setEventSlug={setEventSlug} />
      </div>
    </header>
  )
}
