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
import { Loader2Icon, SearchIcon } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Kbd } from "@/components/ui/kbd"
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
import EventSelector from "./EventSelector"

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

function normalizeString(str: string) {
  return str.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase()
}

const customFilterFn = (rows: Row<AccreditationData>, columnId: string, filterValue: string) => {
  const rowValue = rows.getValue(columnId)
  if (typeof rowValue !== "string" || typeof filterValue !== "string") return false
  return normalizeString(rowValue).includes(normalizeString(filterValue))
}

export function AccreditationTable() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AccreditationData[]>()
  const [globalFilter, setGlobalFilter] = useState("")
  const [eventSlug, setEventSlug] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("Todos")
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

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const url = new URL("/api/activities", window.location.origin)
      url.searchParams.set("slug", eventSlug)
      url.searchParams.set("role", roleFilter)

      const response = await fetch(url.toString())
      const result = await response.json()

      const dataArray = Object.values(result) as AccreditationData[]
      setData(dataArray)
    } catch (error) {
      toast.error("Error al cargar los datos de acreditación")
      console.error("Error fetching accreditation data:", error)
    } finally {
      setLoading(false)
    }
  }, [eventSlug, roleFilter])

  useEffect(() => {
    if (!eventSlug) return
    fetchData()
  }, [fetchData, eventSlug])

  const updateCheckbox = async (
    id: number,
    eventSlug: string,
    field: keyof AccreditationData,
    value: boolean
  ) => {
    try {
      toast.info(`Actualizando ${field}...`)

      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
          eventSlug,
          field,
          value,
        }),
      })

      const body = await response.json()

      if (!response.ok) {
        toast.error(body.error || "Error al actualizar")
        await fetchData()
        return
      }

      setData(prevData =>
        prevData?.map(item => (item.id === id ? { ...item, [field]: value } : item))
      )

      toast.success("Actualizado correctamente")
    } catch (error) {
      toast.error("Error al actualizar")
      console.error("Error updating checkbox:", error)
      await fetchData()
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
          disabled={String(row.original.package).startsWith("Sin paquete")}
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
          disabled={String(row.original.package).startsWith("Sin paquete")}
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
          disabled={String(row.original.package).startsWith("Sin paquete")}
          onCheckedChange={checked =>
            updateCheckbox(row.original.id, eventSlug, "refreshment", !!checked)
          }
        />
      ),
    },
  ]

  const table = useReactTable({
    data: data ?? [],
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
    total: data?.length || 0,
    checkedIn: data?.filter(item => item.check_in).length || 0,
    packagesDelivered: data?.filter(item => item.package_delivered).length || 0,
    lunchDelivered: data?.filter(item => item.lunch).length || 0,
    refreshmentDelivered: data?.filter(item => item.refreshment).length || 0,
  }

  return (
    <div className="w-full">
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row justify-between mb-4">
        <EventSelector eventSlug={eventSlug} setEventSlug={setEventSlug} />
        <AccreditationStats stats={stats} />
      </div>

      <div className="flex gap-2 mb-4">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            placeholder="Buscar por nombre o apellido..."
            value={globalFilter ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGlobalFilter(e.target.value)}
            className="pl-9 pr-20"
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex gap-1">
            <Kbd>Ctrl</Kbd>
            <Kbd>K</Kbd>
          </div>
        </div>

        <Select onValueChange={value => setRoleFilter(value)} defaultValue="Todos">
          <SelectTrigger>
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Participante">Participantes</SelectItem>
            <SelectItem value="Organizer">Organizadores</SelectItem>
          </SelectContent>
        </Select>

        <Button className="bg-blue-500 rounded-sm" onClick={() => fetchData()}>
          {loading && <Loader2Icon className="animate-spin" />}
          Actualizar
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
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  {loading ? "Obteniendo datos de acreditación..." : "Sin resultados."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <TablePagination table={table} />
    </div>
  )
}

function TablePagination({ table }: { table: TanstackTable<AccreditationData> }) {
  const firstRow = table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1
  const currentPageRows = table.getRowModel().rows.length
  const lastRow = firstRow + currentPageRows - 1
  const totalRows = table.getCoreRowModel().rows.length

  return (
    table && (
      <div className="flex items-center justify-between space-x-2 py-4">
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
