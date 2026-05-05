import { Loader2Icon, UsersIcon } from "lucide-react"
import { useEffect, useState } from "react"

import EventSelector from "@/components/admin/EventSelector"
import { SearchInput } from "@/components/admin/TableUtils"
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

import useEvents from "@/hooks/useEvents"
import useTeamsWithMembers from "@/hooks/useTeamsWithMembers"
import type { AdminTeamGroup, AdminTeamMember } from "@/lib/services/teamService"

const STATUS_STYLES: { [key: string]: { colors: string; label: string } } = {
  pending: { colors: "bg-blue-100 text-blue-600", label: "Pendiente" },
  confirmed: { colors: "bg-green-100 text-green-600", label: "Confirmado" },
}

function StatusBadge({ status }: { status: string }) {
  const { colors, label } = STATUS_STYLES[status] || {
    colors: "bg-gray-100 text-gray-600",
    label: "Desconocido",
  }
  return <span className={`rounded-sm py-1 px-2 text-xs font-medium ${colors}`}>{label}</span>
}

function normalizeString(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function matchesFilter(member: AdminTeamMember, filter: string) {
  if (!filter) return true
  const q = normalizeString(filter)
  return (
    normalizeString(member.first_name).includes(q) ||
    normalizeString(member.last_name).includes(q) ||
    normalizeString(member.email).includes(q)
  )
}

interface MembersTableProps {
  members: AdminTeamMember[]
  filter: string
  startIndex: number
}

function MembersTable({ members, filter, startIndex }: MembersTableProps) {
  const filtered = members.filter(m => matchesFilter(m, filter))
  if (!filtered.length) return null

  return (
    <Table>
      <TableHeader>
        <TableRow className="bg-muted/30">
          <TableHead className="w-10">#</TableHead>
          <TableHead>Nombre(s)</TableHead>
          <TableHead>Apellido(s)</TableHead>
          <TableHead>Correo electronico</TableHead>
          <TableHead>Estado</TableHead>
          <TableHead>Rol</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {filtered.map((member, i) => (
          <TableRow
            key={member.registration_id}
            className={
              member.leader
                ? "bg-amber-50 hover:bg-amber-100/0 border-l-2 border-l-amber-400"
                : "hover:bg-muted/40"
            }
          >
            <TableCell className="text-gray-500 text-sm">{startIndex + i + 1}</TableCell>
            <TableCell className="font-medium">
              <span className="flex items-center gap-2">
                {member.leader}
                {member.first_name}
              </span>
            </TableCell>
            <TableCell>{member.last_name}</TableCell>
            <TableCell className="text-muted-foreground text-sm">{member.email}</TableCell>
            <TableCell>
              <StatusBadge status={member.status} />
            </TableCell>
            <TableCell>
              {member.leader ? (
                <span className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-semibold bg-amber-100 text-amber-700">
                  Lider
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-sm px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">
                  Miembro
                </span>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

interface TeamGroupCardProps {
  team: AdminTeamGroup
  filter: string
  index: number
}

function TeamGroupCard({ team, filter, index }: TeamGroupCardProps) {
  const filteredCount = team.members.filter(m => matchesFilter(m, filter)).length
  if (filter && filteredCount === 0) return null

  return (
    <div className="rounded-md border overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold text-sm">{team.name}</span>
          <span className="text-xs text-muted-foreground font-mono bg-muted rounded px-1.5 py-0.5">
            {team.code}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">
          {filteredCount} / 5 miembro{team.members.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="overflow-x-auto">
        <MembersTable members={team.members} filter={filter} startIndex={0} />
      </div>
    </div>
  )
}

interface SinEquipoCardProps {
  members: AdminTeamMember[]
  filter: string
}

function SinEquipoCard({ members, filter }: SinEquipoCardProps) {
  const filteredCount = members.filter(m => matchesFilter(m, filter)).length
  if (!members.length || (filter && filteredCount === 0)) return null

  return (
    <div className="rounded-md border border-dashed overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-dashed">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-sm text-gray-500">Sin Equipo</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {filteredCount} participante{members.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="overflow-x-auto">
        <MembersTable members={members} filter={filter} startIndex={0} />
      </div>
    </div>
  )
}

export function RegistrationsTeamsTable() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [eventSlug, setEventSlug] = useState("")

  const { events } = useEvents()
  const { data, isLoading, isFetching, refetch } = useTeamsWithMembers(eventSlug)

  useEffect(() => {
    if (events?.length > 0 && !eventSlug) {
      setEventSlug(events[0].slug)
    }
  }, [events, eventSlug])

  const teams = data?.teams ?? []
  const sinEquipo = data?.sinEquipo ?? []

  const totalMembers = teams.reduce((acc, t) => acc + t.members.length, 0) + sinEquipo.length

  const hasResults =
    teams.some(t => t.members.some(m => matchesFilter(m, globalFilter))) ||
    sinEquipo.some(m => matchesFilter(m, globalFilter))

  return (
    <div>
      <Toaster position="top-right" />

      {/* Controls */}
      <div className="grid grid-cols-[1fr_auto] md:grid-cols-[1fr_1fr_auto] gap-4 mb-4">
        <div className="col-span-2 md:col-span-1">
          <EventSelector events={events} eventSlug={eventSlug} setEventSlug={setEventSlug} />
        </div>

        <SearchInput
          placeholder="Buscar por nombre, apellido o correo..."
          globalFilter={globalFilter}
          setGlobalFilter={setGlobalFilter}
        />

        <Button className="bg-blue-500 rounded-sm w-fit" onClick={() => refetch()}>
          {isFetching && <Loader2Icon className="animate-spin" />}
          Actualizar
        </Button>
      </div>

      {/* Summary row */}
      {!isLoading && totalMembers > 0 && (
        <div className="flex items-center gap-4 text-sm text-muted-foreground pb-3">
          <span>
            <strong className="text-foreground">{teams.length}</strong> equipo
            {teams.length !== 1 ? "s" : ""}
          </span>
          <span>
            <strong className="text-foreground">{sinEquipo.length}</strong> sin equipo
          </span>
          <span>
            <strong className="text-foreground">{totalMembers}</strong> Participantes
          </span>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground gap-2">
          <Loader2Icon className="animate-spin h-5 w-5" />
          Obteniendo equipos...
        </div>
      ) : !totalMembers ? (
        <div className="flex items-center justify-center h-48 text-muted-foreground">
          Sin registros para este evento.
        </div>
      ) : !hasResults ? (
        <div className="flex items-center justify-center h-24 text-muted-foreground">
          Sin resultados para la búsqueda.
        </div>
      ) : (
        <>
          {teams.map((team, i) => (
            <TeamGroupCard key={team.id} team={team} filter={globalFilter} index={i} />
          ))}
          <SinEquipoCard members={sinEquipo} filter={globalFilter} />
        </>
      )}
    </div>
  )
}
