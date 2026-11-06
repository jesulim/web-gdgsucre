import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { Loader2Icon, PlusIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import { customFilterFn, SearchInput, TablePagination } from "@/components/admin/TableUtils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
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

import useOrganizers from "@/hooks/admin/useOrganizers"

import { OrganizerFormModal } from "./OrganizerFormModal"

interface OrganizerData {
  id: number
  profile_id?: string
  first_name: string
  last_name: string
  email: string | null
  phone_number: string | null
  avatar_url: string | null
}

const defaultOrganizers: OrganizerData[] = []

export function OrganizersTable({ eventSlug }: { eventSlug: string }) {
  const [globalFilter, setGlobalFilter] = useState("")
  const { organizers, isLoading, isFetching, refetch } = useOrganizers(eventSlug)

  const columnHelper = createColumnHelper<OrganizerData>()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingOrganizer, setEditingOrganizer] = useState<OrganizerData | null>(null)
  const [deletingOrganizer, setDeletingOrganizer] = useState<OrganizerData | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deletingOrganizer) return
    setIsDeleting(true)
    try {
      const res = await fetch("/api/organizers", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: deletingOrganizer.id }),
      })

      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || "Error al eliminar")
      }

      toast.success("Organizador eliminado exitosamente")
      await refetch()
      setDeletingOrganizer(null)
    } catch (error) {
      const message = error instanceof Error ? error.message : "Error al eliminar organizador"
      toast.error(message)
    } finally {
      setIsDeleting(false)
    }
  }

  const columns = [
    columnHelper.display({
      id: "rowNumber",
      header: "#",
      cell: ({ row }) => <span className="text-gray-600">{row.index + 1}</span>,
    }),
    columnHelper.accessor("first_name", {
      header: "Nombre(s)",
      filterFn: "includesString",
    }),
    columnHelper.accessor("last_name", {
      header: "Apellido(s)",
      filterFn: "includesString",
    }),
    columnHelper.accessor("email", {
      header: "Correo electrónico",
      filterFn: "includesString",
      cell: info => info.getValue() ?? "-",
    }),
    columnHelper.accessor("phone_number", {
      header: "Teléfono",
      enableGlobalFilter: false,
      cell: info => info.getValue() ?? "-",
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setEditingOrganizer(row.original)
              setModalOpen(true)
            }}
          >
            Editar
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeletingOrganizer(row.original)}
          >
            Eliminar
          </Button>
        </div>
      ),
    }),
  ]

  const table = useReactTable({
    data: organizers ?? defaultOrganizers,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    globalFilterFn: customFilterFn,
    initialState: {
      pagination: { pageSize: 12 },
    },
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
  })

  return (
    <div>
      <Toaster position="top-right" />

      <div className="grid grid-cols-[1fr_auto] gap-4 mb-4">
        <SearchInput
          placeholder="Buscar por nombre, apellido o correo electrónico..."
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />
        <Button
          className="bg-blue-500 rounded-sm"
          onClick={() => {
            setEditingOrganizer(null)
            setModalOpen(true)
          }}
        >
          <PlusIcon className="mr-1 h-4 w-4" />
          Agregar
        </Button>
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
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
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
                  {isLoading ? "Obteniendo organizadores..." : "Sin resultados."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="my-4 text-sm text-gray-600">
        Total: {table.getFilteredRowModel().rows.length} organizador(es)
      </div>

      <OrganizerFormModal
        open={modalOpen}
        onOpenChange={open => {
          setModalOpen(open)
          if (!open) setEditingOrganizer(null)
        }}
        eventSlug={eventSlug}
        mode={editingOrganizer ? "edit" : "create"}
        initialData={
          editingOrganizer
            ? {
                id: editingOrganizer.id,
                first_name: editingOrganizer.first_name,
                last_name: editingOrganizer.last_name,
                email: editingOrganizer.email ?? "",
                phone_number: editingOrganizer.phone_number ?? "",
              }
            : undefined
        }
        onSuccess={() => refetch()}
      />

      <AlertDialog
        open={!!deletingOrganizer}
        onOpenChange={open => !open && setDeletingOrganizer(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar organizador?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar a {deletingOrganizer?.first_name}{" "}
              {deletingOrganizer?.last_name} como organizador de este evento? Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={e => {
                e.preventDefault()
                handleDelete()
              }}
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
