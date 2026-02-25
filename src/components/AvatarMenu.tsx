import { Dices, LogOut, Ticket, TicketCheck, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface AvatarMenuProps {
  avatarUrl?: string
  userName?: string
  userInitials: string
  email: string
  admin: boolean
  registered: boolean
  eventSlug: string
}

export default function AvatarMenu({
  avatarUrl,
  userName,
  userInitials,
  email,
  admin,
  registered,
  eventSlug,
}: AvatarMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Avatar className="size-12">
          <AvatarImage src={avatarUrl} alt={userName} />
          <AvatarFallback>{userInitials}</AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuLabel>
          <p>{userName}</p>
          <p className="opacity-80">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {admin && (
          <>
            <DropdownMenuItem asChild>
              <a href="/admin">
                <Users /> Admin
              </a>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <a href="/sorteo">
                <Dices /> Sorteo GDG Sucre
              </a>
            </DropdownMenuItem>
          </>
        )}

        {registered ? (
          <DropdownMenuItem asChild>
            <a href={`/registro/${eventSlug}/confirmado`}>
              <TicketCheck /> Ver credencial
            </a>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <a href={`/registro/${eventSlug}`}>
              <Ticket /> Regístrate
            </a>
          </DropdownMenuItem>
        )}

        <DropdownMenuItem variant="destructive" asChild>
          <a href="/api/auth/signout">
            <LogOut /> Cerrar Sesión
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
