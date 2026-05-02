import { CheckIcon, CopyIcon, LinkIcon } from "lucide-react"
import { useState } from "react"
import { Toaster, toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface TeamInviteCardProps {
  teamName: string
  teamCode: string
  inviteUrl: string
}

export function TeamInviteCard({ teamName, teamCode, inviteUrl }: TeamInviteCardProps) {
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

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

  return (
    <div className="bg-white border-2 lg:border-4 border-black flex flex-col gap-4 items-start p-5 lg:p-6 rounded-2xl lg:rounded-3xl w-full">
      <Toaster position="top-right" richColors />
      <h2 className="font-bold text-xl lg:text-3xl tracking-tight text-black">
        ¡Tu equipo {teamName} ha sido creado!
      </h2>
      <p className="text-[#3b3b3b] text-base leading-tight lg:text-lg">
        Comparte el siguiente código o enlace con los miembros de tu equipo para que puedan unirse.
      </p>

      <div className="space-y-2 w-full mt-2">
        <p className="font-bold text-sm lg:text-base tracking-tight text-black">
          Código del equipo:
        </p>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-50 border-2 border-black p-3 rounded-xl text-center font-mono font-bold text-xl tracking-[0.2em] text-black">
            {teamCode}
          </div>
          <Button
            variant="outline"
            size="icon"
            className="relative h-[52px] w-[52px] shrink-0 border-2 border-black rounded-xl hover:bg-gray-100"
            onClick={() => copyToClipboard(teamCode, "code")}
          >
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-[opacity,filter,scale] duration-300 ease-in-out will-change-[opacity,filter,scale]",
                copiedCode ? "scale-100 opacity-100 blur-0" : "blur-xs scale-[0.25] opacity-0"
              )}
            >
              <CheckIcon className="h-5 w-5 text-green-500" />
            </div>
            <div
              className={cn(
                "transition-[opacity,filter,scale] duration-300 ease-in-out will-change-[opacity,filter,scale]",
                copiedCode ? "blur-xs scale-[0.25] opacity-0" : "scale-100 opacity-100 blur-0"
              )}
            >
              <CopyIcon className="h-5 w-5 text-black" />
            </div>
          </Button>
        </div>
      </div>

      <div className="space-y-2 w-full mt-2">
        <label
          htmlFor="invite-url"
          className="font-bold text-sm lg:text-base tracking-tight text-black"
        >
          Enlace de invitación:
        </label>
        <div className="flex items-center gap-2">
          <Input
            id="invite-url"
            readOnly
            value={inviteUrl}
            className="flex-1 bg-gray-50 border-2 border-black rounded-xl font-mono text-xs text-black"
          />
          <Button
            variant="outline"
            size="icon"
            className="relative shrink-0 border-2 border-black rounded-xl hover:bg-gray-100"
            onClick={() => copyToClipboard(inviteUrl, "url")}
          >
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center transition-[opacity,filter,scale] duration-300 ease-in-out will-change-[opacity,filter,scale]",
                copiedUrl ? "scale-100 opacity-100 blur-0" : "blur-xs scale-[0.25] opacity-0"
              )}
            >
              <CheckIcon className="h-4 w-4 text-green-500" />
            </div>
            <div
              className={cn(
                "transition-[opacity,filter,scale] duration-300 ease-in-out will-change-[opacity,filter,scale]",
                copiedUrl ? "blur-xs scale-[0.25] opacity-0" : "scale-100 opacity-100 blur-0"
              )}
            >
              <LinkIcon className="h-4 w-4 text-black" />
            </div>
          </Button>
        </div>
      </div>
    </div>
  )
}
