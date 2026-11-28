import type { CSSProperties } from "react"
import type { RaffleParticipant } from "@/lib/services/raffleService"

// Only the mural is capped; the draw still uses the full eligible pool.
const visibleTiles = 84

export function ParticipantMural({
  people,
  drawing,
}: {
  people: RaffleParticipant[]
  drawing: boolean
}) {
  return (
    <div
      className="raffle-mural"
      style={
        { "--tile-count": Math.max(1, Math.min(people.length, visibleTiles)) } as CSSProperties
      }
      data-drawing={drawing}
      aria-hidden="true"
    >
      {people.slice(0, visibleTiles).map(person => (
        <span key={person.id}>
          {`${person.first_name.trim().charAt(0)}${person.last_name.trim().charAt(0)}`.toLocaleUpperCase(
            "es"
          ) || `#${person.id}`}
        </span>
      ))}
    </div>
  )
}
