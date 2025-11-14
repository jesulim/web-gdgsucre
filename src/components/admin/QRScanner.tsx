import { type IDetectedBarcode, Scanner, useDevices } from "@yudiel/react-qr-scanner"
import { useRef, useState } from "react"

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
  const [activity, setActivity] = useState("check-in")

  const fetchRegistration = async (token: string) => {
    try {
      const response = await fetch(`/api/registrationByToken?token=${token}`)

      const body = await response.json()
      return body
    } catch (error) {
      console.error("Error al cargar registro:", error)
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
      return
    }

    processedRef.current.set(token, now)

    try {
      const registration = await fetchRegistration(token)

      // TODO: Make API call to confirm activity, handle rejection when it was already confirmed
      const confirmed = window.confirm(
        `Completar ${activity} de ${registration.first_name} ${registration.last_name}?`
      )

      if (confirmed) {
        console.info("Confirmed")
      } else {
        console.warn("Canceled")
      }
    } finally {
      // Clear cooldown by token
      setTimeout(() => {
        const t = processedRef.current.get(token)
        if (t && Date.now() - t >= COOLDOWN_MS) processedRef.current.delete(token)
      }, COOLDOWN_MS)
    }
  }

  return (
    <div className="w-full p-4">
      <div className="flex justify-between mb-8">
        <Select onValueChange={value => setActivity(value)} defaultValue="check_in">
          <SelectTrigger>
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
            <SelectTrigger>
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
  )
}
