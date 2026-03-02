import type { Row, RowData, Table } from "@tanstack/react-table"
import { ChevronLeft, ChevronRight, SearchIcon } from "lucide-react"
import { useEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"

import { useIsMobile } from "@/hooks/use-mobile"

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
  globalFilter,
  setGlobalFilter,
}: {
  placeholder: string
  globalFilter: string
  setGlobalFilter: (value: string) => void
}) {
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Agregar atajo de teclado Ctrl+K para enfocar el buscador
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "k") {
        event.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div className="relative flex-1">
      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        ref={searchInputRef}
        value={globalFilter ?? ""}
        onChange={e => setGlobalFilter(e.target.value)}
        className="pl-9 lg:pr-20"
      />
      <div className="hidden md:flex absolute right-2 top-1/2 transform -translate-y-1/2  gap-1">
        <Kbd>Ctrl</Kbd>
        <Kbd>K</Kbd>
      </div>
    </div>
  )
}
export function DateCell({ value }: { value: string }) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return <span>-</span>

  const formatter = new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  })

  return <span>{formatter.format(date)}</span>
}

export function TablePagination({ table }: { table: Table<RowData> }) {
  const isMobile = useIsMobile()

  const totalRows = table.getCoreRowModel().rows.length
  if (totalRows === 0 || !table) {
    return null
  }

  const firstRow = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
  const currentPageRows = table.getRowModel().rows.length
  const lastRow = firstRow + currentPageRows - 1

  return (
    <div className="flex items-center justify-between pb-2">
      <p>
        Mostrando {firstRow}-{lastRow} de {totalRows} registros.
      </p>

      <div className="flex flex-nowrap gap-2">
        <Button
          aria-label="Página Anterior"
          variant="outline"
          size={isMobile ? "icon" : "sm"}
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          <ChevronLeft aria-hidden="true" />
          <span className="hidden md:inline">Anterior</span>
        </Button>
        <Button
          aria-label="Página Siguiente"
          variant="outline"
          size={isMobile ? "icon" : "sm"}
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          <span className="hidden md:inline">Siguiente</span>
          <ChevronRight aria-hidden="true" />
        </Button>
      </div>
    </div>
  )
}
