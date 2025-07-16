import { Input } from "@/components/ui/input"
import type { ControllerRenderProps } from "react-hook-form"

interface FormFileInputProps {
  field: ControllerRenderProps
}

export const FormFileInput = ({ field }: FormFileInputProps) => {
  return (
    <Input
      type="file"
      onChange={e => field.onChange(e.target.files?.item(0))}
    />
  )
}
