import { useCallback, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

interface Registration {
  id: number
  first_name: string
  last_name: string
  email: string
  phone_number?: string
  status: string
  role: string
  created_at: string
}

interface ApiResponse {
  data: Registration[]
  count: number
  requested_limit: number
  requested_role?: string
}

export default function RandomWinnerSelector() {
  const [registrations, setRegistrations] = useState<Registration[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSelecting, setIsSelecting] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [winner, setWinner] = useState<Registration | null>(null)
  const [showWinner, setShowWinner] = useState(false)
  const [limit] = useState<number | null>(null)
  const [selectedRole, setSelectedRole] = useState<string>("")

  const fetchRegistrations = useCallback(async () => {
    setIsLoading(true)
    setWinner(null)
    setShowWinner(false)

    try {
      // Construir URL con parámetros opcionales
      let url = "/api/random-registrations"
      const params = new URLSearchParams()

      if (limit) params.append("limit", limit.toString())
      if (selectedRole) params.append("role", selectedRole)

      if (params.toString()) {
        url += `?${params.toString()}`
      }

      const response = await fetch(url)
      const data: ApiResponse = await response.json()

      if (response.ok) {
        setRegistrations(data.data)
      } else {
        console.error("Error fetching registrations:", data)
        alert("Error al obtener los registros")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error de conexión")
    } finally {
      setIsLoading(false)
    }
  }, [limit, selectedRole])

  useEffect(() => {
    fetchRegistrations()
  }, [fetchRegistrations])

  const startSelection = () => {
    if (registrations.length === 0) {
      alert("Primero debes cargar los registros")
      return
    }

    setIsSelecting(true)
    setShowWinner(false)
    setCurrentIndex(0)

    let speed = 50 // Velocidad inicial muy rápida
    let currentIdx = 0
    const startTime = Date.now()
    const duration = 5000 // 5 segundos exactos

    const animate = () => {
      currentIdx = (currentIdx + 1) % registrations.length
      setCurrentIndex(currentIdx)

      const elapsed = Date.now() - startTime

      speed += Math.max(1, elapsed / 100)

      if (elapsed < duration) {
        setTimeout(animate, Math.min(speed, 300))
      } else {
        const finalIndex = Math.floor(Math.random() * registrations.length)
        setCurrentIndex(finalIndex)
        setWinner(registrations[finalIndex])
        setIsSelecting(false)

        setTimeout(() => {
          setShowWinner(true)
        }, 500)
      }
    }

    animate()
  }

  const resetSelection = () => {
    setWinner(null)
    setShowWinner(false)
    setCurrentIndex(0)
    fetchRegistrations()
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC04] bg-clip-text text-transparent">
          🎰 Ruleta de Ganadores GDG Sucre
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Animación de ruleta por 5 segundos para seleccionar un ganador
        </p>
      </div>

      {isLoading && registrations.length === 0 && (
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">🔄 Cargando participantes...</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-center bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border-2 border-transparent bg-gradient-to-r from-[#4285F4]/10 via-[#EA4335]/10 to-[#FBBC04]/10">
        <div className="flex items-center gap-3">
          <label
            htmlFor="roleFilter"
            className="text-sm font-semibold text-[#4285F4] dark:text-[#4285F4] whitespace-nowrap"
          >
            Filtrar por rol:
          </label>
          <select
            id="roleFilter"
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="border-2 border-[#4285F4] dark:border-[#4285F4] rounded-lg px-4 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-[#4285F4] focus:outline-none"
            disabled={isSelecting || isLoading}
          >
            <option value="">Todos los roles</option>
            <option value="Participante">Participantes</option>
            <option value="Organizer">Organizadores</option>
          </select>
        </div>

        <div className="hidden lg:block w-px h-8 bg-gradient-to-b from-[#4285F4] via-[#EA4335] to-[#FBBC04]" />

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={startSelection}
            disabled={registrations.length === 0 || isSelecting || isLoading}
            className="bg-[#34A853] hover:bg-[#2d9249] text-white text-lg px-8 py-3 font-semibold shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg"
          >
            {isSelecting ? "🎰 Girando ruleta..." : "🎰 Girar Ruleta"}
          </Button>

          {winner && (
            <Button
              onClick={resetSelection}
              variant="outline"
              className="border-2 border-[#4285F4] text-[#4285F4] hover:bg-[#4285F4] hover:text-white text-lg px-8 py-3 font-semibold rounded-lg transition-all duration-300"
              disabled={isLoading}
            >
              {isLoading ? "Cargando..." : "🔄 Nuevo Sorteo"}
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <div className="space-y-6">
          {registrations.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border-2 border-[#4285F4]/20">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-4 text-[#4285F4]">
                  {isSelecting
                    ? "🎰 Ruleta en acción..."
                    : showWinner
                      ? "🎉 ¡Participante seleccionado!"
                      : "👥 Participante Actual"}
                </h2>

                <div
                  className={`
                  p-8 rounded-xl border-4 transition-all duration-300 shadow-lg
                  ${
                    isSelecting
                      ? "border-[#4285F4] bg-gradient-to-br from-[#4285F4]/20 to-[#EA4335]/20 dark:bg-gradient-to-br dark:from-[#4285F4]/30 dark:to-[#EA4335]/30 animate-pulse-glow animate-roulette-spin"
                      : showWinner
                        ? "border-[#34A853] bg-gradient-to-br from-[#34A853]/20 to-[#FBBC04]/20 dark:bg-gradient-to-br dark:from-[#34A853]/30 dark:to-[#FBBC04]/30 animate-winner-bounce animate-winner-glow"
                        : "border-gray-200 dark:border-gray-600"
                  }
                `}
                >
                  <div className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                    {registrations[currentIndex]?.first_name}{" "}
                    {registrations[currentIndex]?.last_name}
                  </div>
                  {/* <div className="text-gray-600 dark:text-gray-400 mt-2">
                    📧 {registrations[currentIndex]?.email}
                  </div>
                  {registrations[currentIndex]?.phone_number && (
                    <div className="text-gray-600 dark:text-gray-400">
                      📱 {registrations[currentIndex]?.phone_number}
                    </div>
                  )} */}
                  <div className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    🏷️ {registrations[currentIndex]?.role} • 📅{" "}
                    {new Date(registrations[currentIndex]?.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          )}

          {registrations.length > 0 && !isSelecting && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 border-2 border-[#EA4335]/20">
              <h3 className="text-xl font-bold mb-4 text-[#EA4335]">📋 Lista de Participantes</h3>
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {registrations.map((registration, index) => (
                  <div
                    key={registration.id}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200
                      ${
                        index === currentIndex
                          ? "border-[#4285F4] bg-gradient-to-r from-[#4285F4]/20 to-[#EA4335]/20 dark:bg-gradient-to-r dark:from-[#4285F4]/30 dark:to-[#EA4335]/30 shadow-md"
                          : winner?.id === registration.id
                            ? "border-[#34A853] bg-gradient-to-r from-[#34A853]/20 to-[#FBBC04]/20 dark:bg-gradient-to-r dark:from-[#34A853]/30 dark:to-[#FBBC04]/30 shadow-md"
                            : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-[#4285F4]/50"
                      }
                    `}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">
                          {registration.first_name} {registration.last_name}
                          {winner?.id === registration.id && <span className="ml-2">👑</span>}
                        </div>
                        {/* <div className="text-sm text-gray-600 dark:text-gray-400">
                          {registration.email}
                        </div> */}
                      </div>
                      <div className="text-sm text-gray-500">{registration.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          {showWinner && winner ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 sticky top-6 border-4 border-transparent bg-gradient-to-br from-[#4285F4]/10 via-[#EA4335]/10 to-[#FBBC04]/10">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC04] bg-clip-text text-transparent">
                  🏆 ¡GANADOR DEL SORTEO GDG! 🏆
                </h2>

                <div className="bg-gradient-to-br from-[#4285F4] via-[#EA4335] to-[#FBBC04] text-white rounded-2xl p-8 mb-6 animate-winner-glow shadow-2xl">
                  <div className="text-5xl mb-4">🎊</div>
                  <div className="text-4xl font-bold mb-2">
                    {winner.first_name} {winner.last_name}
                  </div>
                  <div className="text-xl opacity-95 mb-4 font-medium">
                    ¡Felicitaciones por haber sido seleccionado!
                  </div>
                  <div className="bg-white/20 rounded-xl p-6 backdrop-blur-sm shadow-lg">
                    {/* <div className="text-sm opacity-90 mb-1">📧 Correo electrónico:</div>
                    <div className="font-semibold">{winner.email}</div>
                    {winner.phone_number && (
                      <>
                        <div className="text-sm opacity-90 mb-1 mt-3">📱 Teléfono:</div>
                        <div className="font-semibold">{winner.phone_number}</div>
                      </>
                    )} */}
                    <div className="text-sm opacity-90 mb-1 mt-3">🏷️ Rol:</div>
                    <div className="font-semibold">{winner.role}</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-[#34A853] to-[#0F9D58] text-white rounded-xl p-6 shadow-lg">
                  <div className="text-xl font-bold mb-2">🎁 ¡Enhorabuena!</div>
                  <div className="text-base opacity-95">Has sido seleccionado aleatoriamente</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 sticky top-6 border-4 border-transparent bg-gradient-to-br from-[#4285F4]/10 via-[#EA4335]/10 to-[#FBBC04]/10">
              <div className="text-center">
                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#4285F4] via-[#EA4335] to-[#FBBC04] bg-clip-text text-transparent">
                  🏆 Esperando Ganador GDG
                </h2>
                <div className="text-gray-500 dark:text-gray-400 mb-8">
                  <div className="text-6xl mb-4">🎰</div>
                  <p className="text-lg">
                    {isSelecting
                      ? "La ruleta está girando..."
                      : registrations.length > 0
                        ? "Haz clic en 'Girar Ruleta' para seleccionar un ganador"
                        : "Cargando participantes..."}
                  </p>
                </div>

                {registrations.length > 0 && !isSelecting && (
                  <div className="bg-gradient-to-br from-[#4285F4]/20 via-[#EA4335]/20 to-[#FBBC04]/20 dark:from-[#4285F4]/30 dark:via-[#EA4335]/30 dark:to-[#FBBC04]/30 rounded-xl p-8 border-2 border-[#4285F4]/30">
                    <div className="text-5xl mb-4">👥</div>
                    <div className="text-2xl font-bold text-[#4285F4] dark:text-[#4285F4] mb-1">
                      {registrations.length} participantes
                    </div>
                    <div className="text-base text-gray-600 dark:text-gray-400 font-medium">
                      listos para el sorteo
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
