import { BadgeCheck, ClipboardList, Dices, Home, ScanLine } from "lucide-react"
import { useEffect, useState } from "react"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"

interface CommandMenuProps {
  isAdmin: boolean
}

const items = [
  { label: "Home", icon: Home, href: "/", shortcut: "1" },
  { label: "Registro de participantes", icon: ClipboardList, href: "/admin", shortcut: "2" },
  { label: "Sorteo", icon: Dices, href: "/sorteo", shortcut: "3" },
  { label: "Credencial", icon: BadgeCheck, href: "/registro/iwd-26/confirmado", shortcut: "4" },
]

export default function CommandMenu({ isAdmin }: CommandMenuProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!isAdmin) return

    function handleKeyDown(e: KeyboardEvent) {
      if (e.altKey && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpen(prev => !prev)
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isAdmin])

  useEffect(() => {
    if (!open) return

    function handleShortcut(e: KeyboardEvent) {
      const item = items.find(i => i.shortcut === e.key)
      if (item) {
        e.preventDefault()
        setOpen(false)
        window.location.href = item.href
      }
    }

    document.addEventListener("keydown", handleShortcut)
    return () => document.removeEventListener("keydown", handleShortcut)
  }, [open])

  if (!isAdmin) return null

  function handleSelect(href: string) {
    setOpen(false)
    window.location.href = href
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Navegación rápida"
      description="Busca una página para navegar"
    >
      <CommandInput placeholder="Buscar página..." />
      <CommandList>
        <CommandEmpty>No se encontraron resultados.</CommandEmpty>
        <CommandGroup heading="Páginas">
          {items.map(item => (
            <CommandItem key={item.href} onSelect={() => handleSelect(item.href)}>
              <item.icon className="mr-2 size-4" />
              {item.label}
              <CommandShortcut>{item.shortcut}</CommandShortcut>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}
