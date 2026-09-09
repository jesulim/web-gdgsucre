import { Loader2Icon, PlusIcon } from "lucide-react"
import { type ComponentProps, useMemo, useState } from "react"

import { Button } from "@/components/ui/button"

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { type Community, useCommunities } from "@/hooks/useCommunities"
import type { NewCommunityFormValues } from "@/lib/validators/calendarEvent"

import { NewCommunityDialog } from "./NewCommunityDialog"

interface CommunityComboboxProps {
  value: Community | null
  onChange: (community: Community | null) => void
  onCreateCommunity: (values: NewCommunityFormValues) => void
  disabled?: boolean
  inputProps?: ComponentProps<typeof ComboboxInput>
}

export function CommunityCombobox({
  value,
  onChange,
  onCreateCommunity,
  disabled,
  inputProps,
}: CommunityComboboxProps) {
  const [search, setSearch] = useState("")
  const [comboOpen, setComboOpen] = useState(false)
  const [newOpen, setNewOpen] = useState(false)
  const { communities, isFetching } = useCommunities(search)

  const items = useMemo(() => {
    // Keep the selected community visible for new communities.
    if (!value || communities.some(community => community.id === value.id)) return communities
    return [...communities, value]
  }, [communities, value])

  function handleCreateCommunity(values: NewCommunityFormValues) {
    onCreateCommunity(values)
    // Close the popup so Next/Enter advances through the form instead of
    // submitting it while the combobox is still expanded.
    setComboOpen(false)
  }

  return (
    <>
      <Combobox
        items={items}
        value={value}
        open={comboOpen}
        onOpenChange={setComboOpen}
        onValueChange={next => {
          onChange(next)
          // Reset the filter after a selection so the next open shows all results.
          if (next) setSearch("")
        }}
        itemToStringLabel={(community: Community) => community.name}
        itemToStringValue={(community: Community) => community.name}
        onInputValueChange={setSearch}
        filter={null}
        disabled={disabled}
      >
        <ComboboxInput
          {...inputProps}
          placeholder="Buscar comunidad..."
          disabled={disabled}
          showClear={!!value}
          className="border-white rounded-none"
        />
        <ComboboxContent className="font-monospace rounded-none">
          {isFetching ? (
            <div className="text-muted-foreground flex items-center gap-2 px-2 py-3 text-sm">
              <Loader2Icon className="size-4 animate-spin" /> Buscando...
            </div>
          ) : communities.length === 0 ? (
            <div className="p-2 border border-white">
              <p className="text-muted-foreground p-2 text-sm">Sin resultados</p>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={disabled}
                onClick={() => setNewOpen(true)}
                className="shrink-0 rounded-none border bg-white text-black hover:bg-white"
                aria-label="Agregar nueva comunidad"
              >
                <PlusIcon className="size-4" /> Nueva comunidad
              </Button>
            </div>
          ) : (
            <ComboboxList className="border border-white">
              {community => (
                <ComboboxItem key={community.id} value={community}>
                  {community.name}
                </ComboboxItem>
              )}
            </ComboboxList>
          )}
        </ComboboxContent>
      </Combobox>
      <NewCommunityDialog
        open={newOpen}
        onOpenChange={setNewOpen}
        onCreate={handleCreateCommunity}
      />
    </>
  )
}
