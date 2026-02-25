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

const getActivityLabel = (activityKey: string) => {
  const labels: Record<string, string> = {
    check_in: "Check-in",
    package_delivered: "Paquete",
    lunch: "Almuerzo",
    refreshment: "Refrigerio",
  }
  return labels[activityKey] || activityKey
}

function ConfirmDialog({ open, onConfirm, onCancel, title, description }) {
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

export function QRScanner() {
  const processedRef = useRef<Map<string, number>>(new Map())
  const COOLDOWN_MS = 2000

  const devices = useDevices()

  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState("")
  const [activity, setActivity] = useState("check_in")

  const [pendingRegistration, setPendingRegistration] = useState(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const fetchRegistration = async (token: string, activity: string) => {
    const url = new URL("/api/registrationByToken", window.location.origin)
    url.search = new URLSearchParams({ token, activity }).toString()

    const response = await fetch(url)
    return await response.json()
  }

  const updateActivity = async () => {
    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: pendingRegistration?.id,
          eventSlug: pendingRegistration?.slug,
          field: activity,
          value: true,
        }),
      })

      if (!response.ok) {
        const body = await response.json()
        toast.error(body.error)
      }

      toast.success(
        `${getActivityLabel(activity)} completado para ${pendingRegistration?.first_name} ${pendingRegistration?.last_name}`
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
      const response = await fetchRegistration(token, activity)

      if (response.error) {
        toast.error(response.error)
        setIsProcessing(false)
        return
      }

      if (response.message === "activity_completed") {
        toast.warning(
          `${getActivityLabel(activity)} ya fue completado para ${response.first_name} ${response.last_name}`,
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
      <Toaster position="top-right" />

      <div className="flex gap-4 mb-8">
        <Select onValueChange={value => setActivity(value)} defaultValue="check_in">
          <SelectTrigger className="w-50">
            <SelectValue placeholder="Selecciona una actividad" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Actividad</SelectLabel>
              <SelectItem value="check_in">Check-in</SelectItem>
              <SelectItem value="package_delivered">Paquete</SelectItem>
              <SelectItem value="lunch">Almuerzo</SelectItem>
              <SelectItem value="refreshment">Refrigerio</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>

        {devices?.length > 0 && (
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
          title={`¿Completar ${getActivityLabel(activity)}?`}
          description={
            `${pendingRegistration.first_name} ${pendingRegistration.last_name}` +
            (activity !== "check_in"
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
