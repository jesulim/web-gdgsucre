import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface OrganizerFormData {
  first_name: string
  last_name: string
  email: string
  phone_number: string
}

const emptyForm: OrganizerFormData = {
  first_name: "",
  last_name: "",
  email: "",
  phone_number: "",
}

type Mode = "create" | "edit"
type Step = "form" | "confirm"

interface OrganizerFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  eventSlug: string
  mode: Mode
  initialData?: OrganizerFormData & { id?: number }
  onSuccess?: () => void
}

export function OrganizerFormModal({
  open,
  onOpenChange,
  eventSlug,
  mode,
  initialData,
  onSuccess,
}: OrganizerFormModalProps) {
  const [step, setStep] = useState<Step>("form")
  const [formData, setFormData] = useState<OrganizerFormData>(initialData ?? emptyForm)
  const [emailSearch, setEmailSearch] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setFormData(initialData ?? emptyForm)
      setStep("form")
      setEmailSearch("")
    }
  }, [open, initialData])

  const handleClose = () => {
    onOpenChange(false)
    setTimeout(() => {
      setStep("form")
      setFormData(initialData ?? emptyForm)
      setEmailSearch("")
    }, 200)
  }

  const handleContinue = () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error("Nombre, apellido y correo son requeridos")
      return
    }
    setStep("confirm")
  }

  const handleConfirm = async () => {
    setIsLoading(true)
    try {
      if (mode === "create") {
        const res = await fetch("/api/organizers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          // TODO: reemplazar con el endpoint de createOrganizerAndProfile cuando esté listo
          body: JSON.stringify({ ...formData, eventSlug }),
        })
        if (!res.ok) throw new Error()
        toast.success("Organizador agregado exitosamente")
      } else {
        // TODO: conectar con el endpoint de update cuando esté listo
        // await fetch(`/api/organizers/${initialData?.id}`, { method: "PUT", ... })
        toast.success("Organizador actualizado exitosamente")
      }
      onSuccess?.()
      handleClose()
    } catch {
      toast.error(
        mode === "create" ? "Error al agregar organizador" : "Error al actualizar organizador"
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchProfile = () => {
    // TODO: conectar con el endpoint de búsqueda de perfiles por email cuando esté listo
    // const profile = await fetch(`/api/profiles?email=${emailSearch}`)
    // if (profile) setFormData({ ...profile })
    toast.info("Búsqueda de perfiles próximamente disponible")
  }

  const initials = `${formData.first_name?.[0] ?? ""}${formData.last_name?.[0] ?? ""}`.toUpperCase()

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {step === "form" ? (
          <>
            <DialogHeader>
              <DialogTitle>
                {mode === "create" ? "Agregar organizador" : "Editar organizador"}
              </DialogTitle>
            </DialogHeader>

            {mode === "create" && (
              <div className="bg-muted rounded-md p-3 space-y-2">
                <p className="text-xs text-muted-foreground">Buscar perfil existente por correo</p>
                <div className="flex gap-2">
                  <Input
                    placeholder="correo@ejemplo.com"
                    value={emailSearch}
                    onChange={e => setEmailSearch(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSearchProfile()}
                    className="text-sm"
                  />
                  <Button variant="outline" size="sm" onClick={handleSearchProfile}>
                    Buscar
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Si el perfil existe, los datos se cargarán automáticamente
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="first_name">Nombre(s)</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={e => setFormData(p => ({ ...p, first_name: e.target.value }))}
                  placeholder="Ana"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="last_name">Apellido(s)</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={e => setFormData(p => ({ ...p, last_name: e.target.value }))}
                  placeholder="García"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={e => setFormData(p => ({ ...p, email: e.target.value }))}
                placeholder="ana@ejemplo.com"
                disabled={mode === "edit"}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="phone_number">Teléfono</Label>
              <Input
                id="phone_number"
                value={formData.phone_number}
                onChange={e => setFormData(p => ({ ...p, phone_number: e.target.value }))}
                placeholder="+591 7xxxxxxx"
              />
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button className="bg-blue-500" onClick={handleContinue}>
                Continuar
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>
                {mode === "create" ? "Confirmar nuevo organizador" : "Confirmar cambios"}
              </DialogTitle>
              <DialogDescription>
                {mode === "create"
                  ? "¿Deseas agregar este organizador al evento?"
                  : "¿Deseas guardar los cambios de este organizador?"}
              </DialogDescription>
            </DialogHeader>

            <div className="bg-muted rounded-md p-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-800 flex items-center justify-center text-sm font-medium shrink-0">
                {initials || "?"}
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">
                  {formData.first_name} {formData.last_name}
                </p>
                <p className="text-xs text-muted-foreground truncate">{formData.email}</p>
                {formData.phone_number && (
                  <p className="text-xs text-muted-foreground">{formData.phone_number}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep("form")}>
                Volver
              </Button>
              <Button className="bg-blue-500" onClick={handleConfirm} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Confirmar"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
