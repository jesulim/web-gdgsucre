import { QueryClient, useQuery } from "@tanstack/react-query"
import { ArrowRight, Check, Waves } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import type { RaffleParticipant } from "@/lib/services/raffleService"
import "@/styles/raffle.css"

import { ParticipantMural } from "./ParticipantMural"
import { RaffleRecords } from "./RaffleRecords"
import { RaffleSettings } from "./RaffleSettings"
import { ResetRaffleDialog } from "./ResetRaffleDialog"

import {
  type EventOption,
  participantName,
  participantPackage,
  type RoundEntry,
  type Selection,
} from "./round"

type Stage =
  | { phase: "ready" | "drawing" }
  | { phase: "selected" | RoundEntry["outcome"]; person: RaffleParticipant }

const emptyList: RaffleParticipant[] = []
const outcomeDurationMs = 1000
const posterLabels = {
  selected: "Persona seleccionada",
  confirmed: "Ganador confirmado",
  excluded: "Participante al agua",
}

export default function RandomWinner({ events }: { events: EventOption[] }) {
  const [selection, setSelection] = useState<Selection>({
    eventSlug: events[0]?.slug ?? "",
    role: "",
    packageName: "",
    paymentConfirmed: false,
  })
  const { eventSlug, paymentConfirmed, role, packageName } = selection
  const event = events.find(event => event.slug === eventSlug)
  const [client] = useState(() => new QueryClient())
  const {
    data: participants = emptyList,
    error,
    isFetching: loading,
    refetch,
  } = useQuery(
    {
      queryKey: ["raffle", eventSlug, paymentConfirmed],
      enabled: !!eventSlug,
      staleTime: 60_000,
      retry: false,
      networkMode: "always",
      queryFn: async ({ signal }): Promise<RaffleParticipant[]> => {
        const params = new URLSearchParams({
          eventSlug,
          paymentConfirmed: String(paymentConfirmed),
        })
        const response = await fetch(`/api/random-registrations?${params}`, { signal })
        if (!response.ok) {
          const data = await response.json().catch(() => null)
          throw new Error(data?.error || "No se pudieron cargar los participantes.")
        }
        return (await response.json()).data
      },
    },
    client
  )
  const [history, setHistory] = useState<RoundEntry[]>([])
  const [stage, setStage] = useState<Stage>({ phase: "ready" })
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const packages = useMemo(() => {
    const names = new Set(participants.map(participantPackage))
    // Keep the filter removable even if the payment filter leaves no matching registrations.
    if (packageName) names.add(packageName)
    return [...names].sort((a, b) => a.localeCompare(b, "es", { numeric: true }))
  }, [participants, packageName])
  const pool = useMemo(() => {
    const excluded = new Set(history.map(entry => entry.person.id))
    return participants.filter(
      person =>
        (!role || person.role === role) &&
        (!packageName || participantPackage(person) === packageName) &&
        !excluded.has(person.id)
    )
  }, [history, participants, role, packageName])
  const busy = stage.phase !== "ready"
  const canDraw = !!event && !loading && !error && pool.length > 0
  const labelCount = `${pool.length} ${pool.length === 1 ? "persona" : "personas"}`
  const primaryLabels = {
    ready: canDraw ? `Sortear entre ${labelCount}` : "Sortear",
    drawing: "Sorteando…",
    selected: "Confirmar ganador",
    confirmed: "Confirmado",
    excluded: "Excluido",
  }

  useEffect(
    () => () => {
      if (timer.current !== null) clearTimeout(timer.current)
    },
    []
  )

  function clearRound() {
    setHistory([])
    setStage({ phase: "ready" })
  }

  function applySelection(next: Selection) {
    const changed =
      next.eventSlug !== eventSlug ||
      next.role !== role ||
      next.packageName !== packageName ||
      next.paymentConfirmed !== paymentConfirmed
    if (busy || !changed) return
    clearRound()
    setSelection(next)
  }

  function draw() {
    if (
      !canDraw ||
      (stage.phase !== "ready" && stage.phase !== "selected") ||
      timer.current !== null
    )
      return
    // Pick from the entire eligible pool before animating the mural.
    const buffer = new Uint32Array(1)
    const ceiling = 2 ** 32 - (2 ** 32 % pool.length)
    do {
      crypto.getRandomValues(buffer)
    } while (buffer[0] >= ceiling)
    const person = pool[buffer[0] % pool.length]
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage({ phase: "selected", person })
      return
    }
    setStage({ phase: "drawing" })
    timer.current = setTimeout(() => {
      timer.current = null
      setStage({ phase: "selected", person })
    }, 1200)
  }

  function resolve(outcome: RoundEntry["outcome"]) {
    if (stage.phase !== "selected") return
    const { person } = stage
    setHistory(entries => [...entries, { person, outcome }])
    setStage({ phase: outcome, person })
    timer.current = setTimeout(() => {
      timer.current = null
      setStage({ phase: "ready" })
    }, outcomeDurationMs)
  }

  const poster = "person" in stage
  const emptyMessage = !event
    ? "No tienes eventos disponibles."
    : error
      ? error.message
      : loading
        ? "Cargando participantes…"
        : history.length && !pool.length
          ? "No quedan participantes en esta ronda."
          : "No hay participantes con esta selección."

  return (
    <div className="raffle">
      <div className="raffle-context">
        <RaffleSettings
          events={events}
          packages={packages}
          selection={selection}
          disabled={busy || !event}
          onChange={applySelection}
        />
        <ResetRaffleDialog
          disabled={busy || !event}
          onConfirm={() => {
            clearRound()
            void client.resetQueries({ queryKey: ["raffle", eventSlug] })
          }}
        />
      </div>

      <section className="raffle-stage" aria-label="Sorteo en vivo">
        {poster ? (
          <div className="raffle-poster" data-phase={stage.phase}>
            <div className="raffle-poster-copy">
              <p className="raffle-caption">{posterLabels[stage.phase]}</p>
              <h2>{participantName(stage.person)}</h2>
            </div>
            <img
              aria-label="GDG logo"
              className="animate-[bounce_1.6s_infinite]"
              src="/favicon.svg"
              width={200}
            />
          </div>
        ) : canDraw || stage.phase === "drawing" ? (
          <ParticipantMural people={pool} drawing={stage.phase === "drawing"} />
        ) : (
          <div className="raffle-empty" role={error ? "alert" : "status"}>
            <p>{emptyMessage}</p>
            {error && (
              <button type="button" className="raffle-link" onClick={() => void refetch()}>
                Reintentar
              </button>
            )}
          </div>
        )}
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {poster
            ? `${posterLabels[stage.phase]}: ${participantName(stage.person)}`
            : stage.phase === "drawing"
              ? "Sorteando…"
              : ""}
        </p>
        <div className="raffle-controls">
          <div className="raffle-actions">
            <button
              type="button"
              className="raffle-primary"
              disabled={stage.phase !== "selected" && (!canDraw || busy)}
              onClick={() => (stage.phase === "selected" ? resolve("confirmed") : draw())}
            >
              {primaryLabels[stage.phase]}
              {stage.phase === "excluded" ? (
                <Waves size={20} aria-hidden="true" />
              ) : poster ? (
                <Check size={20} aria-hidden="true" />
              ) : (
                <ArrowRight size={20} aria-hidden="true" />
              )}
            </button>
            {stage.phase === "selected" && (
              <>
                <button
                  type="button"
                  className="raffle-secondary"
                  onClick={() => resolve("excluded")}
                >
                  Excluir de esta ronda
                </button>
                <button type="button" className="raffle-link" disabled={!canDraw} onClick={draw}>
                  Devolver al grupo y sortear
                </button>
              </>
            )}
          </div>
          <RaffleRecords
            pool={pool}
            history={history}
            unavailable={!event || loading || !!error || stage.phase === "drawing"}
          />
        </div>
        {poster && error && (
          <div role="alert" className="raffle-note">
            {error.message}{" "}
            <button type="button" className="raffle-link" onClick={() => void refetch()}>
              Reintentar
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
