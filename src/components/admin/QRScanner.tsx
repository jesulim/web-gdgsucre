import { type IDetectedBarcode, Scanner, useDevices } from "@yudiel/react-qr-scanner"
import { useRef, useState } from "react"
import { Toaster, toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { Activity } from "./Dashboard"

interface QRScannerProps {
  eventSlug: string
  activities: Activity[]
}
interface ConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
  title: string
  description: string
}

interface Registration {
  id: number
  first_name: string
  last_name: string
  package: string
}

const fetchRegistration = async (token: string, activity: string, eventSlug: string) => {
  const url = new URL("/api/registrationByToken", window.location.origin)
  url.search = new URLSearchParams({ token, activity, eventSlug }).toString()

  const response = await fetch(url)
  return await response.json()
}

function ConfirmDialog({ open, onConfirm, onCancel, title, description }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <p className="whitespace-pre-line text-left text-xl">{description}</p>
        </DialogHeader>
        <DialogFooter className="gap-4">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button className="bg-green-500" onClick={onConfirm}>
            Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function QRScanner({ eventSlug, activities }: QRScannerProps) {
  const processedRef = useRef<Map<string, number>>(new Map())
  const COOLDOWN_MS = 2000

  const devices = useDevices()

  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState("")
  const [activity, setActivity] = useState(activities[0].name)

  const [pendingRegistration, setPendingRegistration] = useState<Registration | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const activityLabel = activities.find(a => a.name === activity)?.label ?? activity

  const updateActivity = async () => {
    try {
      const response = await fetch("/api/accreditation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registrationId: pendingRegistration?.id,
          activityId: activities.find(a => a.name === activity)?.id,
          activityName: activity,
          eventSlug,
          field: activity,
          value: true,
        }),
      })

      if (!response.ok) {
        const body = await response.json()
        toast.error(body.error)
      }

      toast.success(
        `${activityLabel} completado para ${pendingRegistration?.first_name} ${pendingRegistration?.last_name}`
      )
      setDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Error desconocido")
    }
  }

  const handleOnScan = async (result: IDetectedBarcode[]) => {
    if (!result.length || isProcessing) return

    setIsProcessing(true)
    const token = result[0].rawValue

    const now = Date.now()
    const last = processedRef.current.get(token) ?? 0

    if (now - last < COOLDOWN_MS) {
      console.debug("Ignored duplicated token", token)
      setIsProcessing(false)
      return
    }

    processedRef.current.set(token, now)

    try {
      const response = await fetchRegistration(token, activity, eventSlug)

      if (response.error) {
        toast.error(response.error)
        setIsProcessing(false)
        return
      }

      if (response.message === "activity_completed") {
        toast.warning(
          `${activityLabel} ya fue completado para ${response.first_name} ${response.last_name}`,
          {
            duration: 4000,
          }
        )
        setIsProcessing(false)
        return
      }

      setPendingRegistration(response)
      setDialogOpen(true)
    } catch (error) {
      toast.error(`Error: ${error instanceof Error ? error.message : "Error desconocido"}`)
    } finally {
      setIsProcessing(false)
      // Clear cooldown by token
      setTimeout(() => {
        const t = processedRef.current.get(token)
        if (t && Date.now() - t >= COOLDOWN_MS) processedRef.current.delete(token)
      }, COOLDOWN_MS)
    }
  }

  return (
    <div>
      <Toaster position="top-right" richColors />

      <div className="flex gap-4 mb-8">
        <Select onValueChange={value => setActivity(value)} defaultValue="check_in">
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Selecciona una actividad" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Actividad</SelectLabel>
              {activities.map(activity => (
                <SelectItem key={activity.name} value={activity.name}>
                  {activity.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {devices?.length > 1 && (
          <Select onValueChange={value => setSelectedDevice(value)}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Selecciona una cámara" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Cámara</SelectLabel>
                {devices.map(
                  device =>
                    device.deviceId && (
                      <SelectItem key={device.deviceId} value={device.deviceId}>
                        {device.label || `Camera ${device.deviceId}`}
                      </SelectItem>
                    )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </div>

      <div className="max-w-2xl mx-auto">
        <Scanner
          classNames={["rounded-md"]}
          onScan={handleOnScan}
          formats={["qr_code"]}
          constraints={{
            facingMode: "environment",
            deviceId: selectedDevice,
            aspectRatio: 1,
            width: { ideal: 600 },
            height: { ideal: 600 },
          }}
        />
      </div>

      {isProcessing && (
        <div className="mt-4 text-center text-lg font-medium text-blue-600">Procesando...</div>
      )}

      {pendingRegistration && (
        <ConfirmDialog
          open={dialogOpen}
          title={`¿Completar ${activityLabel}?`}
          description={
            `${pendingRegistration.first_name} ${pendingRegistration.last_name}` +
            (activity !== "check_in" && pendingRegistration.package
              ? `\nPaquete: ${pendingRegistration.package?.split(" (")[0]}`
              : "")
          }
          onConfirm={updateActivity}
          onCancel={() => setDialogOpen(false)}
        />
      )}
    </div>
  )
}
