import { CheckCircle2, Loader2, Send } from "lucide-react"
import { useState } from "react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface SuggestionsFormProps {
  user?: {
    name?: string | null
    email?: string | null
    avatarUrl?: string | null
  }
}

export default function SuggestionsForm({ user }: SuggestionsFormProps) {
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const userName = user?.name || user?.email || "Usuario"
  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map(part => part[0].toUpperCase())
        .join("")
    : (user?.email?.[0]?.toUpperCase() ?? "U")

  const trimmedSubject = subject.trim()
  const trimmedMessage = message.trim()
  const isFormValid = trimmedSubject.length >= 3 && trimmedMessage.length >= 10

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setErrorMessage(null)

    if (trimmedSubject.length < 3) {
      setErrorMessage("El asunto debe tener al menos 3 caracteres.")
      return
    }

    if (trimmedSubject.length > 120) {
      setErrorMessage("El asunto no puede superar los 120 caracteres.")
      return
    }

    if (trimmedMessage.length < 10) {
      setErrorMessage("El mensaje debe tener al menos 10 caracteres.")
      return
    }

    if (trimmedMessage.length > 1000) {
      setErrorMessage("El mensaje no puede superar los 1000 caracteres.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject: trimmedSubject,
          message: trimmedMessage,
        }),
      })

      const data = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(data?.error || "Ocurrió un error al enviar tu sugerencia.")
      }

      setIsSuccess(true)
      setSubject("")
      setMessage("")
      setErrorMessage(null)
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : "Error inesperado al enviar la sugerencia."
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-off-white bg-off-white/10 dark:bg-black/30 rounded-sm gap-4 transition-all">
        <div className="size-14 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center">
          <CheckCircle2 className="size-7" />
        </div>
        <div className="flex flex-col gap-1 max-w-md">
          <h3 className="text-xl font-medium">¡Gracias por tu sugerencia!</h3>
          <p className="text-sm text-muted-foreground">
            Hemos recibido tu mensaje correctamente y se lo notificamos al equipo de GDG Sucre.
            ¡Apreciamos mucho tus aportes para mejorar la comunidad!
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => setIsSuccess(false)}
          className="mt-2 font-monospace uppercase text-xs cursor-pointer"
        >
          Enviar otra sugerencia
        </Button>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-5 p-6 border-2 border-off-white bg-off-white/10 dark:bg-black/30 rounded-sm"
    >
      <div className="flex items-center gap-3 pb-4 border-b border-off-white">
        <Avatar className="size-10">
          {user?.avatarUrl && <AvatarImage src={user.avatarUrl} alt={userName} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col text-sm">
          <span className="font-medium text-foreground">{userName}</span>
          {user?.email && <span className="text-muted-foreground text-xs">{user.email}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor="suggestion-subject" className="font-medium uppercase font-monospace">
            Asunto
          </label>
          <span
            className={`font-monospace ${
              subject.length > 120 ? "text-red-500 font-bold" : "text-muted-foreground"
            }`}
          >
            {subject.length}/120
          </span>
        </div>
        <Input
          id="suggestion-subject"
          type="text"
          value={subject}
          onChange={e => setSubject(e.target.value)}
          placeholder="Ej. Taller práctico sobre Cloud Run o Agentes de IA"
          disabled={isSubmitting}
          maxLength={120}
          required
          className="rounded-sm"
        />
        {subject.length > 0 && trimmedSubject.length < 3 && (
          <span className="text-xs text-amber-500">Mínimo 3 caracteres</span>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between items-center text-xs">
          <label htmlFor="suggestion-message" className="font-medium uppercase font-monospace">
            Mensaje
          </label>
          <span
            className={`font-monospace ${
              message.length > 1000 ? "text-red-500 font-bold" : "text-muted-foreground"
            }`}
          >
            {message.length}/1000
          </span>
        </div>
        <textarea
          id="suggestion-message"
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder="Explícanos tu idea, qué herramientas te gustaría aprender, o cualquier recomendación para próximos eventos..."
          disabled={isSubmitting}
          maxLength={1000}
          rows={5}
          required
          className="border-input placeholder:text-muted-foreground dark:bg-input/30 focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] min-h-[120px] w-full rounded-sm border bg-transparent p-3 text-base shadow-xs outline-none md:text-sm resize-y"
        />
        {message.length > 0 && trimmedMessage.length < 10 && (
          <span className="text-xs text-amber-500">Mínimo 10 caracteres</span>
        )}
      </div>

      {errorMessage && (
        <div className="p-3 text-sm text-red-500 bg-red-500/10 border border-red-500/30 rounded-sm">
          {errorMessage}
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isSubmitting || !isFormValid}
          className="w-full sm:w-auto bg-red-500 hover:bg-red-600 text-white font-monospace uppercase text-sm font-medium py-2.5 px-6 rounded-sm cursor-pointer disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Enviando...
            </>
          ) : (
            <>
              Enviar sugerencia
              <Send className="size-4" />
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
