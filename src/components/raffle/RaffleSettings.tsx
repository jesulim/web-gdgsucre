import { RaffleSelect } from "./RaffleSelect"
import type { EventOption, Selection } from "./round"

const roles = [
  { value: "", label: "Todos" },
  { value: "Participante", label: "Participantes" },
  { value: "Organizer", label: "Organizadores" },
]

export function RaffleSettings({
  events,
  packages,
  selection,
  disabled,
  onChange,
}: {
  events: EventOption[]
  packages: string[]
  selection: Selection
  disabled: boolean
  onChange: (selection: Selection) => void
}) {
  return (
    <div className="raffle-setup">
      <p className="raffle-section-label">
        Sorteos<span aria-hidden="true">.</span>
      </p>
      <h1 className="raffle-event">
        {events.length < 2 ? (
          (events[0]?.name ?? "Sin eventos disponibles")
        ) : (
          <RaffleSelect
            variant="event"
            label="Cambiar evento"
            options={events.map(event => ({ value: event.slug, label: event.name }))}
            value={selection.eventSlug}
            disabled={disabled}
            onChange={eventSlug => onChange({ ...selection, eventSlug, packageName: "" })}
          />
        )}
      </h1>
      <fieldset className="raffle-filters" disabled={disabled}>
        <legend className="sr-only">Filtros del sorteo</legend>
        <fieldset className="raffle-roles">
          <legend className="sr-only">Rol</legend>
          {roles.map(({ value, label }) => (
            <label key={value}>
              <input
                type="radio"
                className="sr-only"
                name="raffleRole"
                value={value}
                checked={selection.role === value}
                onChange={() => onChange({ ...selection, role: value })}
              />
              <span className="raffle-role-label">{label}</span>
            </label>
          ))}
        </fieldset>
        <RaffleSelect
          variant="package"
          label="Filtrar por paquete"
          options={[
            { value: "", label: "Todos los paquetes" },
            ...packages.map(name => ({ value: name, label: name })),
          ]}
          value={selection.packageName}
          disabled={disabled || !packages.length}
          onChange={packageName => onChange({ ...selection, packageName })}
        />
        <label className="raffle-payment">
          <input
            type="checkbox"
            name="paymentConfirmed"
            checked={selection.paymentConfirmed}
            onChange={e => onChange({ ...selection, paymentConfirmed: e.target.checked })}
          />
          Solo con pago confirmado
        </label>
      </fieldset>
    </div>
  )
}
