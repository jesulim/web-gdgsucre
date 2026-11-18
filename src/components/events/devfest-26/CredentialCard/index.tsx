import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import "./CredentialCard.css"
import { Loader2, Share2 } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { type CredentialLayout, shareOrDownloadCredential } from "@/lib/shareCredential"

interface CredentialCardProps {
  avatarUrl?: string
  innerGradient?: string
  behindGradient?: string
  className?: string
  enableTilt?: boolean
  enableMobileTilt?: boolean
  mobileTiltSensitivity?: number
  showBehindGradient?: boolean
  firstName: string
  lastName: string
  role: string
  handle?: string
  grainUrl?: string
  qrUrl: string
}

const DEFAULT_BEHIND_GRADIENT =
  "radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),hsla(266,100%,90%,var(--card-opacity)) 4%,hsla(266,50%,80%,calc(var(--card-opacity)*0.75)) 10%,hsla(266,25%,70%,calc(var(--card-opacity)*0.5)) 50%,hsla(266,0%,60%,0) 100%),radial-gradient(35% 52% at 55% 20%,#00ffaac4 0%,#073aff00 100%),radial-gradient(100% 100% at 50% 50%,#00c1ffff 1%,#073aff00 76%),conic-gradient(from 124deg at 50% 50%,#c137ffff 0%,#07c6ffff 40%,#07c6ffff 60%,#c137ffff 100%)"

const AVATAR_RING_STOPS: [number, string][] = [
  [0, "#F27E1D"],
  [30 / 360, "#CBB716"],
  [90 / 360, "#37A851"],
  [150 / 360, "#CCB717"],
  [180 / 360, "#F27E1D"],
  [210 / 360, "#BF5466"],
  [270 / 360, "#4584F1"],
  [330 / 360, "#BE5466"],
  [1, "#F27E1D"],
]

const AVATAR_RING_GRADIENT = `conic-gradient(${AVATAR_RING_STOPS.map(
  ([offset, color]) => `${color} ${offset * 360}deg`
).join(", ")})`

const SHARE_LAYOUT: Partial<CredentialLayout> = {
  baseWidth: 360,
  baseHeight: 540,
  nameCenterY: 0.4534,
  nameMaxWidth: 0.83,
  nameFontSize: 20,
  nameColor: "#ffffff",
  avatarCenterY: 0.2552,
  avatarDiameter: 0.3704,
  avatarRingWidth: 2,
  avatarRingStops: AVATAR_RING_STOPS,
  roleCenterY: 0.562,
  roleFontSize: 20,
  roleFontWeight: "500",
  roleColor: "#ffffff",
  qrCenterY: 0.8037,
  qrBoxSize: 166,
}

const ANIMATION_CONFIG = {
  SMOOTH_DURATION: 600,
  INITIAL_DURATION: 1500,
  INITIAL_X_OFFSET: 70,
  INITIAL_Y_OFFSET: 60,
  DEVICE_BETA_OFFSET: 20,
} as const

const clamp = (v: number, min = 0, max = 100) => Math.min(Math.max(v, min), max)
const round = (v: number, p = 3) => Number.parseFloat(v.toFixed(p))
const adjust = (v: number, a: number, b: number, c: number, d: number) =>
  round(c + ((d - c) * (v - a)) / (b - a))
const easeInOutCubic = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - (-2 * x + 2) ** 3 / 2)

