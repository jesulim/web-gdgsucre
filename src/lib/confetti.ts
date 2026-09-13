import confetti from "canvas-confetti"

export function triggerConfetti() {
  const duration = 2.5 * 1000
  const animationEnd = Date.now() + duration
  const defaults = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 9999,
    colors: ["#4285F4", "#EA4335", "#FBBC04", "#34A853", "#A142F4"],
  }

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min
  }

  // Initial burst from center-bottom
  confetti({
    ...defaults,
    particleCount: 80,
    scalar: 1.2,
    origin: { y: 0.6 },
  })

  // Side cannons during 2 seconds
  const interval: ReturnType<typeof setInterval> = setInterval(() => {
    const timeLeft = animationEnd - Date.now()

    if (timeLeft <= 0) {
      return clearInterval(interval)
    }

    const particleCount = 40 * (timeLeft / duration)

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    })
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    })
  }, 250)
}
