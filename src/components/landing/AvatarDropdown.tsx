import { ChevronDown, Dices, LogOut, User, Users } from "lucide-react"
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
}

export default function AvatarMenu({
  avatarUrl,
  userName,
  userInitials,
  email,
  admin,
}: AvatarMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="mt-3 flex items-center px-2 gap-2 rounded-sm hover:bg-off-white transition-colors">
          <Avatar className="size-10">
            <AvatarImage src={avatarUrl} alt={userName} />
            <AvatarFallback>{userInitials}</AvatarFallback>
          </Avatar>
          <ChevronDown className="size-5 stroke-black dark:stroke-white" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="center">
        <DropdownMenuLabel>
          <p>{userName}</p>
          <p className="opacity-80 font-monospace font-regular">{email}</p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem asChild>
          <a href="/perfil" className="font-monospace uppercase font-light">
            <User /> Mi perfil
          </a>
        </DropdownMenuItem>

        {admin && (
          <>
            <DropdownMenuItem asChild>
              <a href="/admin" className="font-monospace uppercase font-light">
                <Users /> Admin
              </a>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              <a href="/sorteo" className="font-monospace uppercase font-light">
                <Dices /> Sorteo GDG Sucre
              </a>
            </DropdownMenuItem>
          </>
        )}

        <DropdownMenuItem variant="destructive" asChild>
          <a href="/api/auth/signout" className="font-monospace uppercase font-light">
            <LogOut /> Cerrar Sesión
          </a>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
