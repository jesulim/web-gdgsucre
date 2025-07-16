import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { ControllerRenderProps } from "react-hook-form"

interface FormSelectProps {
  label: string
  options: string[]
  field: ControllerRenderProps
}

export const FormSelect = ({ label, options, field }: FormSelectProps) => {
  return (
    <Select onValueChange={field.onChange} defaultValue={field.value}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder={`Selecciona tu ${label}`} />
      </SelectTrigger>
      <SelectContent>
        {options?.map((option: string) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
