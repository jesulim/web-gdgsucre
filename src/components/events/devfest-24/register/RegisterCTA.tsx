import { useCallback, useEffect, useState } from "react"
import Diplodocus from "./Diplodocus"
import EventBadge from "./EventBadge"

export interface RegistrationData {
  id: number | string
  status: string
  role?: string
}

export interface ProfileData {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  avatar_url?: string | null
}

interface RegisterCTAProps {
  isAuthenticated: boolean
  autoOpen?: boolean
  registrationData?: RegistrationData | null
  profileData?: ProfileData | null
}

export const RegisterCTA = ({
  isAuthenticated,
  autoOpen = false,
  registrationData,
  profileData,
}: RegisterCTAProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleClose = useCallback(() => {
    setIsOpen(false)
    if (typeof window !== "undefined" && window.location.search.includes("credential=1")) {
      const url = new URL(window.location.href)
      url.searchParams.delete("credential")
      window.history.replaceState({}, "", url.pathname + (url.search ? url.search : ""))
    }
  }, [])

  useEffect(() => {
    if (autoOpen && isAuthenticated) {
      setIsOpen(true)
    }
  }, [autoOpen, isAuthenticated])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        handleClose()
      }
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, handleClose])

  const handleClick = () => {
    if (!isAuthenticated) {
      setIsLoading(true)
      window.location.assign("/api/auth/signin?next=/eventos/devfest-24?credential=1")
      return
    }

    setIsOpen(true)
  }

  const fullName =
    (profileData as { display_name?: string | null })?.display_name ||
    [profileData?.first_name, profileData?.last_name].filter(Boolean).join(" ").trim()
  const userName = fullName || profileData?.email || "Participante"
  const userRole = registrationData?.role || "Participante"

  return (
    <>
      <div className="relative m-8 border-2 border-black bg-white text-xl font-semibold text-black shadow-[4px_4px_0px_0px_rgba(255,186,0,1)] transition-all duration-150 hover:-translate-x-0.5 hover:-translate-y-0.5 active:translate-x-1 active:translate-y-1 active:shadow-none">
        <button
          type="button"
          onClick={handleClick}
          disabled={isLoading}
          className="flex items-center justify-center px-6 py-3 cursor-pointer select-none"
        >
          {isLoading && (
            <svg
              className="mr-3 h-5 w-5 animate-spin text-[#4285F4]"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <title>Cargando</title>
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          )}
          <span>Ver Registro</span>
        </button>
      </div>

      {/* Modal */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          tabIndex={-1}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={e => {
            if (e.target === e.currentTarget) handleClose()
          }}
          onKeyDown={e => {
            if (e.key === "Escape") handleClose()
          }}
        >
          <div className="cut-corners-r max-w-sm sm:max-w-lg md:max-w-xl w-full bg-black p-0.5 dark:bg-white">
            <div className="cut-corners-r bg-[#4285F4] pb-2 pr-2">
              <div className="flex flex-col border-b-2 border-r-2 border-black bg-white text-black dark:border-white dark:bg-[#202124] dark:text-white">
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b-2 border-black bg-[#4285F4] px-4 py-2 text-white dark:border-white">
                  <h3 className="text-lg font-bold">
                    {registrationData ? "Tu Credencial DevFest 2024" : "DevFest Sucre 2024"}
                  </h3>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex h-8 w-8 items-center justify-center border-2 border-black bg-[#EEEEEE] text-black hover:bg-gray-200 cursor-pointer"
                    aria-label="Cerrar modal"
                  >
                    <svg
                      className="h-5 w-5 text-[#EA4335]"
                      viewBox="0 0 24 24"
                      strokeWidth="2.5"
                      stroke="currentColor"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <title>Cerrar modal</title>
                      <path stroke="none" d="M0 0h24v24H0z" />
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-4 sm:p-6">
                  {registrationData ? (
                    <div className="flex flex-col items-center">
                      <EventBadge
                        userName={userName}
                        email={profileData?.email}
                        picture={profileData?.avatar_url}
                        role={userRole}
                      />
                      <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-300">
                        ¡Gracias por haber sido parte del DevFest Sucre 2024!
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="w-24 sm:w-28 text-black dark:text-white">
                        <Diplodocus />
                      </div>
                      <h4 className="text-xl font-bold text-[#EA4335]">
                        ¡Sin registro para DevFest 2024!
                      </h4>
                      <p className="text-sm sm:text-base leading-relaxed text-gray-700 dark:text-gray-200 max-w-md">
                        No encontramos una inscripción para <strong>DevFest Sucre 2024</strong>{" "}
                        asociada a tu cuenta. Este evento ya finalizó, pero la comunidad sigue
                        activa con nuevos eventos.
                      </p>
                      <div className="pt-2">
                        <a
                          href="/calendario"
                          className="relative inline-block border-2 border-black bg-[#FBBC04] px-6 py-2.5 text-base font-bold text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
                        >
                          Ver próximos eventos
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
export default RegisterCTA
