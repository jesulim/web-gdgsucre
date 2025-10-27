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
import { Loader2Icon } from "lucide-react"
import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
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

function PackageFilter({
  rows,
  packageFilter,
  setPackageFilter,
}: {
  rows: Row<AccreditationData>[]
  packageFilter: string
  setPackageFilter: (value: string) => void
}) {
  if (!rows.length) return

  const packages = new Set<string>(rows.map(row => row.getValue("package")))

  return (
    <Select onValueChange={value => setPackageFilter(value)} defaultValue={packageFilter}>
      <SelectTrigger>
        <SelectValue placeholder="Paquete" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="Todos los paquetes">Todos los paquetes</SelectItem>
        {Array.from(packages).map(name => (
          <SelectItem key={name} value={name}>
            {name.split(" (")[0]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

export function AccreditationTable() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<AccreditationData[]>()
  const [globalFilter, setGlobalFilter] = useState("")
  const [eventSlug, setEventSlug] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("Todos")
  const [packageFilter, setPackageFilter] = useState<string>("Todos los paquetes")

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const url = new URL("/api/activities", window.location.origin)
      url.searchParams.set("slug", eventSlug)
      url.searchParams.set("role", roleFilter)
      url.searchParams.set("package", packageFilter)

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
  }, [eventSlug, roleFilter, packageFilter])

  useEffect(() => {
    if (!eventSlug) return
    fetchData()
  }, [fetchData, eventSlug])

  const updateCheckbox = async (id: number, field: keyof AccreditationData, value: boolean) => {
    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id,
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
      accessorKey: "package",
      header: "Paquete",
      enableGlobalFilter: false,
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
          onCheckedChange={checked => updateCheckbox(row.original.id, "check_in", !!checked)}
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
            updateCheckbox(row.original.id, "package_delivered", !!checked)
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
          onCheckedChange={checked => updateCheckbox(row.original.id, "lunch", !!checked)}
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
          onCheckedChange={checked => updateCheckbox(row.original.id, "refreshment", !!checked)}
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

      <div className="flex gap-2">
        <Input
          placeholder="Buscar por nombre o apellido..."
          value={globalFilter ?? ""}
          onChange={e => setGlobalFilter(e.target.value)}
          className="mb-4 w-full"
        />

        <PackageFilter
          rows={table.getRowModel().rows}
          packageFilter={packageFilter}
          setPackageFilter={setPackageFilter}
        />

        <Select onValueChange={value => setRoleFilter(value)} defaultValue="Todos">
          <SelectTrigger>
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Todos">Todos</SelectItem>
            <SelectItem value="Participante">Participantes</SelectItem>
            <SelectItem value="Organizer">Organizers</SelectItem>
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
