import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useEffect, useRef, useState } from "react"

import { customFilterFn, SearchInput } from "@/components/admin/TableUtils"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import useFetchEvents from "@/hooks/useEvents"

import { EventDialog } from "./EventDialog"

interface Event {
  id: number
  name: string
  slug: string
  date: string
  registration_open: boolean
  packages: string[]
}

export function Events() {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [globalFilter, setGlobalFilter] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)

  const { events, isLoading } = useFetchEvents()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault()
        searchInputRef.current?.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  const columns: ColumnDef<Event>[] = [
    {
      accessorKey: "name",
      header: "Nombre",
      filterFn: "includesString",
    },
    {
      accessorKey: "slug",
      header: "Slug",
      filterFn: "includesString",
    },
    {
      accessorKey: "date",
      header: "Fecha",
      enableGlobalFilter: false,
    },
    {
      accessorKey: "registration_open",
      header: "Registro abierto",
      enableGlobalFilter: false,
      cell: ({ row }) => (row.original.registration_open ? "Sí" : "No"),
    },
    {
      accessorKey: "packages",
      header: "Paquetes Disponibles",
      enableGlobalFilter: false,
      cell: ({ row }) => row.original.packages.join(", "),
    },
  ]

  const table = useReactTable({
    data: events,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: customFilterFn,
    initialState: {
      pagination: { pageSize: 12 },
    },
    state: {
      globalFilter,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div>
      <div className="flex mb-4 gap-2">
        <SearchInput
          placeholder="Buscar por nombre o slug..."
          searchInputRef={searchInputRef}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />

        <Button className="bg-blue-500 rounded-sm" onClick={() => setDialogOpen(true)}>
          Nuevo Evento
        </Button>
      </div>

      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id} className="h-14">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {isLoading ? "Obteniendo eventos..." : "Sin resultados."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EventDialog open={dialogOpen} event={null} onCancel={() => setDialogOpen(false)} />
    </div>
  )
}
