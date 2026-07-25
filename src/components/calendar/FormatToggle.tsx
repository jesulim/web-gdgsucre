import { cn } from "@/lib/utils"
import type { EventFormat } from "@/lib/validators/calendarEvent"

interface FormatToggleProps {
  value: EventFormat
  onChange: (value: EventFormat) => void
  disabled?: boolean
  name?: string
}

const OPTIONS: { value: EventFormat; label: string }[] = [
  { value: "in-person", label: "Presencial" },
  { value: "virtual", label: "Virtual" },
]

export function FormatToggle({ value, onChange, disabled, name = "format" }: FormatToggleProps) {
  return (
    <div className="flex border">
      {OPTIONS.map((option, index) => (
        <label
          key={option.value}
          className={cn(
            "flex-1 cursor-pointer px-4 py-3 text-center text-sm font-bold transition-colors has-disabled:cursor-not-allowed has-disabled:opacity-50",
            index > 0 && "border-l",
            value === option.value ? "bg-lime-300 text-black" : "text-white hover:bg-white/10"
          )}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            disabled={disabled}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          {option.label}
        </label>
      ))}
    </div>
  )
}
