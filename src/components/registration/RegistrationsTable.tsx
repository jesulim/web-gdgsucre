import { useCallback, useEffect, useState } from "react"
import { toast } from "sonner"

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"

import { MoreHorizontal, SendHorizonal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

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
  status: string
  role: string
  first_name: string
  last_name: string
  email: string
  package: string
  voucher: string
}

export function RegistrationsTable() {
  const [data, setData] = useState<Registrations[]>()

  const fetchData = useCallback(async () => {
    const response = await fetch("/api/registrations?slug=io-extended-25")
    const result = await response.json()
    setData(result)
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const sendConfirmationEmail = async (
    id: number,
    email: string,
    name: string
  ) => {
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

  const columns: ColumnDef<Registrations>[] = [
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
      accessorKey: "role",
      header: "Rol",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("role")}</div>
      ),
    },
    {
      accessorKey: "status",
      header: "Estado",
      cell: ({ row }) => (
        <div className="capitalize">{row.getValue("status")}</div>
      ),
    },
    {
      accessorKey: "package",
      header: "Paquete",
      cell: ({ row }) => {
        const packageName = String(row.getValue("package"))
        const packageParts = packageName.split(" (")

        return packageParts.length > 1 ? packageParts[0] : packageName
      },
    },
    {
      accessorKey: "voucher",
      header: "Comprobante",
      cell: ({ row }) => (
        <a
          href={`/api/getSignedUrl?bucket=event-uploads&url=${row.getValue("voucher")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline text-center"
        >
          Ver
        </a>
      ),
    },
    {
      id: "actions",
      header: "Acciones",
      enableHiding: false,
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
  })

  return (
    <div className="w-full">
      <Toaster position="top-right" />
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
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="space-x-2">
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
    </div>
  )
}
