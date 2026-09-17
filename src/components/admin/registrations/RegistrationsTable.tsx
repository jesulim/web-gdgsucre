import { useQueryClient } from "@tanstack/react-query"
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  useReactTable,
} from "@tanstack/react-table"
import { Loader2Icon } from "lucide-react"
import { useCallback, useState } from "react"
import { toast } from "sonner"

import {
  customFilterFn,
  DateCell,
  SearchInput,
  TablePagination,
} from "@/components/admin/TableUtils"
import { Button } from "@/components/ui/button"

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

import useRegistrations from "@/hooks/admin/useRegistrations"
import RegistrationRowActions from "./RegistrationRowActions"

export interface Registrations {
  id: number
  created_at: string
  first_name: string
  last_name: string
  email: string
  role: string
  status: string
  package: string
  voucher: string
}

const STATUS_STYLES: {
  [key: string]: { colors: string; label: string }
} = {
  pending: { colors: "bg-blue-100 text-blue-600", label: "Pendiente" },
  confirmed: { colors: "bg-green-100 text-green-600", label: "Confirmado" },
}

function StatusBadge({ status }: { status: string }) {
  const { colors, label } = STATUS_STYLES[status] || {
    colors: "bg-gray-100 text-gray-600",
    label: "Desconocido",
  }
  return <span className={`rounded-sm py-1 px-2 ${colors}`}>{label}</span>
}

const defaultRegistrations: Registrations[] = []

function PackageCount({ rows }: { rows: Row<Registrations>[] }) {
  if (!rows.length) return

  const packageCounts: Record<string, { name: string; price: number; qty: number }> = {}

  for (const row of rows) {
    const match = String(row.getValue("package")).match(/^(.*)\s\((\d+).Bs\)$/)
    if (!match) continue
    const [, name, price] = match

    if (!packageCounts[name]) {
      packageCounts[name] = { name, price: Number(price), qty: 0 }
    }
    packageCounts[name].qty++
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center text-nowrap gap-2 my-4 ">
      <span className="font-medium">Cantidad de paquetes:</span>
      <p className="flex gap-2">
        {Object.values(packageCounts)
          .sort((a, b) => a.price - b.price)
          .map(({ name, qty }) => (
            <span key={name}>
              {name}: {qty}
            </span>
          ))}
      </p>
    </div>
  )
}

function StatusCount({ rows }: { rows: Row<Registrations>[] }) {
  if (!rows.length) return
  const statusCounts: Record<string, number> = {}
  for (const row of rows) {
    const status = row.getValue("status") === "confirmed" ? "Confirmado" : "Pendiente"
    if (!statusCounts[status]) statusCounts[status] = 0
    statusCounts[status]++
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center text-nowrap gap-2 my-4 ">
      <span className="font-medium">Total por estado:</span>
      <p className="flex gap-2">
        {Object.entries(statusCounts).map(([status, qty]) => (
          <span key={status}>
            {status}: {qty}
          </span>
        ))}
      </p>
    </div>
  )
}

export function RegistrationsTable({
  eventSlug,
  eventName,
}: {
  eventSlug: string
  eventName: string
}) {
  const [globalFilter, setGlobalFilter] = useState("")

  const { registrations, isLoading, isFetching, refetch } = useRegistrations(eventSlug)
  const queryClient = useQueryClient()

  const switchRole = useCallback(
    async (id: number, role: string) => {
      const queryKey = ["registrations", eventSlug]
      const previous = queryClient.getQueryData<Registrations[]>(queryKey)

      queryClient.setQueryData<Registrations[]>(queryKey, old =>
        old?.map(reg => (reg.id === id ? { ...reg, role } : reg))
      )

      try {
        const res = await fetch("/api/organizers", {
          method: role === "Organizer" ? "POST" : "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ registrationId: id }),
        })
        if (!res.ok) throw new Error("Error HTTP al actualizar el rol")

        toast.success("Rol actualizado")
        await refetch()
      } catch {
        queryClient.setQueryData(queryKey, previous)
        toast.error("Error al actualizar el rol")
      }
    },
    [queryClient, refetch, eventSlug]
  )

  const columnHelper = createColumnHelper<Registrations>()

  const columns = [
    columnHelper.display({
      id: "rowNumber",
      header: "#",
      cell: ({ row }) => {
        const totalRows = table.getCoreRowModel().rows.length
        return <span className="text-gray-600">{totalRows - row.index}</span>
      },
    }),
    columnHelper.accessor("created_at", {
      header: "Fecha de registro",
      cell: info => <DateCell value={info.getValue()} />,
    }),
    columnHelper.accessor("first_name", { header: "Nombre(s)", filterFn: "includesString" }),
    columnHelper.accessor("last_name", { header: "Apellido(s)", filterFn: "includesString" }),
    columnHelper.accessor("email", { header: "Correo electrónico", filterFn: "includesString" }),
    columnHelper.display({
      id: "role",
      header: "Rol",
      cell: ({ row }) => {
        return (
          <Select
            key={row.original.id}
            onValueChange={value => {
              switchRole(row.original.id, value)
            }}
            defaultValue={row.original.role}
          >
            <SelectTrigger>
              <SelectValue placeholder="Rol" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Participante">Participante</SelectItem>
              <SelectItem value="Organizer">Organizer</SelectItem>
            </SelectContent>
          </Select>
        )
      },
    }),
    columnHelper.accessor("status", {
      header: "Estado",
      enableGlobalFilter: false,
      cell: info => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor("package", {
      header: "Paquete",
      enableGlobalFilter: false,
      cell: info => {
        const packageName = info.getValue()
        if (!packageName || packageName === "undefined") return null
        const packageParts = packageName.split(" (")
        return packageParts.length > 1 ? packageParts[0] : packageName
      },
    }),
    columnHelper.accessor("voucher", {
      header: "Comprobante",
      cell: info => {
        const voucher = info.getValue()
        if (typeof voucher !== "string" || !voucher || voucher === "undefined") return null

        return (
          <a
            href={`/api/getSignedUrl?bucket=event-uploads&url=${encodeURIComponent(voucher)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline"
          >
            Revisar
          </a>
        )
      },
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <RegistrationRowActions row={row} eventName={eventName} refetch={refetch} />
      ),
    }),
  ]

  const table = useReactTable({
    data: registrations ?? defaultRegistrations,
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
          placeholder="Buscar por nombre, apellido o correo electrónico..."
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
                  {isLoading ? "Obteniendo registros..." : "Sin resultados."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <PackageCount rows={table.getFilteredRowModel().rows} />
      <StatusCount rows={table.getFilteredRowModel().rows} />
    </div>
  )
}
