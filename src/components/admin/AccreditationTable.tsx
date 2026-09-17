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
import type { Activity } from "@/components/admin/Dashboard"
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
import useAccreditations, { useUpdateAccreditation } from "@/hooks/admin/useAccreditations"

interface AccreditationData {
  id: number
  slug: string
  first_name: string
  last_name: string
  role: string
  status: string
  [key: string]: boolean | string | number
}

const defaultAccreditations: AccreditationData[] = []

export function AccreditationTable({
  eventSlug,
  activities,
}: {
  eventSlug: string
  activities: Activity[]
}) {
  const [globalFilter, setGlobalFilter] = useState("")

  const [role, setRole] = useState<string>("Todos")

  const {
    data: accreditations,
    isLoading,
    isFetching,
    refetch,
  } = useAccreditations({ slug: eventSlug, role })
  const { mutateAsync: updateAccreditation } = useUpdateAccreditation()

  const updateCheckbox = async (
    registrationId: number,
    activityId: number,
    activityName: string,
    value: boolean
  ) => {
    try {
      await updateAccreditation({
        registrationId,
        activityId,
        activityName,
        value,
        params: { slug: eventSlug, role },
      })
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
      cell: info => (info.getValue()?.split(" (")[0] ?? info.getValue()) || "-",
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
  ]

  if (activities) {
    activities.forEach(activity => {
      columns.push(
        columnHelper.accessor(activity.name, {
          header: activity.label,
          enableGlobalFilter: false,
          cell: info => (
            <Checkbox
              checked={info.getValue()}
              onCheckedChange={checked =>
                updateCheckbox(info.row.original.id, activity.id, activity.name, !!checked)
              }
            />
          ),
        })
      )
    })
  }

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
    },
    onGlobalFilterChange: setGlobalFilter,
  })

  const stats = (accreditations ?? []).reduce(
    (acc, row) => {
      acc.total++
      activities?.forEach(({ name }) => {
        if (row[name]) acc[name] = (acc[name] ?? 0) + 1
      })
      return acc
    },
    { total: 0 } as Record<string, number>
  )

  return (
    <div>
      <Toaster position="top-right" />

      <div className="grid sm:grid-cols-[1fr_auto_auto] md:grid-cols-[1fr_auto_auto] gap-2 mb-4">
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

      <AccreditationStats stats={stats} activities={activities} />
    </div>
  )
}

function AccreditationStats({ stats, activities }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center text-nowrap gap-2 my-4 text-sm">
      <span className="font-medium">Total: {stats.total}</span>
      {activities?.map(activity => (
        <span key={activity.name} className="flex items-center gap-2">
          <span className="hidden md:inline">&sdot;</span>
          {activity.label}: {stats[activity.name] || 0}
        </span>
      ))}
    </div>
  )
}
