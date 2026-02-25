import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type Row,
  useReactTable,
} from "@tanstack/react-table"
import { Loader2Icon, MoreHorizontal, SendHorizonal, Trash2 } from "lucide-react"
import { useCallback, useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import EventSelector from "@/components/admin/EventSelector"
import { customFilterFn, SearchInput, TablePagination } from "@/components/admin/TableUtils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import useEvents from "@/hooks/useEvents"
import useRegistrations from "@/hooks/useRegistrations"

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

function StatusBadge({ row }: { row: Row<Registrations> }) {
  const status = String(row.getValue("status"))
  const { colors, label } = STATUS_STYLES[status] || {
    color: "bg-gray-100 text-gray-600",
    label: "Desconocido",
  }
  return <span className={`rounded-sm py-1 px-2 ${colors}`}>{label}</span>
}

const defaultRegistrations: Registrations[] = []

export function RegistrationsTable() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [eventSlug, setEventSlug] = useState("")
  const searchInputRef = useRef<HTMLInputElement>(null)

  const { events } = useEvents()
  const { registrations, isLoading, refetch } = useRegistrations(eventSlug)

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

  useEffect(() => {
    if (events?.length > 0 && !eventSlug) {
      setEventSlug(events[0].slug)
    }
  }, [events, eventSlug])

  const sendConfirmationEmail = useCallback(async (id: number, email: string, name: string) => {
    toast.info(`Enviando email de confirmación a ${email}...`)

    const response = await fetch("/api/sendPaymentConfirmation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        registrationId: id,
        userEmail: email,
        userName: name,
        eventName: "International Women's Day 2026",
      }),
    })

    const body = await response.json()
    if (body.success) {
      toast.success("Email enviado exitosamente")
    } else {
      toast.error(body.details)
    }
  }, [])

  const switchRole = useCallback(async (id: number, role: string) => {
    toast.info("Actualizando rol")

    const res = await fetch("/api/organizers", {
      method: role === "Organizer" ? "POST" : "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ registrationId: id }),
    })

    if (res.ok) {
      toast.success("Rol actualizado")
    } else {
      toast.error("Error al actualizar el rol")
    }
  }, [])

  const deleteRegistration = useCallback(async (id: number) => {
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
    } else {
      toast.error(body.message)
    }
  }, [])

  const columns: ColumnDef<Registrations>[] = [
    {
      accessorKey: "number",
      header: "#",
      enableGlobalFilter: false,
      cell: ({ row }) => {
        const filteredRows = table.getFilteredRowModel().rows
        const index = filteredRows.findIndex(r => r.id === row.id)
        return <span className="text-gray-600">{index + 1}</span>
      },
    },
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
      cell: ({ row }) => {
        const voucher = row.getValue("voucher")

        return (
          voucher !== "undefined" && (
            <a
              href={`/api/getSignedUrl?bucket=event-uploads&url=${voucher}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:underline text-center w-full"
            >
              Ver
            </a>
          )
        )
      },
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
                {registration.status === "pending"
                  ? "Enviar confirmación"
                  : "Reenviar confirmación"}
              </DropdownMenuItem>

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
  })

  return (
    <div>
      <Toaster position="top-right" />

      <div className="flex flex-col md:flex-row justify-between mb-4">
        <EventSelector events={events} eventSlug={eventSlug} setEventSlug={setEventSlug} />

        <PackageCount rows={table.getFilteredRowModel().rows} />
      </div>

      <div className="flex gap-4 mb-4">
        <SearchInput
          placeholder="Buscar por nombre, apellido o correo electrónico..."
          searchInputRef={searchInputRef}
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />

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
    </div>
  )
}

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
    <div className="flex flex-wrap text-nowrap gap-2 items-center">
      Cantidad de paquetes:{" "}
      {Object.values(packageCounts)
        .sort((a, b) => a.price - b.price)
        .map(({ name, qty }) => (
          <span key={name} className="text-sm font-medium">
            {name}={qty}
          </span>
        ))}
    </div>
  )
}
