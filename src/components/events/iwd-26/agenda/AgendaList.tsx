import type { AgendaEntry, AgendaItem, BreakItem } from "./agenda"

const BG_YELLOW = "/events/iwd-26/agenda/bg-item-agenda-yellow.svg"
const BG_BLUE = "/events/iwd-26/agenda/bg-item-agenda-blue.svg"

const BLUE = "#1F75D1"
const YELLOW = "#EAB744"

const BG_BREAK = "/events/iwd-26/agenda/bg-agenda-break.svg"

const TITLE_SIZE: Record<NonNullable<AgendaItem["titleSize"]>, string> = {
  xs: "text-xs md:text-2xl",
  sm: "text-sm md:text-3xl",
  base: "text-base md:text-4xl",
}

interface AgendaCardProps {
  item: AgendaItem
  colorIndex: number
}

function AgendaCard({ item, colorIndex }: AgendaCardProps) {
  const isEven = colorIndex % 2 === 0
  const bgImage = isEven ? BG_YELLOW : BG_BLUE
  const bgBadge = isEven ? BLUE : YELLOW
  const bgColor = isEven ? YELLOW : BLUE
  const badgeTextClass = isEven ? "text-white" : "text-black"
  const cardTextClass = isEven ? "text-black" : "text-white"
  const titleSizeClass = TITLE_SIZE[item.titleSize ?? "xs"]
  const shortName = item.name.split(" ")[0] + " " + item.name.split(" ")[2]

  return (
    <div className="flex w-full md:h-60 md:inline-flex md:w-auto">
      <div className="w-3/8 aspect-square md:w-auto md:h-full shrink-0">
        <img src={item.img} alt={item.name} className="w-full h-full object-cover object-top" />
      </div>

      <div className="relative flex-1 md:flex-none md:h-full">
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="hidden md:block h-full w-auto pointer-events-none"
        />

        <div className="absolute inset-0 md:hidden" style={{ backgroundColor: bgColor }} />

        <div
          className={`absolute inset-0 flex flex-col justify-center items-start gap-1 px-3 py-3 md:w-[70%] ${cardTextClass} md:gap-4 md:p-6`}
        >
          <p className={`${titleSizeClass} font-bold`}>{item.title}</p>
          <p className="text-xs md:text-xl md:font-medium">{shortName}</p>
          {item.skill && (
            <span
              className={`text-xs px-2 py-1 mt-0.5 rounded font-semibold ${badgeTextClass} md:text-base md:px-4`}
              style={{ backgroundColor: bgBadge }}
            >
              {item.skill}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface BreakCardProps {
  item: BreakItem
}

function BreakCard({ item }: BreakCardProps) {
  return (
    <div className="relative inline-flex w-auto items-center justify-center min-h-24 md:h-60">
      <img src={BG_BREAK} alt="" aria-hidden="true" className="h-full w-auto pointer-events-none" />
      <p className="absolute inset-0 flex items-center justify-center text-black font-bold text-xl tracking-wide px-4 py-3 text-center md:text-4xl">
        {item.label}
      </p>
    </div>
  )
}

interface AgendaListProps {
  items: AgendaEntry[]
}

export function AgendaList({ items }: AgendaListProps) {
  let talkIndex = 0

  return (
    <div className="flex flex-col gap-6 items-stretch md:gap-12">
      {items.map(entry => {
        const isBreak = entry.type === "break"
        const currentIndex = isBreak ? -1 : talkIndex
        if (!isBreak) talkIndex++

        const isEven = currentIndex % 2 === 0
        const timeBg = isEven ? BLUE : YELLOW
        const timeTextClass = isEven ? "text-white" : "text-black"

        return (
          <div
            key={entry.id}
            className="flex flex-col md:flex-row md:justify-center md:items-center items-start gap-3 md:gap-12 w-full"
          >
            <span
              className={`px-2 py-1 rounded font-semibold shrink-0 ${isBreak ? "text-black" : timeTextClass} md:text-2xl md:px-3`}
              style={{ backgroundColor: isBreak ? "#E4E4E2" : timeBg }}
            >
              {entry.time}
            </span>

            {isBreak ? (
              <BreakCard item={entry as BreakItem} />
            ) : (
              <AgendaCard item={entry as AgendaItem} colorIndex={currentIndex} />
            )}
          </div>
        )
      })}
    </div>
  )
}
