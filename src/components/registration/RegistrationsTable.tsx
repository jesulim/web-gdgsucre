import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import {
  type ColumnDef,
  type Row,
  type Table as TanstackTable,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { Loader2Icon, MoreHorizontal, SendHorizonal, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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

interface Registrations {
  id: number
  created_at: string
  status: string
  role: string
  first_name: string
  last_name: string
  email: string
  package: string
  voucher: string
}

const STATUS_STYLES: {
  [key: string]: { colors: string; label: string }
} = {
  pending: { colors: "bg-blue-100 text-blue-600", label: "Pendiente" },
  confirmed: { colors: "bg-green-100 text-green-600", label: "Confirmado" },
}

function normalizeString(str: string) {
  return (
    str
      .normalize("NFD")
      // biome-ignore lint/suspicious/noMisleadingCharacterClass:
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
  )
}

const customFilterFn = (rows: Row<Registrations>, columnId: string, filterValue: string) => {
  const rowValue = rows.getValue(columnId)
  if (typeof rowValue !== "string" || typeof filterValue !== "string") return false
  return normalizeString(rowValue).includes(normalizeString(filterValue))
}

function StatusBadge({ row }: { row: Row<Registrations> }) {
  const status = String(row.getValue("status"))
  const { colors, label } = STATUS_STYLES[status] || {
    color: "bg-gray-100 text-gray-600",
    label: "Desconocido",
  }
  return <span className={`rounded-sm py-1 px-2 ${colors}`}>{label}</span>
}

export function RegistrationsTable() {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<Registrations[]>()
  const [globalFilter, setGlobalFilter] = useState("")

  const fetchData = useCallback(async () => {
    setLoading(true)
    const response = await fetch("/api/registrations?slug=io-extended-25")
    const result = await response.json()
    setData(result)
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const sendConfirmationEmail = async (id: number, email: string, name: string) => {
    toast.info(`Enviando email de confirmación a ${email}...`)

    const response = await fetch("/api/sendPaymentConfirmation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        registrationId: id,
        userEmail: email,
        userName: name,
        eventName: "I/O Extended Sucre 2025",
      }),
    })

    const body = await response.json()
    if (body.success) {
      toast.success("Email enviado exitosamente")
      await fetchData()
    } else {
      toast.error(body.details)
    }
  }

  const switchRole = async (id: number, role: string) => {
    const response = await fetch("/api/registrations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        registrationId: id,
        values: { role },
      }),
    })

    const body = await response.json()
    if (!response.ok) {
      toast.error(body.details)
      await fetchData()
    }
  }

  const deleteRegistration = async (id: number) => {
    const confirmed = window.confirm(
      "¿Estás seguro de que deseas eliminar este registro? Esta acción no se puede deshacer."
    )
    if (!confirmed) return

    toast.info("Eliminando registro")
    const response = await fetch("/api/registrations", {
      method: "DELETE",
      body: JSON.stringify({ registrationId: id }),
    })
    const body = await response.json()
    if (body.success) {
      toast.success("Registro eliminado exitosamente")
      await fetchData()
    } else {
      toast.error(body.message)
    }
  }

  const columns: ColumnDef<Registrations>[] = [
    {
      accessorKey: "created_at",
      header: "Fecha de registro",
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const created_at = String(row.getValue("created_at"))
        const date = new Date(created_at)
        const formatter = new Intl.DateTimeFormat("es-BO", {
          day: "2-digit",
          month: "2-digit",
          year: "2-digit",
        })

        return <span>{formatter.format(date)}</span>
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
      accessorKey: "email",
      header: "Correo electrónico",
      filterFn: "includesString",
    },
    {
      accessorKey: "phone_number",
      header: "Teléfono",
      enableGlobalFilter: false,
    },
    {
      accessorKey: "role",
      header: "Rol",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <Select
          onValueChange={value => {
            switchRole(row.original.id, value)
          }}
          defaultValue={row.getValue("role")}
        >
          <SelectTrigger>
            <SelectValue placeholder="Rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Participante">Participante</SelectItem>
            <SelectItem value="Organizer">Organizer</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      enableGlobalFilter: false,
      cell: ({ row }) => <StatusBadge row={row} />,
    },
    {
      accessorKey: "package",
      header: "Paquete",
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const packageName = String(row.getValue("package"))
        const packageParts = packageName.split(" (")

        return packageParts.length > 1 ? packageParts[0] : packageName
      },
    },
    {
      accessorKey: "voucher",
      header: "Comprobante",
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <a
          href={`/api/getSignedUrl?bucket=event-uploads&url=${row.getValue("voucher")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline text-center w-full"
        >
          Ver
        </a>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      enableHiding: false,
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const registration = row.original

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              {registration.status === "pending" && (
                <DropdownMenuItem
                  onClick={() =>
                    sendConfirmationEmail(
                      registration.id,
                      registration.email,
                      registration.first_name
                    )
                  }
                >
                  <SendHorizonal />
                  Enviar confirmación de registro
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                variant="destructive"
                onClick={() => deleteRegistration(registration.id)}
              >
                <Trash2 />
                Eliminar registro
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
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

  return (
    <div className="w-full">
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row justify-between mb-4">
        <h2 className="text-xl  font-medium">Lista de participantes registrados</h2>
        <PackageCount rows={table.getFilteredRowModel().rows} />
      </div>

      <div className="flex gap-4">
        <Input
          placeholder="Buscar por nombre, apellido o correo electrónico..."
          value={globalFilter ?? ""}
          onChange={e => setGlobalFilter(e.target.value)}
          className="mb-4 w-full"
        />
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
                  {loading ? "Obteniendo registros..." : "Sin resultados."}
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

function TablePagination({ table }: { table: TanstackTable<Registrations> }) {
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

function PackageCount({ rows }: { rows: Row<Registrations>[] }) {
  const packageCounts = {
    "WebVerse (35Bs)": 0,
    "CodeLab (50 Bs)": 0,
    "Innovators (80 Bs)": 0,
  } as Record<string, number>

  for (const row of rows) {
    const packageName = String(row.getValue("package"))
    packageCounts[packageName] += 1
  }

  return (
    <div className="flex flex-wrap text-nowrap gap-2 items-center">
      {Object.entries(packageCounts).map(([name, count]) => (
        <span key={name} className="rounded-md border p-2 text-sm font-medium text-black">
          {name}: {count}
        </span>
      ))}
    </div>
  )
}
