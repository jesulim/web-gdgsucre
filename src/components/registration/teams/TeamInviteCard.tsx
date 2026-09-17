import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CheckIcon, CopyIcon, CrownIcon, Loader2Icon, Trash2Icon, UserIcon } from "lucide-react"
import { useState } from "react"
import { Toaster, toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import useDeleteTeamMembers from "@/hooks/teams/useDeleteTeamMembers"
import useTeamMembers from "@/hooks/teams/useTeamMembers"
import { cn } from "@/lib/utils"

const MAX_TEAM_MEMBERS = 5
const queryClient = new QueryClient()

interface TeamInviteCardProps {
  teamName: string
  teamCode: string
  inviteUrl: string
  teamId: number
  registrationId: number
}

interface TeamMember {
  registration_id: number
  leader: boolean
  first_name: string
  last_name: string
  email: string
}

function TeamInviteCardInner({
  teamName,
  teamCode,
  inviteUrl,
  teamId,
  registrationId,
}: TeamInviteCardProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const { data: members, isLoading, isError } = useTeamMembers(teamId, registrationId)
  const deleteMutation = useDeleteTeamMembers()

  const copyToClipboard = async (text: string, type: "code" | "url") => {
    try {
      await navigator.clipboard.writeText(text)
      if (type === "code") {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
        toast.success("Código de equipo copiado al portapapeles")
      } else {
        setCopiedUrl(true)
        setTimeout(() => setCopiedUrl(false), 2000)
        toast.success("Enlace de invitación copiado al portapapeles")
      }
    } catch {
      toast.error("Error al copiar")
    }
  }

  const filledSlots = members?.length ?? 0
  const emptySlots = Math.max(0, MAX_TEAM_MEMBERS - filledSlots)

  return (
    <>
      <Toaster position="top-right" richColors />
      <div className="bg-white border-2 lg:border-4 border-black flex flex-col gap-6 lg:gap-8 p-6 lg:p-8 rounded-2xl lg:rounded-3xl w-full">
        <div className="flex flex-col gap-2 w-full">
          <h2 className="font-bold text-xl lg:text-3xl tracking-tight text-black text-balance">
            ¡Tu equipo {teamName} ha sido creado!
          </h2>
          <p className="text-[#3b3b3b] text-base leading-tight lg:text-lg text-pretty w-full">
            Comparte el siguiente código o enlace a tus amigos para que puedan unirse a tu equipo.
          </p>
        </div>

        <div className="space-y-3 w-full">
          <p className="font-bold text-sm lg:text-base tracking-tight text-black">
            Código del equipo:
          </p>
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="flex-1 flex items-center justify-center h-12 lg:h-14 bg-gray-50 border-2 border-black rounded-xl font-mono font-bold text-lg lg:text-xl tracking-[0.2em] text-black">
              {teamCode}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="relative h-12 w-12 lg:h-14 lg:w-14 shrink-0 border-2 border-black rounded-xl hover:bg-gray-100 active:scale-[0.96] transition-transform"
              onClick={() => copyToClipboard(teamCode, "code")}
            >
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-[opacity,filter,scale] duration-300 ease-in-out will-change-[opacity,filter,scale]",
                  copiedCode ? "scale-100 opacity-100 blur-0" : "blur-xs scale-[0.25] opacity-0"
                )}
              >
                <CheckIcon className="h-5 w-5 lg:h-6 lg:w-6 text-green-500" />
              </div>
              <div
                className={cn(
                  "transition-[opacity,filter,scale] duration-300 ease-in-out will-change-[opacity,filter,scale]",
                  copiedCode ? "blur-xs scale-[0.25] opacity-0" : "scale-100 opacity-100 blur-0"
                )}
              >
                <CopyIcon className="h-5 w-5 lg:h-6 lg:w-6 text-black" />
              </div>
            </Button>
          </div>
        </div>

        <div className="space-y-3 w-full">
          <label
            htmlFor="invite-url"
            className="font-bold text-sm lg:text-base tracking-tight text-black block"
          >
            Enlace de invitación:
          </label>
          <div className="flex items-center gap-2 lg:gap-3">
            <Input
              id="invite-url"
              readOnly
              value={inviteUrl}
              className="flex-1 h-12 lg:h-14 bg-gray-50 border-2 border-black rounded-xl font-mono text-base lg:text-base text-black px-4"
            />
            <Button
              variant="outline"
              size="icon"
              className="relative h-12 w-12 lg:h-14 lg:w-14 shrink-0 border-2 border-black rounded-xl hover:bg-gray-100 active:scale-[0.96] transition-transform"
              onClick={() => copyToClipboard(inviteUrl, "url")}
            >
              <div
                className={cn(
                  "absolute inset-0 flex items-center justify-center transition-[opacity,filter,scale] duration-300 ease-in-out will-change-[opacity,filter,scale]",
                  copiedUrl ? "scale-100 opacity-100 blur-0" : "blur-xs scale-[0.25] opacity-0"
                )}
              >
                <CheckIcon className="h-5 w-5 lg:h-6 lg:w-6 text-green-500" />
              </div>
              <div
                className={cn(
                  "transition-[opacity,filter,scale] duration-300 ease-in-out will-change-[opacity,filter,scale]",
                  copiedUrl ? "blur-xs scale-[0.25] opacity-0" : "scale-100 opacity-100 blur-0"
                )}
              >
                <CopyIcon className="h-5 w-5 lg:h-6 lg:w-6 text-black" />
              </div>
            </Button>
          </div>
        </div>

        <div className="border-t-2 border-dashed border-black/20 w-full" />

        <div className="flex flex-col gap-4 w-full">
          <div className="flex flex-col gap-1 w-full">
            <h3 className="font-bold text-lg lg:text-2xl tracking-tight text-black">
              Miembros del Equipo
            </h3>
            <p className="text-[#3b3b3b] text-sm leading-tight lg:text-base">
              Tu equipo puede tener hasta {MAX_TEAM_MEMBERS} integrantes.
            </p>
          </div>

          <div className="flex flex-col gap-3 w-full">
            {isLoading && (
              <>
                <Skeleton className="h-[60px] w-full rounded-xl" />
                <Skeleton className="h-[60px] w-full rounded-xl" />
                <Skeleton className="h-[60px] w-full rounded-xl" />
              </>
            )}

            {isError && (
              <div className="text-red-500 text-sm font-semibold">
                Hubo un error al cargar los miembros del equipo.
              </div>
            )}

            {!isLoading &&
              !isError &&
              members?.map((member: TeamMember) => (
                <div
                  key={member.registration_id}
                  className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black rounded-xl w-full"
                >
                  <Avatar className="h-9 w-9 border-2 border-black shrink-0">
                    <AvatarFallback className="bg-gray-200 text-black font-bold text-sm">
                      {member.first_name[0]}
                      {member.last_name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col flex-1 truncate">
                    <span className="font-bold text-sm lg:text-base text-black truncate">
                      {member.first_name} {member.last_name}
                    </span>
                    <span className="text-xs text-gray-500 truncate">{member.email}</span>
                  </div>
                  {member.leader && (
                    <Badge
                      variant="secondary"
                      className="bg-yellow-300 text-black border-2 border-black rounded-lg px-2 py-0.5 text-xs font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] shrink-0"
                    >
                      <CrownIcon className="w-3 h-3 mr-1" />
                      Líder
                    </Badge>
                  )}
                  {!member.leader && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="icon"
                          className="shrink-0 ml-2 rounded-xl border-2 border-black"
                          disabled={deleteMutation.isPending}
                        >
                          {deleteMutation.isPending &&
                          deleteMutation.variables?.registrationId === member.registration_id ? (
                            <Loader2Icon className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2Icon className="w-4 h-4" />
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent className="border-2 lg:border-4 border-black rounded-2xl lg:rounded-3xl">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-bold text-xl lg:text-2xl text-black">
                            ¿Estás seguro?
                          </AlertDialogTitle>
                          <AlertDialogDescription className="text-base text-[#3b3b3b]">
                            Esta acción eliminará a{" "}
                            <strong>
                              {member.first_name} {member.last_name}
                            </strong>{" "}
                            de tu equipo y no se puede deshacer.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="mt-4">
                          <AlertDialogCancel className="rounded-xl border-2 border-black text-black hover:bg-gray-100 font-bold">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() =>
                              deleteMutation.mutate({
                                registrationId: member.registration_id,
                              })
                            }
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl border-2 border-black font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                          >
                            Sí, eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              ))}

            {!isLoading &&
              !isError &&
              Array.from({ length: emptySlots }).map((_, i) => (
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: stable placeholder slots
                  key={`empty-slot-${i}`}
                  className="flex items-center gap-3 p-3 border-2 border-dashed border-black/25 rounded-xl w-full"
                >
                  <div className="h-9 w-9 shrink-0 rounded-full border-2 border-dashed border-black/25 flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-black/20" />
                  </div>
                  <span className="text-sm text-black/30 font-medium">Lugar disponible</span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </>
  )
}

export function TeamInviteCard(props: TeamInviteCardProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <TeamInviteCardInner {...props} />
    </QueryClientProvider>
  )
}
