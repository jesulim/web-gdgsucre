import { useCallback, useEffect, useMemo, useRef } from "react"

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

interface CardTiltOptions {
  enableTilt?: boolean
  enableMobileTilt?: boolean
  mobileTiltSensitivity?: number
}

export function useCardTilt({
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 3,
}: CardTiltOptions = {}) {
  const cardRef = useRef<HTMLDivElement>(null)

  const canHover = useMemo(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false
    return window.matchMedia("(hover: hover)").matches
  }, [])

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

  return cardRef
}
