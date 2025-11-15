import { type IDetectedBarcode, Scanner, useDevices } from "@yudiel/react-qr-scanner"
import { useRef, useState } from "react"
import { Toaster, toast } from "sonner"

import EventSelector from "@/components/admin/EventSelector"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export default function QRScanner() {
  const processedRef = useRef<Map<string, number>>(new Map())
  const COOLDOWN_MS = 2000

  const devices = useDevices()

  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedDevice, setSelectedDevice] = useState("")
  const [activity, setActivity] = useState("check_in")
  const [eventSlug, setEventSlug] = useState("")

  const fetchRegistration = async (token: string) => {
    try {
      const response = await fetch(`/api/registrationByToken?token=${token}`)

      if (!response.ok) {
        throw new Error("Registro no encontrado")
      }

      const body = await response.json()
      return body
    } catch (error) {
      console.error("Error al cargar registro:", error)
      throw error
    }
  }

  const updateActivity = async (registrationId: number, field: string, value: boolean) => {
    try {
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: registrationId,
          eventSlug,
          field,
          value,
        }),
      })

      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.error || "Error al actualizar")
      }

      return true
    } catch (error) {
      console.error("Error al actualizar actividad:", error)
      throw error
    }
  }

  const handleOnScan = async (result: IDetectedBarcode[]) => {
    if (!result.length || isProcessing) return

    if (!eventSlug) {
      toast.error("Selecciona un evento primero")
      return
    }

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
      const registration = await fetchRegistration(token)

      if (!registration) {
        toast.error("Registro no encontrado")
        setIsProcessing(false)
        return
      }

      // Actualizar la actividad automáticamente
      await updateActivity(registration.id, activity, true)

      toast.success(
        `✅ ${activity === "check_in" ? "Check-in" : activity === "package_delivered" ? "Paquete entregado" : activity === "lunch" ? "Almuerzo entregado" : "Refrigerio entregado"} confirmado para ${registration.first_name} ${registration.last_name}`
      )
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
    <div className="w-full p-4">
      <Toaster position="top-right" />

      <div className="mb-4">
        <EventSelector eventSlug={eventSlug} setEventSlug={setEventSlug} />
      </div>

      <div className="flex gap-4 mb-8">
        <Select onValueChange={value => setActivity(value)} defaultValue="check_in">
          <SelectTrigger className="w-[200px]">
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
    </div>
  )
}
