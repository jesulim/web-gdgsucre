import { useEffect } from "react"
import { triggerConfetti } from "@/lib/confetti"

export function ConfettiEffect() {
  useEffect(() => {
    triggerConfetti()
  }, [])

  return null
}
