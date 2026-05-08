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
  const [showConfirmModal, setShowConfirmModal] = useState(false)

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
        onClick={() => setShowConfirmModal(true)}
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
        <span className="text-[14px] font-semibold bg-amber-100 text-amber-700 rounded px-1.5 py-0.5 whitespace-nowrap">
          Líder
        </span>
      ) : (
        <span className="text-[14px] text-muted-foreground">Miembro</span>
      )}

      {/* Confirm Delete Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar eliminación</DialogTitle>
          </DialogHeader>
          <p>Estás seguro de que deseas eliminar a este miembro del equipo?</p>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="bg-red-500 text-white px-4 py-2 rounded"
              onClick={() => {
                setShowConfirmModal(false)
                handleRemove()
              }}
            >
              Eliminar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptySlot({ onAdd }: { onAdd?: () => void }) {
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1 min-w-0">
      <button
        type="button"
        onClick={onAdd}
        className="w-14 h-14 rounded-xl border-2 border-dashed border-border flex items-center justify-center text-muted-foreground text-2xl hover:bg-muted/50 hover:border-muted-foreground/50 hover:text-foreground transition-colors"
      >
        <PlusIcon className="w-6 h-6 stroke-1" />
      </button>
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
  onJoinTeam: (memberId: string, teamCode: string) => Promise<void>
  onDeleteMember?: (registrationId: string) => Promise<void>
}

function TeamGroupCard({
  team,
  filter,
  // index,
  // onAddMember,
  // onRemoveMember,
  sinEquipoMembers,
  onJoinTeam,
  onDeleteMember,
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
            <MemberCard key={member.registration_id} member={member} onRemove={onDeleteMember} />
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
        onAddMember={async (memberId, _teamId) => {
          const teamCode = team.code
          await onJoinTeam(memberId, teamCode)
        }}
      />
    </>
  )
}

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
          <div key={member.registration_id} className="flex items-center gap-2">
            <MemberCard member={member} />
          </div>
        ))}
      </div>
    </div>
  )
}

interface CreateTeamModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventId: string
  onCreated?: () => Promise<void>
}

function CreateTeamModal({ open, onOpenChange, eventId, onCreated }: CreateTeamModalProps) {
  const [teamName, setTeamName] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleCreate = async () => {
    if (!teamName.trim()) {
      toast.error("Ingresa un nombre para el equipo")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/teams/createVoid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          team_name: teamName,
          event_id: eventId,
        }),
      })

      if (!response.ok) {
        toast.error("No se pudo crear el equipo")
        return
      }

      toast.success("Equipo creado correctamente")

      setTeamName("")
      onOpenChange(false)

      await onCreated?.()
    } catch (error) {
      console.error(error)
      toast.error("Error al crear el equipo")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Crear equipo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="teamName" className="text-sm font-medium">
              Nombre del equipo
            </label>

            <input
              type="text"
              id="teamName"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Ej: GDG Team"
              className="w-full border rounded-md px-3 py-2 text-sm"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>

            <Button onClick={handleCreate} disabled={isLoading} className="bg-green-500">
              {isLoading && <Loader2Icon className="animate-spin mr-2 h-4 w-4" />}
              Crear equipo
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function RegistrationsTeamsTable() {
  const [globalFilter, setGlobalFilter] = useState("")
  const [eventSlug, setEventSlug] = useState("")
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false)

  const { events } = useEvents()
  const { data, isLoading, isFetching, refetch } = useTeamsWithMembers(eventSlug)

  useEffect(() => {
    if (events?.length > 0 && !eventSlug) {
      setEventSlug(events[0].slug)
    }
  }, [events, eventSlug])

  const teams = data?.teams ?? []
  const sinEquipo = data?.sinEquipo ?? []

  const eventId = events?.find((event: Event) => event.slug === eventSlug)?.id || ""
  const eventName = events?.find((event: Event) => event.slug === eventSlug)?.name || ""

  const handleJoinTeam = async (memberId: string, teamCode: string) => {
    console.log("Preparing to join team", { memberId, teamCode, eventId })

    if (!memberId || !teamCode || !eventId) {
      console.error("Validation failed: Missing memberId, teamCode, or eventId", {
        memberId,
        teamCode,
        eventId,
      })
      toast.error("Faltan datos para unirse al equipo")
      return
    }

    try {
      console.log("Sending request to add member", { memberId, teamCode, eventId })
      const response = await fetch("/api/teams/addMember", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId, teamCode, eventId }),
      })

      if (!response.ok) {
        const errorResponse = await response.json()
        console.error("Server responded with an error", errorResponse)
        toast.error("Error al unir al equipo")
        return
      }

      // console.log("Member successfully added to team")
      // toast.success("Usuario unido al equipo con éxito")
      await refetch()
    } catch (error) {
      console.error("Error in handleJoinTeam:", error)
      toast.error("Error al unir al equipo")
    }
  }

  const modalCreationTeam = () => {
    setShowCreateTeamModal(true)
  }

  const handleDeleteTeam = async (registrationId: string) => {
    console.log("Preparing to delete member", { registrationId })

    if (!registrationId) {
      console.error("Validation failed: Missing registrationId", { registrationId })
      toast.error("Faltan datos para eliminar al miembro")
      return
    }

    try {
      console.log("Sending request to delete member", { registrationId })
      const response = await fetch(
        `/api/teams/deleteMemberAdmin?registrationId=${registrationId}`,
        {
          method: "DELETE",
        }
      )

      if (!response.ok) {
        const errorResponse = await response.text()
        console.error("Server responded with an error", errorResponse)
        toast.error(errorResponse || "Error al eliminar al miembro")
        return
      }

      console.log("Member successfully deleted")
      toast.success("Miembro eliminado con éxito")
      await refetch()
    } catch (error) {
      console.error("Error in handleDeleteTeam:", error)
      toast.error("Error al eliminar al miembro")
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
        <br />
      </div>
      <div>
        <Button className="bg-green-500 rounded-sm w-fit mb-4" onClick={modalCreationTeam}>
          <PlusIcon className="mr-2 h-4 w-4" />
          Agregar Equipo
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
              sinEquipoMembers={sinEquipo}
              onJoinTeam={handleJoinTeam}
              onDeleteMember={handleDeleteTeam}
            />
          ))}
          <SinEquipoCard members={sinEquipo} filter={globalFilter} />
        </div>
      )}
      <CreateTeamModal
        open={showCreateTeamModal}
        onOpenChange={setShowCreateTeamModal}
        eventId={eventId}
      />
    </div>
  )
}

type Event = {
  id: string
  name: string
  slug: string
}
