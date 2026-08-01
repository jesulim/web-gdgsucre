import { useMutation, useQueryClient } from "@tanstack/react-query"
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

import { useAdminCommunities } from "@/hooks/useAdminCommunities"
import CommunityRowActions from "./CommunityRowActions"

export interface Community {
  id: number
  created_at: string
  name: string
  short_name: string | null
  website: string | null
  contact_email: string
  accepted: boolean
}

const defaultCommunities: Community[] = []

export function CommunitiesTable() {
  const [globalFilter, setGlobalFilter] = useState("")

  const { communities, isLoading, isFetching, refetch } = useAdminCommunities()

  const queryClient = useQueryClient()

  const setAcceptedMutation = useMutation({
    mutationFn: async ({ id, accepted }: { id: number; accepted: boolean }) => {
      const res = await fetch("/api/communities", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, accepted }),
      })
      if (!res.ok) throw new Error("Error HTTP al actualizar la comunidad")
    },
    onMutate: async ({ id, accepted }) => {
      await queryClient.cancelQueries({ queryKey: ["admin", "communities"] })

      const previousCommunities = queryClient.getQueryData<Community[]>(["admin", "communities"])

      queryClient.setQueryData<Community[]>(["admin", "communities"], old =>
        old?.map(community => (community.id === id ? { ...community, accepted } : community))
      )

      return { previousCommunities }
    },
    onError: (_error, _variables, context) => {
      if (context?.previousCommunities) {
        queryClient.setQueryData(["admin", "communities"], context.previousCommunities)
      }
      toast.error("Error al actualizar la comunidad")
    },
    onSuccess: (_data, variables) => {
      toast.success(variables.accepted ? "Comunidad aceptada" : "Comunidad rechazada")
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "communities"] })
    },
  })

  const columnHelper = createColumnHelper<Community>()

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
    columnHelper.accessor("name", { header: "Nombre", filterFn: "includesString" }),
    columnHelper.accessor("short_name", {
      header: "Nombre corto",
      enableGlobalFilter: false,
      cell: info => info.getValue() ?? "-",
    }),
    columnHelper.accessor("contact_email", {
      header: "Correo de contacto",
      filterFn: "includesString",
    }),
    columnHelper.accessor("website", {
      header: "Sitio web",
      cell: info => {
        const website = info.getValue()
        if (!website) return <span className="text-gray-600">-</span>
        return (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            title={website}
            className="block max-w-[250px] truncate text-blue-500 hover:underline"
          >
            {website}
          </a>
        )
      },
    }),
    columnHelper.display({
      id: "accepted",
      header: "Estado",
      cell: ({ row }) => (
        <Select
          key={row.original.id}
          defaultValue={row.original.accepted ? "accepted" : "pending"}
          onValueChange={value => {
            setAcceptedMutation.mutate({
              id: row.original.id,
              accepted: value === "accepted",
            })
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pendiente</SelectItem>
            <SelectItem value="accepted">Aceptada</SelectItem>
          </SelectContent>
        </Select>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: "Acciones",
      cell: ({ row }) => <CommunityRowActions row={row} refetch={refetch} />,
    }),
  ]

  const table = useReactTable({
    data: communities ?? defaultCommunities,
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
          placeholder="Buscar por nombre, nombre corto o correo electrónico..."
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
                  {isLoading ? "Obteniendo comunidades..." : "Sin resultados."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
