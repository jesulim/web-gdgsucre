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
import { useEffect, useState } from "react"
import { toast } from "sonner"

import EventSelector from "@/components/admin/EventSelector"
import { customFilterFn, SearchInput, TablePagination } from "@/components/admin/TableUtils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Toaster } from "@/components/ui/sonner"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

import useAccreditations, { useUpdateAccreditation } from "@/hooks/useAccreditations"
import useEvents from "@/hooks/useEvents"

interface AccreditationData {
  id: number
  slug: string
  first_name: string
  last_name: string
  role: string
  status: string
  package?: string
  dietary_restriction?: string
  check_in: boolean
  package_delivered?: boolean
  refreshment?: boolean
  lunch?: boolean
}

const defaultAccreditations: AccreditationData[] = []

export function AccreditationTable() {
  const [globalFilter, setGlobalFilter] = useState("")

  const [columnVisibility, setColumnVisibility] = useState({
    check_in: true,
    package_delivered: true,
    refreshment: true,
    lunch: true,
  })

  const [eventSlug, setEventSlug] = useState("")
  const [role, setRole] = useState<string>("Todos")

  const { events } = useEvents()
  const {
    data: accreditations,
    isLoading,
    isFetching,
    refetch,
  } = useAccreditations({ slug: eventSlug, role })
  const { mutateAsync: updateAccreditation } = useUpdateAccreditation()

  useEffect(() => {
    if (events?.length > 0 && !eventSlug) {
      setEventSlug(events[0].slug)
    }

    // show columns based on event activities
    if (eventSlug) {
      const event = events.find(event => event.slug === eventSlug)
      const activities = event?.activities ?? []

      if (activities) {
        setColumnVisibility({
          check_in: activities.includes("check_in"),
          package_delivered: activities.includes("package_delivered"),
          refreshment: activities.includes("refreshment"),
          lunch: activities.includes("lunch"),
        })
      }
    }
  }, [events, eventSlug])

  const updateCheckbox = async (
    id: number,
    eventSlug: string,
    field: keyof AccreditationData,
    value: boolean
  ) => {
    // Actualización optimista: actualizar UI inmediatamente
    try {
      await updateAccreditation({ id, eventSlug, field, value, params: { slug: eventSlug, role } })
    } catch (error) {
      toast.error("Error al actualizar")
      console.error("Error updating checkbox:", error)
    }
  }

  const columnHelper = createColumnHelper<AccreditationData>()
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
    columnHelper.accessor("first_name", { header: "Nombre(s)", filterFn: "includesString" }),
    columnHelper.accessor("last_name", { header: "Apellido(s)", filterFn: "includesString" }),
    columnHelper.accessor("role", {
      header: "Rol",
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const role = row.getValue("role") as string
        return (
          <span
            className={`rounded-sm py-1 px-2 text-sm ${
              role === "Organizer" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
            }`}
          >
            {role === "Organizer" ? "Organizador" : "Participante"}
          </span>
        )
      },
    }),
    columnHelper.accessor("package", {
      header: "Paquete",
      enableGlobalFilter: false,
      cell: info => info.getValue()?.split(" (")[0] ?? info.getValue(),
    }),
    columnHelper.accessor("dietary_restriction", {
      header: "Restricción alimentaria",
      enableGlobalFilter: false,
      cell: info => {
        const restriction = info.getValue() as string
        if (!restriction || restriction === "Ninguna") return <span>-</span>

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block max-w-50 truncate">{restriction}</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-75">
                <p>{restriction}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    }),
    columnHelper.accessor("check_in", {
      header: "Check-in",
      enableGlobalFilter: false,
      cell: info => (
        <Checkbox
          checked={info.getValue()}
          onCheckedChange={checked =>
            updateCheckbox(info.row.original.id, eventSlug, "check_in", !!checked)
          }
        />
      ),
    }),
    columnHelper.accessor("package_delivered", {
      header: "Paquete entregado",
      enableGlobalFilter: false,
      cell: info => (
        <Checkbox
          checked={info.getValue()}
          onCheckedChange={checked =>
            updateCheckbox(info.row.original.id, eventSlug, "package_delivered", !!checked)
          }
        />
      ),
    }),
    columnHelper.accessor("lunch", {
      header: "Almuerzo entregado",
      enableGlobalFilter: false,
      cell: info => (
        <Checkbox
          checked={info.getValue()}
          onCheckedChange={checked =>
            updateCheckbox(info.row.original.id, eventSlug, "lunch", !!checked)
          }
        />
      ),
    }),
    columnHelper.accessor("refreshment", {
      header: "Refrigerio entregado",
      enableGlobalFilter: false,
      cell: info => (
        <Checkbox
          checked={info.getValue()}
          onCheckedChange={checked =>
            updateCheckbox(info.row.original.id, eventSlug, "refreshment", !!checked)
          }
        />
      ),
    }),
  ]

  const table = useReactTable({
    data: accreditations ?? defaultAccreditations,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: customFilterFn,
    autoResetPageIndex: false,
    initialState: {
      pagination: { pageSize: 12 },
    },
    state: {
      globalFilter,
      columnVisibility,
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  const stats = accreditations?.reduce(
    (acc, item: AccreditationData) => ({
      total: acc.total + 1,
      checkedIn: acc.checkedIn + (item.check_in ? 1 : 0),
      packagesDelivered: acc.packagesDelivered + (item.package_delivered ? 1 : 0),
      lunchDelivered: acc.lunchDelivered + (item.lunch ? 1 : 0),
      refreshmentDelivered: acc.refreshmentDelivered + (item.refreshment ? 1 : 0),
    }),
    { total: 0, checkedIn: 0, packagesDelivered: 0, lunchDelivered: 0, refreshmentDelivered: 0 }
  ) ?? { total: 0, checkedIn: 0, packagesDelivered: 0, lunchDelivered: 0, refreshmentDelivered: 0 }

  return (
    <div>
      <Toaster position="top-right" />

      <div className="grid sm:grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_1fr_auto_auto] gap-2 mb-4">
        <div className="col-span-2 sm:col-span-3 md:col-span-1">
          <EventSelector events={events} eventSlug={eventSlug} setEventSlug={setEventSlug} />
        </div>

        <SearchInput
          placeholder="Buscar por nombre o apellido..."
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />

        <Select onValueChange={value => setRole(value)} defaultValue="Todos">
          <SelectTrigger>
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Participante">Participantes</SelectItem>
            <SelectItem value="Organizer">Organizadores</SelectItem>
          </SelectContent>
        </Select>

        <Button
          className="bg-blue-500 rounded-sm col-span-2 sm:col-span-1"
          onClick={() => refetch()}
        >
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
                  {isLoading ? "Obteniendo datos de acreditación..." : "Sin resultados."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <AccreditationStats stats={stats} />
    </div>
  )
}

function AccreditationStats({
  stats,
}: {
  stats: {
    total: number
    checkedIn: number
    packagesDelivered: number
    lunchDelivered: number
    refreshmentDelivered: number
  }
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center text-nowrap sm:gap-2 my-4 text-sm">
      <span className="font-medium">Total registros: {stats.total}</span>
      <span>Check-in: {stats.checkedIn}</span>
      <span>Paquetes: {stats.packagesDelivered}</span>
      <span>Almuerzos: {stats.lunchDelivered}</span>
      <span>Refrigerios: {stats.refreshmentDelivered}</span>
    </div>
  )
}
