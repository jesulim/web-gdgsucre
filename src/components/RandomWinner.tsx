import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

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

  useEffect(() => {
    fetchRegistrations()
  }, [])

  useEffect(() => {
    if (selectedRole !== "") {
      fetchRegistrations()
    }
  }, [selectedRole])

  const fetchRegistrations = async () => {
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
  }

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
        <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-gray-200">
          🎰 Ruleta de Ganadores
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Animación de ruleta por 5 segundos para seleccionar un ganador
        </p>
      </div>

      {isLoading && registrations.length === 0 && (
        <div className="text-center">
          <p className="text-lg text-gray-600 dark:text-gray-400">🔄 Cargando participantes...</p>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-4 items-center justify-center bg-white dark:bg-gray-800 rounded-lg p-4 shadow">
        <div className="flex items-center gap-3">
          <label
            htmlFor="roleFilter"
            className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
          >
            Filtrar por rol:
          </label>
          <select
            id="roleFilter"
            value={selectedRole}
            onChange={e => setSelectedRole(e.target.value)}
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            disabled={isSelecting || isLoading}
          >
            <option value="">Todos los roles</option>
            <option value="Participante">Participantes</option>
            <option value="Organizer">Organizadores</option>
          </select>
        </div>

        <div className="hidden lg:block w-px h-8 bg-gray-300 dark:bg-gray-600" />

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={startSelection}
            disabled={registrations.length === 0 || isSelecting || isLoading}
            className="bg-green-600 hover:bg-green-700 text-lg px-6 py-2"
          >
            {isSelecting ? "🎰 Girando ruleta..." : "🎰 Girar Ruleta"}
          </Button>

          {winner && (
            <Button
              onClick={resetSelection}
              variant="outline"
              className="border-gray-300 text-lg px-6 py-2"
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold mb-4">
                  {isSelecting
                    ? "🎰 Ruleta en acción..."
                    : showWinner
                      ? "🎉 ¡Participante seleccionado!"
                      : "👥 Participante Actual"}
                </h2>

                <div
                  className={`
                  p-6 rounded-lg border-2 transition-all duration-300
                  ${
                    isSelecting
                      ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20 animate-pulse-glow animate-roulette-spin"
                      : showWinner
                        ? "border-green-400 bg-green-50 dark:bg-green-900/20 animate-winner-bounce animate-winner-glow"
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
              <h3 className="text-lg font-semibold mb-4">📋 Lista de Participantes</h3>
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {registrations.map((registration, index) => (
                  <div
                    key={registration.id}
                    className={`
                      p-3 rounded border transition-all duration-200
                      ${
                        index === currentIndex
                          ? "border-blue-400 bg-blue-50 dark:bg-blue-900/20"
                          : winner?.id === registration.id
                            ? "border-green-400 bg-green-50 dark:bg-green-900/20"
                            : "border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 sticky top-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                  🏆 ¡GANADOR DEL SORTEO! 🏆
                </h2>

                <div className="bg-gradient-to-br from-yellow-400 via-orange-500 to-red-500 text-white rounded-xl p-8 mb-6 animate-winner-glow">
                  <div className="text-4xl mb-4">🎊</div>
                  <div className="text-3xl font-bold mb-2">
                    {winner.first_name} {winner.last_name}
                  </div>
                  <div className="text-lg opacity-90 mb-4">
                    ¡Felicitaciones por haber sido seleccionado!
                  </div>
                  <div className="bg-white/20 rounded-lg p-4 backdrop-blur-sm">
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

                <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-4">
                  <div className="text-lg font-semibold mb-2">🎁 ¡Enhorabuena!</div>
                  <div className="text-sm opacity-90">Has sido seleccionado aleatoriamente</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 sticky top-6">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">
                  🏆 Esperando Ganador
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
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                    <div className="text-4xl mb-3">👥</div>
                    <div className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                      {registrations.length} participantes
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
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
