import { useMutation } from "@tanstack/react-query"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Loader2Icon } from "lucide-react"
import { useEffect, useRef, useState } from "react"
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
  lunch: boolean
  check_in: boolean
  refreshment: boolean
  package_delivered: boolean
}

const defaultAccreditations: AccreditationData[] = []

export function AccreditationTable() {
  const searchInputRef = useRef<HTMLInputElement>(null)
  const [globalFilter, setGlobalFilter] = useState("")

  const [eventSlug, setEventSlug] = useState("")
  const [role, setRole] = useState<string>("Todos")

  const { events } = useEvents()
  const { accreditations, isLoading, refetch } = useAccreditations({ slug: eventSlug, role })
  const { mutateAsync: updateAccreditation } = useUpdateAccreditation()

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

  useEffect(() => {
    if (events?.length > 0 && !eventSlug) {
      setEventSlug(events[0].slug)
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

  const columns: ColumnDef<AccreditationData>[] = [
    {
      id: "number",
      header: "#",
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const filteredRows = table.getFilteredRowModel().rows
        const index = filteredRows.findIndex(r => r.id === row.id)
        return <span className="text-gray-600">{index + 1}</span>
      },
    },
    {
      accessorKey: "first_name",
      header: "Nombre(s)",
      filterFn: "includesString",
    },
    {
      accessorKey: "last_name",
      header: "Apellido(s)",
      filterFn: "includesString",
    },
    {
      accessorKey: "role",
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
    },
    {
      id: "package",
      header: "Paquete",
      enableGlobalFilter: false,
      cell: ({ row }) => <span>{row.original.package?.split(" (")[0]}</span>,
    },
    {
      accessorKey: "dietary_restriction",
      header: "Restricción alimentaria",
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const restriction = row.getValue("dietary_restriction") as string
        if (!restriction || restriction === "Ninguna") return <span>-</span>

        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block max-w-[200px] truncate">{restriction}</span>
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px]">
                <p>{restriction}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      },
    },
    {
      id: "check_in",
      header: "Check-in",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.check_in}
          onCheckedChange={checked =>
            updateCheckbox(row.original.id, eventSlug, "check_in", !!checked)
          }
        />
      ),
    },
    {
      id: "package_delivered",
      header: "Paquete entregado",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.package_delivered}
          onCheckedChange={checked =>
            updateCheckbox(row.original.id, eventSlug, "package_delivered", !!checked)
          }
        />
      ),
    },
    {
      id: "lunch",
      header: "Almuerzo entregado",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.lunch}
          onCheckedChange={checked =>
            updateCheckbox(row.original.id, eventSlug, "lunch", !!checked)
          }
        />
      ),
    },
    {
      id: "refreshment",
      header: "Refrigerio entregado",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Checkbox
          checked={row.original.refreshment}
          onCheckedChange={checked =>
            updateCheckbox(row.original.id, eventSlug, "refreshment", !!checked)
          }
        />
      ),
    },
  ]

  const table = useReactTable({
    data: accreditations ?? defaultAccreditations,
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

  const stats = {
    total: accreditations?.length || 0,
    checkedIn: accreditations?.filter(item => item.check_in).length || 0,
    packagesDelivered: accreditations?.filter(item => item.package_delivered).length || 0,
    lunchDelivered: accreditations?.filter(item => item.lunch).length || 0,
    refreshmentDelivered: accreditations?.filter(item => item.refreshment).length || 0,
  }

  return (
    <div>
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row justify-between mb-4">
        <EventSelector events={events} eventSlug={eventSlug} setEventSlug={setEventSlug} />
        <AccreditationStats stats={stats} />
      </div>

      <div className="flex gap-2 mb-4">
        <SearchInput
          placeholder="Buscar por nombre o apellido..."
          searchInputRef={searchInputRef}
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

        <Button className="bg-blue-500 rounded-sm" onClick={() => refetch()}>
          {isLoading && <Loader2Icon className="animate-spin" />}
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
    <div className="flex flex-wrap text-nowrap gap-2 items-center text-sm">
      <span>Total: {stats.total}</span>
      <span>Check-in: {stats.checkedIn}</span>
      <span>Paquetes: {stats.packagesDelivered}</span>
      <span>Almuerzos: {stats.lunchDelivered}</span>
      <span>Refrigerios: {stats.refreshmentDelivered}</span>
    </div>
  )
}
