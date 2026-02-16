import { AnimatePresence, motion } from "motion/react"
import { memo, useEffect, useRef } from "react"
import { useTimer } from "@/hooks/useTimer"

const zeroPad = (value: number): string => `${value}`.padStart(2, "0")

const usePrevious = <T,>(value: T): T => {
  const ref = useRef<T>(value)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}

interface AnimatedValueProps {
  value: number
}

const AnimatedValue = memo<AnimatedValueProps>(({ value }) => {
  const previousValue = usePrevious(value)
  const hasChanged = previousValue !== value

  if (hasChanged) {
    return (
      <AnimatePresence mode="wait">
        <motion.div
          key={value}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {zeroPad(value)}
        </motion.div>
      </AnimatePresence>
    )
  }

  return <div className="absolute inset-0 flex items-center justify-center">{zeroPad(value)}</div>
})

AnimatedValue.displayName = "AnimatedValue"

interface TimeUnitProps {
  label: string
  value: number
}

const TimeUnit = memo<TimeUnitProps>(({ label, value }) => (
  <div className="flex w-24 flex-col items-center justify-center gap-0 border-2 border-[#1976D2] bg-white px-3 py-2 sm:w-36 sm:border-3 sm:px-6 sm:py-3 md:w-48 md:px-9 md:py-5 lg:w-60 lg:px-15 lg:py-6 shadow-lg">
    <div className="relative h-12 w-full overflow-visible text-center sm:h-18 md:h-24 lg:h-36">
      <div className="flex items-center justify-center h-full w-full text-5xl font-bold leading-none text-[#1976D2] sm:text-7xl md:text-8xl lg:text-9xl tracking-tight">
        <AnimatedValue value={value} />
      </div>
    </div>
    <span className="whitespace-nowrap text-xs font-bold text-[#ebb842] sm:text-sm md:text-lg lg:text-xl uppercase tracking-widest">
      {label}
    </span>
  </div>
))

TimeUnit.displayName = "TimeUnit"

interface TimerProps {
  initialTime: number
  targetDate: Date
  labels?: {
    days: string
    hours: string
    minutes: string
    seconds: string
  }
  ongoingMessage?: string
  finishedMessage?: string
}

export const Timer = ({
  initialTime,
  targetDate,
  labels = {
    days: "Días",
    hours: "Hrs",
    minutes: "Mins",
    seconds: "Segs",
  },
  ongoingMessage = "¡Empezó el WTM Sucre 2026!",
  finishedMessage = "¡Gracias por ser parte del WTM Sucre 2026!",
}: TimerProps) => {
  const endDate = targetDate instanceof Date ? targetDate : new Date(targetDate)

  // Use the hook with endDate
  const { days, hours, minutes, seconds } = useTimer(initialTime, endDate)

  if (initialTime <= 0 || (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0)) {
    return (
      <div className="mt-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-[#4285F4] md:text-3xl lg:text-4xl"
        >
          {days < -1 || (days === 0 && hours < -8) ? finishedMessage : ongoingMessage}
        </motion.div>
      </div>
    )
  }

  const timeUnits = [
    { label: labels.days, value: days },
    { label: labels.hours, value: hours },
    { label: labels.minutes, value: minutes },
    { label: labels.seconds, value: seconds },
  ]

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-5 md:gap-6 lg:gap-9">
      {timeUnits.map(unit => (
        <TimeUnit key={unit.label} {...unit} />
      ))}
    </div>
  )
}
