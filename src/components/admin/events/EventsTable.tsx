import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { useState } from "react"
import { toast } from "sonner"

import { customFilterFn, SearchInput, TablePagination } from "@/components/admin/TableUtils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Toaster } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import useEvents from "@/hooks/admin/useEvents"

import { EventDialog } from "./EventDialog"

export interface AdminEvent {
  id: number
  name: string
  slug: string
  date: string
  registration_open: boolean
  packages: string[]
}

export function EventsTable() {
  const [globalFilter, setGlobalFilter] = useState("")

  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<AdminEvent | null>(null)

  const { events, isLoading } = useEvents()

  const queryClient = useQueryClient()

  const toggleRegistrationMutation = useMutation({
    mutationFn: async ({
      event,
      registration_open,
    }: {
      event: AdminEvent
      registration_open: boolean
    }) => {
      const response = await fetch("/api/events", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...event, registration_open }),
      })

      if (!response.ok) throw new Error("Error HTTP al actualizar el evento")
    },
    onMutate: async ({ event, registration_open }) => {
      await queryClient.cancelQueries({ queryKey: ["events"] })

      const previousEvents = queryClient.getQueriesData<AdminEvent[]>({
        queryKey: ["events"],
      })

      queryClient.setQueriesData<AdminEvent[]>({ queryKey: ["events"] }, old =>
        old?.map(item => (item.id === event.id ? { ...item, registration_open } : item))
      )

      return { previousEvents }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousEvents) {
        for (const [key, data] of context.previousEvents) {
          queryClient.setQueryData(key, data)
        }
      }
      toast.error("Error al actualizar el registro del evento")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] })
    },
  })

  const columnHelper = createColumnHelper<AdminEvent>()

  const columns = [
    columnHelper.accessor("date", {
      header: "Fecha",
      enableGlobalFilter: false,
      cell: info => {
        const [year, month, day] = info.getValue().split("-")
        return `${day}/${month}/${year}`
      },
    }),
    columnHelper.accessor("name", { header: "Nombre", filterFn: "includesString" }),
    columnHelper.accessor("slug", {
      header: "Slug",
      filterFn: "includesString",
      cell: info => <span className="font-monospace">{info.getValue()}</span>,
    }),
    columnHelper.accessor("registration_open", {
      header: "Registro abierto",
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const event = row.original
        const isPending =
          toggleRegistrationMutation.isPending &&
          toggleRegistrationMutation.variables?.event.id === event.id

        return (
          <div className="grid place-content-center">
            <Checkbox
              aria-label={`Alternar registro abierto de ${event.name}`}
              checked={event.registration_open}
              disabled={isPending}
              onCheckedChange={checked => {
                if (typeof checked === "boolean") {
                  toggleRegistrationMutation.mutate({ event, registration_open: checked })
                }
              }}
            />
          </div>
        )
      },
    }),
    columnHelper.accessor("packages", {
      header: "Paquetes Disponibles",
      enableGlobalFilter: false,
      cell: ({ row }) => row.original.packages.join(", "),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          className="rounded-sm"
          onClick={() => {
            setSelectedEvent(row.original)
            setDialogOpen(true)
          }}
        >
          Editar
        </Button>
      ),
    }),
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
    autoResetPageIndex: false,
  })

  function openCreateDialog() {
    setSelectedEvent(null)
    setDialogOpen(true)
  }

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex mb-4 gap-2">
        <SearchInput
          placeholder="Buscar por nombre o slug..."
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />

        <Button className="bg-blue-500 rounded-sm" onClick={openCreateDialog}>
          Nuevo Evento
        </Button>
      </div>

      <TablePagination table={table} />

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

      <EventDialog
        open={dialogOpen}
        event={selectedEvent}
        onCancel={() => {
          setSelectedEvent(null)
          setDialogOpen(false)
        }}
      />
    </div>
  )
}
