import { Loader2Icon, PlusIcon, UsersIcon, XIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { toast } from "sonner"

import EventSelector from "@/components/admin/EventSelector"
import { SearchInput } from "@/components/admin/TableUtils"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Toaster } from "@/components/ui/sonner"

import useEvents from "@/hooks/useEvents"
import useTeamsWithMembers from "@/hooks/useTeamsWithMembers"
import type { AdminTeamGroup, AdminTeamMember } from "@/lib/services/teamService"

// const STATUS_STYLES: { [key: string]: { colors: string; label: string } } = {
//   pending: { colors: "bg-blue-100 text-blue-600", label: "Pendiente" },
//   confirmed: { colors: "bg-green-100 text-green-600", label: "Confirmado" },
// }

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
function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

interface MemberCardProps {
  member: AdminTeamMember
  onRemove?: (id: string) => Promise<void>
}

function MemberCard({ member, onRemove }: MemberCardProps) {
  const [isRemoving, setIsRemoving] = useState(false)

  const handleRemove = async () => {
    setIsRemoving(true)
    try {
      await onRemove?.(member.registration_id.toString())
    } catch (error) {
      console.error(error)
    } finally {
      setIsRemoving(false)
    }
  }

  return (
    <div className="group relative flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <button
        type="button"
        onClick={handleRemove}
        disabled={isRemoving}
        className="absolute -top-1 right-2 z-10 bg-red-500 text-white rounded-full p-0.5 shadow-md 
                   opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-red-600 disabled:opacity-50"
        title="Eliminar miembro"
      >
        <XIcon className="w-3 h-3" />
      </button>

      <div className="relative">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-medium border-2 ${
            member.leader
              ? "bg-amber-100 text-amber-800 border-amber-300"
              : "bg-blue-100 text-blue-800 border-blue-200"
          }`}
        >
          {getInitials(member.first_name, member.last_name)}
        </div>
        {member.leader && (
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-amber-400 border-2 border-white flex items-center justify-center">
            <span className="text-[7px] text-amber-900">★</span>
          </div>
        )}
      </div>
      <span className="text-xs font-medium text-center truncate w-full max-w-[72px] leading-tight">
        {member.first_name} {member.last_name.charAt(0)}.
      </span>
      {member.leader ? (
        <span className="text-[10px] font-semibold bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 whitespace-nowrap">
          Lider
        </span>
      ) : (
        <span className="text-[10px] text-muted-foreground">Miembro</span>
      )}
    </div>
  )
}

function EmptySlot({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <button
        type="button"
        onClick={onAdd}
        // MODIFICADO: 'rounded-xl' en lugar de 'rounded-full' y tamaño ajustado a 'w-14 h-14'
        className="w-14 h-14 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-2xl hover:bg-muted/50 hover:border-muted-foreground/50 hover:text-foreground transition-colors"
      >
        <PlusIcon className="w-6 h-6 stroke-1" />
      </button>

      {/* ELIMINADO: El span con "Agregar" para mantener el diseño compacto de slots cuadrados vacíos */}
    </div>
  )
}

const MAX_SLOTS = 5

interface AddMemberModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  members: AdminTeamMember[]
  teamId: number
  onAddMember: (memberId: string, teamId: number) => Promise<void>
}

function AddMemberModal({ open, onOpenChange, members, teamId, onAddMember }: AddMemberModalProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleAdd = async (memberId: string) => {
    setIsLoading(true)
    try {
      await onAddMember(memberId, teamId)
      toast.success("Miembro agregado al equipo")
      onOpenChange(false)
    } catch (error) {
      toast.error("Error al agregar miembro")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Agregar miembro al equipo</DialogTitle>
        </DialogHeader>
        <div className="h-96 overflow-y-auto">
          <div className="space-y-2 p-4">
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay participantes sin equipo disponibles
              </p>
            ) : (
              members.map(member => (
                <div
                  key={member.registration_id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.first_name} {member.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAdd(member.registration_id.toString())}
                    disabled={isLoading}
                    className="ml-2 flex-shrink-0"
                  >
                    Agregar
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

interface TeamGroupCardProps {
  team: AdminTeamGroup
  filter: string
  index: number
  onAddMember?: (memberId: string, teamId: number) => Promise<void>
  onRemoveMember?: (id: string) => Promise<void>
  sinEquipoMembers: AdminTeamMember[]
}

function TeamGroupCard({
  team,
  filter,
  // index,
  onAddMember,
  onRemoveMember,
  sinEquipoMembers,
}: TeamGroupCardProps) {
  const [showAddModal, setShowAddModal] = useState(false)
  const filteredMembers = team.members.filter(m => matchesFilter(m, filter))
  if (filter && filteredMembers.length === 0) return null

  const displayMembers = filter ? filteredMembers : team.members
  const emptySlots = MAX_SLOTS - displayMembers.length

  return (
    <>
      <div className="rounded-lg border overflow-hidden mb-3">
        <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b">
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-primary shrink-0" />
            <span className="font-semibold text-sm">{team.name}</span>
            <span className="text-xs text-muted-foreground font-mono bg-muted rounded px-1.5 py-0.5">
              {team.code}
            </span>
          </div>
          <span className="text-xs text-muted-foreground">
            {displayMembers.length} / {MAX_SLOTS}
          </span>
        </div>
        <div className="flex gap-2 px-4 py-4">
          {displayMembers.map(member => (
            <MemberCard key={member.registration_id} member={member} onRemove={onRemoveMember} />
          ))}
          {!filter &&
            Array.from({ length: emptySlots }).map((_, i) => (
              <EmptySlot
                key={`empty-slot-${i}-${emptySlots}`}
                onAdd={() => setShowAddModal(true)}
              />
            ))}
        </div>
      </div>

      <AddMemberModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        members={sinEquipoMembers}
        teamId={team.id}
        onAddMember={onAddMember || (async () => {})}
      />
    </>
  )
}

// interface TeamGroupCardProps {
//   team: AdminTeamGroup
//   filter: string
//   index: number
// }

interface SinEquipoCardProps {
  members: AdminTeamMember[]
  filter: string
}

function SinEquipoCard({ members, filter }: SinEquipoCardProps) {
  const filtered = members.filter(m => matchesFilter(m, filter))
  if (!members.length || (filter && filtered.length === 0)) return null

  const display = filter ? filtered : members

  return (
    <div className="rounded-lg border border-dashed overflow-hidden mb-3">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-dashed bg-background">
        <span className="font-semibold text-sm text-muted-foreground">Sin equipo</span>
        <span className="text-xs text-muted-foreground">
          {display.length} participante{display.length !== 1 ? "s" : ""}
        </span>
      </div>
      <div className="flex flex-wrap gap-3 px-4 py-4">
        {display.map(member => (
          <MemberCard key={member.registration_id} member={member} />
        ))}
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

  const handleAddMember = async (memberId: string, teamId: number) => {
    try {
      const response = await fetch(`/api/teams/add-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, teamId }),
      })

      if (!response.ok) throw new Error("Error adding member")
      await refetch()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

  const handleRemoveMember = async (memberId: string) => {
    try {
      const response = await fetch(`/api/teams/remove-member`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      })

      if (!response.ok) throw new Error("Error removing member")
      await refetch()
    } catch (error) {
      console.error(error)
      throw error
    }
  }

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
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {teams.map((team, i) => (
            <TeamGroupCard
              key={team.id}
              team={team}
              filter={globalFilter}
              index={i}
              onAddMember={handleAddMember}
              onRemoveMember={handleRemoveMember}
              sinEquipoMembers={sinEquipo}
            />
          ))}
          <SinEquipoCard members={sinEquipo} filter={globalFilter} />
        </div>
      )}
    </div>
  )
}
