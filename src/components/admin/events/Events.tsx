"use client"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  type Table as TanstackTable,
  useReactTable,
} from "@tanstack/react-table"
import { useCallback, useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { EventDialog } from "./EventDialog"

export function Events() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any[]>()
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const url = new URL("/api/events", window.location.origin)
      url.searchParams.set("order", "desc")

      const response = await fetch(url.toString())
      const result = await response.json()

      const dataArray = Object.values(result)
      setData(dataArray)
    } catch (error) {
      console.error("Error fetching events data:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const columns: ColumnDef<any>[] = [
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
    data: data ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: {
      pagination: { pageSize: 12 },
    },
  })

  return (
    <div className="w-full p-4 lg:p-8">
      <div className="flex justify-between mb-4">
        <h2>Eventos</h2>
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
                  {loading ? "Obteniendo eventos..." : "Sin resultados."}
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
