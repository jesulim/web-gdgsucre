import { ArrowRight, Check, RotateCcw, Search, X } from "lucide-react"
import "./sorteo.css"
import { useEffect, useMemo, useRef, useState } from "react"

interface Participant {
  id: number
  first_name: string
  last_name: string
  role: string
  status: string
  package: string | null
}
interface EventOption {
  slug: string
  name: string
}
const fullName = (person: Participant) => `${person.first_name} ${person.last_name}`.trim()
export default function RandomWinner({ events }: { events: EventOption[] }) {
  const [eventSlug, setEventSlug] = useState(events[0]?.slug ?? "")
  const [paymentConfirmed, setPaymentConfirmed] = useState(false)
  const [role, setRole] = useState("")
  const [participants, setParticipants] = useState<Participant[]>([])
  const [winners, setWinners] = useState<Participant[]>([])
  const [discarded, setDiscarded] = useState<Participant[]>([])
  const [winner, setWinner] = useState<Participant | null>(null)
  const [current, setCurrent] = useState<Participant | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [spinning, setSpinning] = useState(false)
  const [search, setSearch] = useState("")
  const [reload, setReload] = useState(0)
  const locked = useRef(false)
  const timers = useRef<ReturnType<typeof setTimeout>[]>([])
  const excluded = useMemo(
    () => new Set([...winners, ...discarded].map(p => p.id)),
    [winners, discarded]
  )
  const pool = useMemo(
    () => participants.filter(p => !excluded.has(p.id)),
    [participants, excluded]
  )
  const visible = pool.filter(p =>
    fullName(p).toLocaleLowerCase().includes(search.trim().toLocaleLowerCase())
  )
  const busy = loading || spinning || !!winner

  useEffect(
    () => () => {
      for (const timer of timers.current) clearTimeout(timer)
    },
    []
  )

  // biome-ignore lint/correctness/useExhaustiveDependencies: reload explicitly requests a new participant snapshot.
  useEffect(() => {
    const controller = new AbortController()
    setParticipants([])
    setWinners([])
    setDiscarded([])
    setWinner(null)
    setCurrent(null)
    setSearch("")
    setError("")
    if (!eventSlug) return () => controller.abort()
    setLoading(true)
    const params = new URLSearchParams({ eventSlug, paymentConfirmed: String(paymentConfirmed) })
    if (role) params.set("role", role)
    async function load() {
      try {
        const response = await fetch(`/api/random-registrations?${params}`, {
          signal: controller.signal,
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data.error || "No se pudieron cargar los participantes.")
        if (!controller.signal.aborted) setParticipants(data.data)
      } catch (err) {
        if (!controller.signal.aborted)
          setError(err instanceof Error ? err.message : "Error de conexión.")
      } finally {
        if (!controller.signal.aborted) setLoading(false)
      }
    }
    void load()
    return () => controller.abort()
  }, [eventSlug, paymentConfirmed, role, reload])

  function draw() {
    if (locked.current || busy || error || !pool.length) return
    locked.current = true
    setSpinning(true)
    // Rejection sampling avoids modulo bias. The pool is frozen for the whole draw.
    const buffer = new Uint32Array(1)
    const ceiling = 2 ** 32 - (2 ** 32 % pool.length)
    do {
      crypto.getRandomValues(buffer)
    } while (buffer[0] >= ceiling)
    const selected = pool[buffer[0] % pool.length]
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const started = Date.now()
    let index = 0
    function tick() {
      if (Date.now() - started >= (reducedMotion ? 0 : 3500)) {
        setCurrent(selected)
        setWinner(selected)
        setSpinning(false)
        return
      }
      setCurrent(pool[index++ % pool.length])
      timers.current = [setTimeout(tick, 100)]
    }
    tick()
  }

  function resolve(action: "winner" | "discard" | "return") {
    if (!winner) return
    if (action === "winner") setWinners(prev => [...prev, winner])
    if (action === "discard") setDiscarded(prev => [...prev, winner])
    setWinner(null)
    setCurrent(null)
    locked.current = false
  }

  return (
    <div className="raffle">
      <header className="raffle-heading">
        <div>
          <p className="raffle-eyebrow">GDG SUCRE / STAFF</p>
          <h1>
            Sorteos<span className="raffle-period">.</span>
          </h1>
        </div>
        <a href="/admin" className="raffle-back">
          Administración <ArrowRight size={18} aria-hidden="true" />
        </a>
      </header>
      <div className="raffle-workspace">
        <aside className="raffle-settings" aria-labelledby="filters-title">
          <h2 id="filters-title" className="raffle-section-title">
            <span className="raffle-dot" />
            Quién participa
          </h2>
          <label className="raffle-field">
            Evento
            <select
              value={eventSlug}
              onChange={e => setEventSlug(e.target.value)}
              disabled={busy || !events.length}
            >
              {!events.length && <option value="">Sin eventos disponibles</option>}
              {events.map(event => (
                <option key={event.slug} value={event.slug}>
                  {event.name}
                </option>
              ))}
            </select>
          </label>
          <label className="raffle-field">
            Rol
            <select value={role} onChange={e => setRole(e.target.value)} disabled={busy}>
              <option value="">Todos los roles</option>
              <option value="Participante">Participantes</option>
              <option value="Organizer">Organizadores</option>
            </select>
          </label>
          <label className="raffle-payment">
            <input
              type="checkbox"
              checked={paymentConfirmed}
              onChange={e => setPaymentConfirmed(e.target.checked)}
              disabled={busy}
            />
            <span>Solo con pago confirmado</span>
          </label>
          <p className="raffle-help">
            Inscripción confirmada con paquete no exento, según el estado actual del sistema.
          </p>
          <details className="raffle-details">
            <summary>Sobre este filtro</summary>
            <p>
              No es una verificación bancaria independiente. Se excluyen «Sin paquete» y la opción
              exenta del evento.
            </p>
          </details>
          <div className="raffle-settings-foot">
            <p>Al cambiar filtros se reinician los resultados de esta sesión.</p>
            <button
              type="button"
              className="raffle-reset"
              disabled={busy || !eventSlug}
              onClick={() => {
                if (
                  window.confirm(
                    "¿Reiniciar el sorteo? Se borrarán ganadores y descartados de esta sesión."
                  )
                )
                  setReload(n => n + 1)
              }}
            >
              <RotateCcw size={16} />
              Reiniciar sorteo
            </button>
          </div>
        </aside>
        <section
          className="raffle-main"
          aria-labelledby="draw-title"
          aria-busy={loading || spinning}
        >
          <div className="raffle-stage-top">
            <h2 id="draw-title" className="raffle-section-title">
              {winner ? "Selección pendiente" : "Sorteo en vivo"}
            </h2>
            <span className="raffle-live">
              <span />
              {spinning ? "Sorteando" : loading ? "Cargando" : "Sesión local"}
            </span>
          </div>
          {error && (
            <div role="alert" className="raffle-error">
              {error}
              <button type="button" onClick={() => setReload(n => n + 1)}>
                Reintentar
              </button>
            </div>
          )}
          <div className={`raffle-stage ${winner ? "raffle-stage-winner" : ""}`}>
            <div className="raffle-shapes" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
            </div>
            <p className="raffle-eyebrow">
              {winner
                ? "LA SUERTE ELIGIÓ A"
                : spinning
                  ? "BUSCANDO AL PRÓXIMO GANADOR"
                  : "LA PRÓXIMA PERSONA PODRÍA SER…"}
            </p>
            <div className="raffle-name">
              {current ? (
                fullName(current)
              ) : (
                <>
                  <span className="raffle-count">{pool.length.toString().padStart(2, "0")}</span>
                  <span className="raffle-count-label">personas listas para participar</span>
                </>
              )}
            </div>
            <p className="raffle-stage-hint">
              {loading
                ? "Preparando la lista…"
                : error
                  ? "Reintenta la carga para continuar."
                  : winner
                    ? "Confirma el resultado o devuelve a esta persona a la lista."
                    : !pool.length
                      ? "No hay participantes con estos filtros."
                      : "Una selección al azar. Sin repetir ganadores."}
            </p>
            <p className="sr-only" aria-live="polite">
              {winner ? `Persona seleccionada: ${fullName(winner)}` : ""}
            </p>
          </div>
          <div className="raffle-actions">
            {winner ? (
              <>
                <button
                  type="button"
                  className="raffle-primary raffle-confirm"
                  onClick={() => resolve("winner")}
                >
                  <Check size={20} />
                  Confirmar ganador
                </button>
                <button
                  type="button"
                  className="raffle-secondary"
                  onClick={() => resolve("discard")}
                >
                  <X size={18} />
                  Descartar
                </button>
                <button
                  type="button"
                  className="raffle-text-button"
                  onClick={() => resolve("return")}
                >
                  Devolver a la lista
                </button>
              </>
            ) : (
              <button
                type="button"
                className="raffle-primary"
                onClick={draw}
                disabled={busy || !!error || !pool.length}
              >
                {spinning ? "Sorteando…" : "Elegir un ganador"}
                <ArrowRight size={22} />
              </button>
            )}
          </div>
          <div className="raffle-tally">
            <span>
              <b>{pool.length}</b> disponibles
            </span>
            <span>
              <i className="raffle-dot-green" />
              <b>{winners.length}</b> ganadores
            </span>
            <span>
              <i className="raffle-dot-red" />
              <b>{discarded.length}</b> descartados
            </span>
          </div>
        </section>
      </div>
      <div className="raffle-records">
        <section className="raffle-roster" aria-labelledby="list-title">
          <div className="raffle-list-heading">
            <h2 id="list-title">
              Participantes <span>{pool.length}</span>
            </h2>
            <label className="raffle-search">
              <Search size={17} aria-hidden="true" />
              <input
                aria-label="Buscar en participantes"
                placeholder="Buscar nombre"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </label>
          </div>
          <p className="raffle-help">La búsqueda solo cambia esta vista, no quién participa.</p>
          <div className="raffle-table">
            <div className="raffle-table-head">
              <span>Nombre</span>
              <span>Rol / paquete</span>
            </div>
            <ul>
              {visible.map(person => (
                <li key={person.id}>
                  <span>{fullName(person)}</span>
                  <span>
                    {person.role}
                    {person.package ? ` · ${person.package}` : ""}
                  </span>
                </li>
              ))}
            </ul>
            {!visible.length && (
              <p className="raffle-empty">
                {loading ? "Cargando…" : search ? "No hay coincidencias." : "La lista está vacía."}
              </p>
            )}
          </div>
        </section>
        <section className="raffle-results" aria-labelledby="results-title">
          <h2 id="results-title">Resultados</h2>
          <p className="raffle-help">Solo esta sesión. Se borran al recargar o salir.</p>
          {[
            { title: "Ganadores", people: winners, color: "green" },
            { title: "Descartados", people: discarded, color: "red" },
          ].map(group => (
            <div className="raffle-result-group" key={group.title}>
              <h3>
                <i className={`raffle-dot-${group.color}`} />
                {group.title}
                <span>{group.people.length}</span>
              </h3>
              <ol>
                {group.people.map((person, i) => (
                  <li key={person.id}>
                    <span>{String(i + 1).padStart(2, "0")}</span>
                    {fullName(person)}
                  </li>
                ))}
              </ol>
              {!group.people.length && (
                <p className="raffle-empty">Aún no hay {group.title.toLowerCase()}.</p>
              )}
            </div>
          ))}
        </section>
      </div>
      <footer className="raffle-footer">
        <span>Google Developer Group Sucre</span>
        <div aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </div>
        <span>Hecho para la comunidad.</span>
      </footer>
    </div>
  )
}
