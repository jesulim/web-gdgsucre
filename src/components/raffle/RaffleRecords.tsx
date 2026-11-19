import { History, Search, Users } from "lucide-react"
import { useRef, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import type { RaffleParticipant } from "@/lib/services/raffleService"
import { participantName, type RoundEntry } from "./round"

function ParticipantList({ pool }: { pool: RaffleParticipant[] }) {
  const [search, setSearch] = useState("")
  const term = search.trim().toLocaleLowerCase("es")
  const visible = term
    ? pool.filter(person => participantName(person).toLocaleLowerCase("es").includes(term))
    : pool
  return (
    <>
      <label className="raffle-search">
        <Search size={18} aria-hidden="true" />
        <input
          type="search"
          name="participantSearch"
          aria-label="Buscar por nombre"
          placeholder="Buscar por nombre…"
          autoComplete="off"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </label>
      {visible.length ? (
        <ul className="raffle-list">
          {visible.map(person => (
            <li key={person.id}>
              <span>{participantName(person)}</span>
              <small>
                {person.role === "Organizer" ? "Organizador" : person.role}
                {person.package && ` · ${person.package}`}
              </small>
            </li>
          ))}
        </ul>
      ) : (
        <p className="raffle-note">{term ? "No hay coincidencias." : "No quedan participantes."}</p>
      )}
    </>
  )
}

export function RaffleRecords({
  pool,
  history,
  unavailable,
}: {
  pool: RaffleParticipant[]
  history: RoundEntry[]
  unavailable: boolean
}) {
  const participantsTitle = useRef<HTMLHeadingElement>(null)
  return (
    <div className="raffle-tools">
      <Dialog>
        <DialogTrigger asChild>
          <button type="button" className="raffle-tool" disabled={unavailable}>
            <Users size={17} aria-hidden="true" /> Consultar participantes
          </button>
        </DialogTrigger>
        <DialogContent
          className="raffle-dialog"
          onOpenAutoFocus={e => {
            if (!participantsTitle.current) return
            e.preventDefault()
            participantsTitle.current.focus()
          }}
        >
          <DialogTitle ref={participantsTitle} tabIndex={-1} className="outline-none">
            Participantes
          </DialogTitle>
          <DialogDescription>{pool.length} en el grupo del sorteo</DialogDescription>
          <ParticipantList pool={pool} />
        </DialogContent>
      </Dialog>
      {history.length > 0 && (
        <Dialog>
          <DialogTrigger asChild>
            <button type="button" className="raffle-tool">
              <History size={17} aria-hidden="true" /> Ver historial
            </button>
          </DialogTrigger>
          <DialogContent className="raffle-dialog">
            <DialogTitle>Historial del sorteo</DialogTitle>
            <DialogDescription className="sr-only">
              Resultados en orden de selección.
            </DialogDescription>
            <ol className="raffle-list raffle-history">
              {history.map(({ person, outcome }) => (
                <li key={person.id}>
                  <span>{participantName(person)}</span>
                  <small data-outcome={outcome}>
                    {outcome === "confirmed" ? "Confirmado" : "Excluido"}
                  </small>
                </li>
              ))}
            </ol>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
