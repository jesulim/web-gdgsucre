import type { CSSProperties } from "react"
import type { RaffleParticipant } from "@/lib/services/raffleService"

// A window onto the pool, not the pool used to draw. Small screens crop to three rows.
const visibleTiles = 30

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
