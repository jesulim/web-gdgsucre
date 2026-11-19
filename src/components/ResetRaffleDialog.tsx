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
          title="Reiniciar sorteo"
        >
          <RotateCcw size={19} aria-hidden="true" />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent className="rounded-sm">
        <AlertDialogHeader>
          <AlertDialogTitle>¿Reiniciar el sorteo?</AlertDialogTitle>
          <AlertDialogDescription>
            Se borrarán los ganadores y descartados de esta sesión.
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
