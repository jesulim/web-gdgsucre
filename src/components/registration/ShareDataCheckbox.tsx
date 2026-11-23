import { Checkbox } from "@/components/ui/checkbox"
import { Field, FieldContent, FieldDescription, FieldLabel } from "@/components/ui/field"

interface ShareDataCheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
}

export default function ShareDataCheckbox({ checked, onCheckedChange }: ShareDataCheckboxProps) {
  return (
    <Field orientation="horizontal" className="rounded-lg border p-3">
      <Checkbox
        id="share_data"
        checked={checked}
        onCheckedChange={value => onCheckedChange(value === true)}
      />
      <FieldContent>
        <FieldLabel htmlFor="share_data" className="font-normal">
          Compartir información con sponsors
        </FieldLabel>
        <FieldDescription>
          Tu información podría utilizarse con fines promocionales o propuestas de trabajo. Puedes
          cambiar esta configuración en cualquier momento desde <a href="/perfil">tu perfil.</a>
        </FieldDescription>
      </FieldContent>
    </Field>
  )
}
