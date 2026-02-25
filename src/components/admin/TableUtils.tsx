import type { Row, RowData, Table } from "@tanstack/react-table"
import { SearchIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"

function normalizeString(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

export function customFilterFn(rows: Row<RowData>, columnId: string, filterValue: string) {
  const rowValue = rows.getValue(columnId)
  if (typeof rowValue !== "string" || typeof filterValue !== "string") return false
  return normalizeString(rowValue).includes(normalizeString(filterValue))
}

export function SearchInput({
  placeholder,
  searchInputRef,
  globalFilter,
  setGlobalFilter,
}: {
  placeholder: string
  searchInputRef: React.RefObject<HTMLInputElement | null>
  globalFilter: string
  setGlobalFilter: (value: string) => void
}) {
  return (
    <div className="relative flex-1">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        ref={searchInputRef}
        value={globalFilter ?? ""}
        onChange={e => setGlobalFilter(e.target.value)}
        className="pl-9 pr-20"
      />
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </div>
    </div>
  )
}

export function TablePagination({ table }: { table: Table<RowData> }) {
  const totalRows = table.getCoreRowModel().rows.length
  if (totalRows === 0) {
    return null
  }

  const firstRow = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
  const currentPageRows = table.getRowModel().rows.length
  const lastRow = firstRow + currentPageRows - 1

  return (
    table && (
      <div className="flex items-center justify-between space-x-2 pb-2">
        <p>
          Mostrando {firstRow}-{lastRow} de {totalRows} registros.
        </p>

        <div className="flex flex-nowrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>
        </div>
      </div>
    )
  )
}
