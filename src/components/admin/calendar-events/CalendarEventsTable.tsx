import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Loader2Icon } from "lucide-react"
import { useState } from "react"

import {
  customFilterFn,
  DateCell,
  SearchInput,
  TablePagination,
} from "@/components/admin/TableUtils"
import { Button } from "@/components/ui/button"
import { Toaster } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { useAdminCalendarEvents } from "@/hooks/useAdminCalendarEvents"
import CalendarEventRowActions from "./CalendarEventRowActions"

export interface CalendarEvent {
  id: number
  created_at: string
  name: string
  community_id: number
  communities: {
    id: number
    name: string
    short_name: string | null
  } | null
  start_datetime: string
  end_datetime: string
  format: string | null
  registration_link: string | null
  location: string | null
  accepted: boolean
}

const ACCEPTED_STYLES: {
  [key: string]: { colors: string; label: string }
} = {
  false: { colors: "bg-blue-100 text-blue-600", label: "Pendiente" },
  true: { colors: "bg-green-100 text-green-600", label: "Aceptado" },
}

function StatusBadge({ accepted }: { accepted: boolean }) {
  const { colors, label } = ACCEPTED_STYLES[String(accepted)] || {
    colors: "bg-gray-100 text-gray-600",
    label: "Desconocido",
  }
  return <span className={`rounded-sm py-1 px-2 ${colors}`}>{label}</span>
}

const FORMAT_LABELS: Record<string, string> = {
  "in-person": "Presencial",
  virtual: "Virtual",
}

function DateTimeCell({ value }: { value: string }) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return <span>-</span>

  const formatter = new Intl.DateTimeFormat("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })

  return <span className="text-nowrap">{formatter.format(date)}</span>
}

const defaultCalendarEvents: CalendarEvent[] = []

export function CalendarEventsTable() {
  const [globalFilter, setGlobalFilter] = useState("")

  const { calendarEvents, isLoading, isFetching, refetch } = useAdminCalendarEvents()

  const columnHelper = createColumnHelper<CalendarEvent>()

  const columns = [
    columnHelper.display({
      id: "rowNumber",
      header: "#",
      cell: ({ row }) => {
        const filteredRows = table.getFilteredRowModel().rows
        const index = filteredRows.findIndex(r => r.id === row.id)
        return <span className="text-gray-600">{index + 1}</span>
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Fecha de solicitud",
      cell: info => <DateCell value={info.getValue()} />,
    }),
    columnHelper.accessor("name", { header: "Evento", filterFn: "includesString" }),
    columnHelper.accessor(row => row.communities?.short_name || row.communities?.name || "-", {
      id: "community",
      header: "Comunidad",
      filterFn: "includesString",
    }),
    columnHelper.accessor("start_datetime", {
      header: "Inicio",
      cell: info => <DateTimeCell value={info.getValue()} />,
    }),
    columnHelper.accessor("end_datetime", {
      header: "Fin",
      cell: info => <DateTimeCell value={info.getValue()} />,
    }),
    columnHelper.accessor("format", {
      header: "Modalidad",
      enableGlobalFilter: false,
      cell: info => {
        const format = info.getValue()
        return format ? (FORMAT_LABELS[format] ?? format) : "-"
      },
    }),
    columnHelper.accessor("location", {
      header: "Ubicación",
      filterFn: "includesString",
      cell: info => info.getValue() ?? "-",
    }),
    columnHelper.accessor("registration_link", {
      header: "Link de registro",
      cell: info => {
        const link = info.getValue()
        if (!link) return <span className="text-gray-600">-</span>
        return (
          <a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            title={link}
            className="block max-w-36 truncate text-blue-500 hover:underline"
          >
            {link}
          </a>
        )
      },
    }),
    columnHelper.accessor("accepted", {
      header: "Estado",
      enableGlobalFilter: false,
      cell: info => <StatusBadge accepted={info.getValue()} />,
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => <CalendarEventRowActions row={row} refetch={refetch} />,
    }),
  ]

  const table = useReactTable({
    data: calendarEvents ?? defaultCalendarEvents,
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

  return (
    <div>
      <Toaster position="top-right" />

      <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_auto] gap-4 mb-4">
        <SearchInput
          placeholder="Buscar por evento o comunidad..."
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />

        <Button className="bg-blue-500 rounded-sm w-fit" onClick={() => refetch()}>
          {isFetching && <Loader2Icon className="animate-spin" />}
          Actualizar
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
            {table.getRowModel()?.rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
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
    </div>
  )
}
