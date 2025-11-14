import type { ControllerRenderProps } from "react-hook-form"
import { Input } from "@/components/ui/input"

interface FormFileInputProps {
  field: ControllerRenderProps
}

export const FormFileInput = ({ field, className }: FormFileInputProps) => {
  return (
    <Input
      className={className}
      type="file"
      onChange={e => field.onChange(e.target.files?.item(0))}
    />
  )
}
