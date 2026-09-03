import { Loader2Icon } from "lucide-react"
import { useMemo, useState } from "react"

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
}

export function CommunityCombobox({
  value,
  onChange,
  onCreateCommunity,
  disabled,
}: CommunityComboboxProps) {
  const [search, setSearch] = useState("")
  const { communities, isFetching } = useCommunities(search)

  const items = useMemo(() => {
    // Keep the selected community visible for new communities.
    if (!value || communities.some(community => community.id === value.id)) return communities
    return [...communities, value]
  }, [communities, value])

  return (
    <Combobox
      items={items}
      value={value}
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
        placeholder="Buscar comunidad..."
        disabled={disabled}
        showClear={!!value}
        className="border-white rounded-none"
      />
      <ComboboxContent className="font-monospace rounded-none">
        {isFetching && communities.length === 0 ? (
          <div className="text-muted-foreground flex items-center gap-2 px-2 py-3 text-sm">
            <Loader2Icon className="size-4 animate-spin" /> Buscando...
          </div>
        ) : communities.length === 0 ? (
          <div className="p-2 border border-white">
            <p className="text-muted-foreground p-2 text-sm">Sin resultados</p>
            <NewCommunityDialog onCreate={onCreateCommunity} disabled={disabled} />
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
  )
}
