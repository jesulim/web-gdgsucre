import { CheckIcon, ChevronsUpDownIcon, Loader2Icon } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useCommunities } from "@/hooks/useCommunities"
import { cn } from "@/lib/utils"

interface CommunityComboboxProps {
  value: number
  label: string | null
  onChange: (id: number, label: string) => void
  disabled?: boolean
}

export function CommunityCombobox({ value, label, onChange, disabled }: CommunityComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const { communities, isFetching } = useCommunities(search)

  return (
    <Popover
      open={open}
      onOpenChange={next => {
        setOpen(next)
        if (!next) setSearch("")
      }}
    >
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between rounded-none border-black font-monospace font-normal normal-case",
            !label && "text-muted-foreground"
          )}
        >
          <span className="truncate">{label ?? "comunidad organizadora"}</span>
          <ChevronsUpDownIcon className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-[var(--radix-popover-trigger-width)] rounded-none border-black p-0"
      >
        <div className="border-b border-black p-2">
          <Input
            autoFocus
            placeholder="Buscar comunidad..."
            value={search}
            onChange={event => setSearch(event.target.value)}
            className="rounded-none border-black"
          />
        </div>
        <div role="listbox" aria-label="Comunidades" className="max-h-60 overflow-y-auto p-1">
          {isFetching && communities.length === 0 && (
            <div className="text-muted-foreground flex items-center gap-2 px-2 py-3 text-sm">
              <Loader2Icon className="size-4 animate-spin" /> Buscando...
            </div>
          )}
          {!isFetching && communities.length === 0 && (
            <div className="text-muted-foreground px-2 py-3 text-sm">Sin resultados</div>
          )}
          {communities.map(community => (
            <button
              key={community.id}
              type="button"
              role="option"
              aria-selected={community.id === value}
              onClick={() => {
                onChange(community.id, community.name)
                setOpen(false)
              }}
              className="hover:bg-off-white flex w-full items-center gap-2 px-2 py-2 text-left text-sm"
            >
              <CheckIcon
                className={cn(
                  "size-4 shrink-0",
                  community.id === value ? "opacity-100" : "opacity-0"
                )}
              />
              {community.name}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  )
}
