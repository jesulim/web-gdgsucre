import { RotateCcw } from "lucide-react"
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

export function ResetRaffleDialog({
  disabled,
  onConfirm,
}: {
  disabled: boolean
  onConfirm: () => void
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          type="button"
          className="raffle-reset"
          disabled={disabled}
          aria-label="Reiniciar sorteo"
        >
          <RotateCcw size={18} aria-hidden="true" />
          <span>Reiniciar</span>
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="raffle-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Reiniciar el sorteo?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borrará el historial de esta sesión. Las personas confirmadas o excluidas volverán al
            grupo del sorteo.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={disabled} onClick={onConfirm}>
            Reiniciar sorteo
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
