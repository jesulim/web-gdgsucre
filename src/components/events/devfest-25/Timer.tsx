import { AnimatePresence, motion } from "motion/react"
import { memo, useEffect, useRef, useState } from "react"
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
  <div className="flex w-20 flex-col items-center justify-center gap-0 rounded-2xl border-3 border-white/80 bg-transparent px-4 py-2 sm:w-28 sm:rounded-3xl sm:border-4 sm:px-6 sm:py-2 md:w-36 md:px-8 md:py-3 lg:w-44 lg:px-12 lg:py-4">
    <div className="relative h-10 w-full overflow-visible text-center sm:h-16 md:h-20 lg:h-28">
      <div className="relative h-full w-full text-4xl font-semibold leading-none text-red-500 sm:text-6xl md:text-7xl lg:text-8xl sm:font-semibold">
        <AnimatedValue value={value} />
      </div>
    </div>
    <span className="whitespace-nowrap text-sm font-medium text-white sm:text-base md:text-lg lg:text-xl">
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
  completionMessage?: string
}

export const Timer = ({
  initialTime,
  targetDate,
  labels = {
    days: "Días",
    hours: "Horas",
    minutes: "Minutos",
    seconds: "Segundos",
  },
  completionMessage = "¡Empezó el DevFest 2025!",
}: TimerProps) => {
  const endDate = targetDate instanceof Date ? targetDate : new Date(targetDate)

  const { days, hours, minutes, seconds } = useTimer(initialTime, endDate)

  // hide timer when more than 1 day has passed since the event began
  if (days < -1) {
    return null
  }

  if (initialTime <= 0 || seconds < 0) {
    return (
      <div className="mt-8 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-bold text-red-500 md:text-3xl lg:text-4xl"
        >
          {completionMessage}
        </motion.div>
      </div>
    )
  }

  const timeUnits: TimeUnitProps[] = [
    { label: labels.days, value: days },
    { label: labels.hours, value: hours },
    { label: labels.minutes, value: minutes },
    { label: labels.seconds, value: seconds },
  ]

  return (
    <div className="flex items-center justify-center gap-3 sm:gap-6 md:gap-8 lg:gap-10">
      {timeUnits.map(unit => (
        <TimeUnit key={unit.label} {...unit} />
      ))}
    </div>
  )
}
