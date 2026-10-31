import type React from "react"
import { useCallback, useEffect, useRef, useState } from "react"

export interface Tilt3DCardProps {
  children: React.ReactNode
  className?: string
  shadow?: boolean
  maxTilt?: number
}

export const Tilt3DCard: React.FC<Tilt3DCardProps> = ({
  children,
  className = "",
  shadow = true,
  maxTilt = 15,
}) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isHovered, setIsHovered] = useState(false)
  const rafId = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current)
    }
  }, [])

  const updateOffsets = useCallback((x: number, y: number, active: boolean) => {
    if (!containerRef.current) return
    const offsetElements = containerRef.current.querySelectorAll<HTMLElement>(
      "[data-atropos-offset], [data-offset]"
    )

    offsetElements.forEach(el => {
      const rawOffset =
        el.getAttribute("data-atropos-offset") ?? el.getAttribute("data-offset") ?? "0"
      const offset = Number.parseFloat(rawOffset)
      if (Number.isNaN(offset)) return

      if (active) {
        el.style.transition = "transform 0.08s ease-out"
        // Move along offset without pushing layers behind each other in Z-space
        el.style.transform = `translate3d(${-x * offset * 3.5}px, ${-y * offset * 3.5}px, 0px)`
      } else {
        el.style.transition = "transform 0.4s cubic-bezier(0.03, 0.98, 0.52, 0.99)"
        el.style.transform = "translate3d(0, 0, 0)"
      }
    })
  }, [])

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 2
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 2

    if (rafId.current) cancelAnimationFrame(rafId.current)
    rafId.current = requestAnimationFrame(() => {
      if (!containerRef.current) return
      const rotateX = -y * maxTilt
      const rotateY = x * maxTilt

      containerRef.current.style.setProperty("--rotate-x", `${rotateX.toFixed(2)}deg`)
      containerRef.current.style.setProperty("--rotate-y", `${rotateY.toFixed(2)}deg`)
      containerRef.current.style.setProperty("--highlight-x", `${((x + 1) / 2) * 100}%`)
      containerRef.current.style.setProperty("--highlight-y", `${((y + 1) / 2) * 100}%`)

      updateOffsets(x, y, true)
    })
  }

  const handlePointerEnter = () => {
    setIsHovered(true)
  }

  const handlePointerLeave = () => {
    if (rafId.current) cancelAnimationFrame(rafId.current)
    setIsHovered(false)
    if (containerRef.current) {
      containerRef.current.style.setProperty("--rotate-x", "0deg")
      containerRef.current.style.setProperty("--rotate-y", "0deg")
    }
    updateOffsets(0, 0, false)
  }

  return (
    <div
      ref={containerRef}
      onPointerEnter={handlePointerEnter}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      onPointerCancel={handlePointerLeave}
      className={`relative select-none ${className}`}
      style={
        {
          perspective: "1000px",
          touchAction: "pan-y",
          "--rotate-x": "0deg",
          "--rotate-y": "0deg",
          "--highlight-x": "50%",
          "--highlight-y": "50%",
        } as React.CSSProperties
      }
    >
      {/* 3D Rotating Wrapper */}
      <div
        className="relative w-full h-full"
        style={{
          transformStyle: "preserve-3d",
          transform: isHovered
            ? "rotateX(var(--rotate-x)) rotateY(var(--rotate-y)) scale3d(1.02, 1.02, 1.02)"
            : "rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
          transition: isHovered
            ? "transform 0.08s ease-out"
            : "transform 0.4s cubic-bezier(0.03, 0.98, 0.52, 0.99)",
          boxShadow:
            shadow && isHovered
              ? "0 20px 40px -15px rgba(0, 0, 0, 0.7), 0 0 25px rgba(61, 139, 255, 0.2)"
              : shadow
                ? "0 10px 20px -10px rgba(0, 0, 0, 0.5)"
                : undefined,
        }}
      >
        {children}

        {/* Specular Highlight Overlay */}
        <div
          className="absolute inset-0 pointer-events-none rounded-[inherit] overflow-hidden"
          style={{
            background:
              "radial-gradient(circle at var(--highlight-x) var(--highlight-y), rgba(255, 255, 255, 0.28) 0%, rgba(255, 255, 255, 0) 65%)",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.25s ease-out",
            zIndex: 20,
          }}
        />
      </div>
    </div>
  )
}
