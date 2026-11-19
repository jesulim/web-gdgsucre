import { Check, ChevronDown } from "lucide-react"
import { Select } from "radix-ui"
import { useState } from "react"

export function RaffleSelect({
  options,
  label,
  value,
  disabled,
  variant,
  onChange,
}: {
  options: { value: string; label: string }[]
  label: string
  value: string
  disabled: boolean
  variant: "event" | "package"
  onChange: (value: string) => void
}) {
  const [restoredFocus, setRestoredFocus] = useState(false)
  const name = options.find(option => option.value === value)?.label

  // Radix reserves an empty value for placeholders; our empty filter means "all".
  return (
    <Select.Root
      value={`:${value}`}
      disabled={disabled}
      onValueChange={key => onChange(key.slice(1))}
    >
      <Select.Trigger
        className={`raffle-select-trigger raffle-${variant}-trigger`}
        aria-label={`${label}: ${name}`}
        data-restored-focus={restoredFocus || undefined}
        onBlur={() => setRestoredFocus(false)}
      >
        <Select.Value>{name}</Select.Value>
        <Select.Icon asChild>
          <ChevronDown size={variant === "event" ? 20 : 16} aria-hidden="true" />
        </Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content
          className="raffle-event-menu"
          position="popper"
          align="start"
          sideOffset={4}
          collisionPadding={16}
          onCloseAutoFocus={() => setRestoredFocus(true)}
        >
          <Select.Viewport className="raffle-event-options">
            {options.map(option => (
              <Select.Item
                className="raffle-event-option"
                key={option.value}
                value={`:${option.value}`}
              >
                <Select.ItemText>{option.label}</Select.ItemText>
                <Select.ItemIndicator>
                  <Check size={16} aria-hidden="true" />
                </Select.ItemIndicator>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  )
}
