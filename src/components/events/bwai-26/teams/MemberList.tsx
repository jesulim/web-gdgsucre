import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { CrownIcon } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import useTeamMembers from "@/hooks/teams/useTeamMembers"

const queryClient = new QueryClient()

interface MemberListProps {
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

function MemberListInner({ teamId, registrationId }: MemberListProps) {
  const { data: members, isLoading, isError } = useTeamMembers(teamId, registrationId)

  return (
    <div className="bg-white border-2 lg:border-4 border-black flex flex-col gap-4 items-start p-5 lg:p-6 rounded-2xl lg:rounded-3xl w-full h-full min-h-[300px]">
      <div className="flex flex-col gap-1 w-full">
        <h2 className="font-bold text-xl lg:text-3xl tracking-tight text-black">
          Miembros del Equipo
        </h2>
        <p className="text-[#3b3b3b] text-base leading-tight lg:text-lg">
          Estos son los integrantes actuales de tu equipo.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full mt-2">
        {isLoading && (
          <>
            <Skeleton className="h-[68px] w-full rounded-xl" />
            <Skeleton className="h-[68px] w-full rounded-xl" />
            <Skeleton className="h-[68px] w-full rounded-xl" />
          </>
        )}

        {isError && (
          <div className="text-red-500 text-sm font-semibold">
            Hubo un error al cargar los miembros del equipo.
          </div>
        )}

        {members?.map((member: TeamMember) => (
          <div
            key={member.registration_id}
            className="flex items-center gap-3 p-3 bg-gray-50 border-2 border-black rounded-xl w-full"
          >
            <Avatar className="h-10 w-10 border-2 border-black">
              <AvatarFallback className="bg-gray-200 text-black font-bold">
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
          </div>
        ))}

        {!isLoading && !isError && members?.length === 0 && (
          <div className="text-sm text-gray-500">No se encontraron miembros.</div>
        )}
      </div>
    </div>
  )
}

export function MemberList(props: MemberListProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <MemberListInner {...props} />
    </QueryClientProvider>
  )
}