const CredentialCardComponent: React.FC<CredentialCardProps> = ({
  avatarUrl,
  innerGradient = "/events/devfest-26/bg-credencial.webp",
  className = "",
  behindGradient,
  enableTilt = true,
  enableMobileTilt = false,
  showBehindGradient = false,
  mobileTiltSensitivity = 3,
  firstName,
  lastName,
  role,
  grainUrl,
  qrUrl,
}) => {
  const cardRef = useRef<HTMLDivElement>(null)
  const [isSharing, setIsSharing] = useState(false)

  const canHover = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false
    return window.matchMedia("(hover: hover)").matches
  }, [])

  const finalAvatar = avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : "/avatar-default.webp"

  const safeFirstName = firstName?.trim() || ""
  const nameParts = safeFirstName.split(" ").filter(Boolean)

  const userInitials =
    nameParts.length >= 2
      ? (nameParts[0][0] + nameParts[1][0]).toUpperCase()
      : nameParts.length === 1
        ? nameParts[0][0].toUpperCase()
        : "?"

  const handleShare = async () => {
    if (isSharing) return
    setIsSharing(true)
    try {
      await shareOrDownloadCredential(
        {
          firstName,
          lastName,
          role,
          avatarUrl: finalAvatar,
          qrUrl,
          bgImageUrl: innerGradient,
          layout: {
            ...SHARE_LAYOUT,
            ...(cardRef.current && { fontFamily: getComputedStyle(cardRef.current).fontFamily }),
          },
        },
        {
          title: `Credencial de ${firstName} ${lastName} - GDG Sucre`,
          text: `¡Ya estoy registrado para el DevFest Sucre 2026! Genera la tuya aquí 🎉`,
          filename: `credencial-${firstName.toLowerCase().replace(/\s+/g, "-")}.png`,
        }
      )
    } catch (err) {
      console.error("Error al compartir la credencial:", err)
    } finally {
      setIsSharing(false)
    }
  }

  const animationHandlers = useMemo(() => {
    if (!enableTilt) return null
    let rafId: number | null = null

    const updateCardTransform = (offsetX: number, offsetY: number, card: HTMLElement) => {
      const width = card.clientWidth
      const height = card.clientHeight

      const percentX = clamp((100 / width) * offsetX)
      const percentY = clamp((100 / height) * offsetY)

      const centerX = percentX - 50
      const centerY = percentY - 50

      const vars: Record<string, string> = {
        "--pointer-x": `${percentX}%`,
        "--pointer-y": `${percentY}%`,
        "--background-x": `${adjust(percentX, 0, 100, 35, 65)}%`,
        "--background-y": `${adjust(percentY, 0, 100, 35, 65)}%`,
        "--pointer-from-center": `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
        "--pointer-from-top": `${percentY / 100}`,
        "--pointer-from-left": `${percentX / 100}`,
        "--rotate-x": `${round(-(centerX / 5))}deg`,
        "--rotate-y": `${round(centerY / 4)}deg`,
      }

      for (const [k, v] of Object.entries(vars)) card.style.setProperty(k, v)
    }

    const createSmoothAnimation = (
      duration: number,
      startX: number,
      startY: number,
      card: HTMLElement
    ) => {
      const startTime = performance.now()
      const targetX = card.clientWidth / 2
      const targetY = card.clientHeight / 2

      const loop = (t: number) => {
        const progress = clamp((t - startTime) / duration)
        const eased = easeInOutCubic(progress)
        const currentX = adjust(eased, 0, 1, startX, targetX)
        const currentY = adjust(eased, 0, 1, startY, targetY)
        updateCardTransform(currentX, currentY, card)
        if (progress < 1) rafId = requestAnimationFrame(loop)
      }
      rafId = requestAnimationFrame(loop)
    }

    return {
      updateCardTransform,
      createSmoothAnimation,
      cancelAnimation: () => {
        if (rafId) cancelAnimationFrame(rafId)
        rafId = null
      },
    }
  }, [enableTilt])

  const handlePointerMove = useCallback(
    (event: PointerEvent) => {
      const card = cardRef.current
      if (!card || !animationHandlers) return
      const rect = card.getBoundingClientRect()
      animationHandlers.updateCardTransform(
        event.clientX - rect.left,
        event.clientY - rect.top,
        card
      )
    },
    [animationHandlers]
  )

  const handlePointerEnter = useCallback(() => {
    const card = cardRef.current
    if (!card || !animationHandlers) return
    animationHandlers.cancelAnimation()
    card.classList.add("active")
  }, [animationHandlers])

  const handlePointerLeave = useCallback(
    (event: PointerEvent) => {
      const card = cardRef.current
      if (!card || !animationHandlers) return
      animationHandlers.createSmoothAnimation(
        ANIMATION_CONFIG.SMOOTH_DURATION,
        event.offsetX,
        event.offsetY,
        card
      )
      card.classList.remove("active")
    },
    [animationHandlers]
  )

  const handleDeviceOrientation = useCallback(
    (event: DeviceOrientationEvent) => {
      const card = cardRef.current
      if (!card || !animationHandlers) return

      const { beta, gamma } = event
      if (typeof beta !== "number" || typeof gamma !== "number") return

      animationHandlers.updateCardTransform(
        card.clientWidth / 2 + gamma * mobileTiltSensitivity,
        card.clientHeight / 2 +
          (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * mobileTiltSensitivity,
        card
      )
    },
    [animationHandlers, mobileTiltSensitivity]
  )

  useEffect(() => {
    if (!enableTilt || !animationHandlers) return
    const card = cardRef.current
    if (!card) return

    if (canHover) {
      card.addEventListener("pointerenter", handlePointerEnter as EventListener, { passive: true })
      card.addEventListener("pointermove", handlePointerMove as EventListener)
      card.addEventListener("pointerleave", handlePointerLeave as EventListener, { passive: true })
    }

    let removeOrientation = () => {}
    if (
      !canHover &&
      enableMobileTilt &&
      typeof location !== "undefined" &&
      location.protocol === "https:"
    ) {
      const requestIOSPermission = async () => {
        const anyDO = window.DeviceOrientationEvent as unknown as {
          requestPermission?: () => Promise<"granted" | "denied">
        }
        if (typeof anyDO?.requestPermission === "function") {
          try {
            const state = await anyDO.requestPermission()
            if (state === "granted") {
              window.addEventListener(
                "deviceorientation",
                handleDeviceOrientation as EventListener,
                { passive: true }
              )
              removeOrientation = () =>
                window.removeEventListener(
                  "deviceorientation",
                  handleDeviceOrientation as EventListener
                )
            }
          } catch (e) {
            console.error(e)
          }
        } else {
          window.addEventListener("deviceorientation", handleDeviceOrientation as EventListener, {
            passive: true,
          })
          removeOrientation = () =>
            window.removeEventListener(
              "deviceorientation",
              handleDeviceOrientation as EventListener
            )
        }
      }

      const askOnTap = () => {
        requestIOSPermission()
        card.removeEventListener("click", askOnTap)
      }
      card.addEventListener("click", askOnTap)
      removeOrientation = () => {
        window.removeEventListener("deviceorientation", handleDeviceOrientation as EventListener)
        card.removeEventListener("click", askOnTap)
      }
    }

    const initialX = card.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET
    const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET
    animationHandlers.updateCardTransform(initialX, initialY, card)
    animationHandlers.createSmoothAnimation(
      ANIMATION_CONFIG.INITIAL_DURATION,
      initialX,
      initialY,
      card
    )

    return () => {
      if (canHover) {
        card.removeEventListener("pointerenter", handlePointerEnter as EventListener)
        card.removeEventListener("pointermove", handlePointerMove as EventListener)
        card.removeEventListener("pointerleave", handlePointerLeave as EventListener)
      }
      removeOrientation()
      animationHandlers.cancelAnimation()
    }
  }, [
    canHover,
    enableTilt,
    enableMobileTilt,
    animationHandlers,
    handlePointerMove,
    handlePointerEnter,
    handlePointerLeave,
    handleDeviceOrientation,
  ])

  const cardStyle = useMemo(
    () =>
      ({
        "--inner-gradient": innerGradient ? `url("${innerGradient}")` : "none",
        "--behind-gradient": showBehindGradient
          ? (behindGradient ?? DEFAULT_BEHIND_GRADIENT)
          : "none",
        "--icon": "none",
        "--grain": grainUrl ? `url(${grainUrl})` : "none",
        "border-radius": "1.25rem",
        aspectRatio: "2 / 3",
      }) as React.CSSProperties,
    [innerGradient, grainUrl, showBehindGradient, behindGradient]
  )

  return (
    <div className="flex flex-col items-center">
      <section ref={cardRef} className={`pc-card radius-2xl ${className}`.trim()} style={cardStyle}>
        <div className="pc-inside">
          <div className="pc-shine" />
          <div className="pc-glare" />
          <div className="pc-content border-2 md:border-0 border-gray-500 rounded-2xl md:rounded-none">
            <div
              className="absolute left-1/2 -translate-x-1/2
                top-[25.52%] -translate-y-1/2 w-[38%] aspect-square overflow-hidden rounded-full p-0.5"
              style={{ backgroundImage: AVATAR_RING_GRADIENT }}
            >
              <Avatar className="w-full h-full">
                <AvatarImage src={finalAvatar} className="w-full h-full object-cover" />
                <AvatarFallback className="rounded-full">{userInitials}</AvatarFallback>
              </Avatar>
            </div>

            <div className="absolute top-[45.34%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[83%] grid place-items-center text-white pointer-events-auto">
              <p className="text-lg sm:text-xl font-bold leading-tight wrap-break-word text-center">
                {`${firstName} ${lastName}`}
              </p>
            </div>

            <div className="absolute top-[56.2%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] flex items-center justify-center pointer-events-auto">
              <p className="text-lg sm:text-xl font-medium text-white text-center truncate">
                {role}
              </p>
            </div>

            <div className="absolute top-[80.37%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[46.1%] aspect-square bg-white rounded-xl p-2.5 shadow-md">
              <img
                src={qrUrl}
                alt="Código QR de la credencial"
                className="w-full h-full rounded-sm object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={handleShare}
          disabled={isSharing}
          className="flex items-center gap-2.5 bg-white text-black font-semibold text-sm sm:text-base px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-100 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
        >
          {isSharing ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          ) : (
            <Share2 className="w-5 h-5 text-gray-800" />
          )}
          <span>{isSharing ? "Generando credencial..." : "Compartir Credencial"}</span>
        </button>
      </div>
    </div>
  )
}

const CredentialCard = React.memo(CredentialCardComponent)
export default CredentialCard
