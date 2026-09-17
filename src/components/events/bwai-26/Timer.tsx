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
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -15, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="inset-0 flex items-center justify-center"
        >
          {zeroPad(value)}
        </motion.div>
      </AnimatePresence>
    )
  }

  return <div className="inset-0 flex items-center justify-center">{zeroPad(value)}</div>
})

AnimatedValue.displayName = "AnimatedValue"

interface TimeUnitProps {
  label: string
  value: number
}

const TimeUnit = memo<TimeUnitProps>(({ label, value }) => (
  <div className="border-black border-2 flex flex-col flex-1 items-center overflow-hidden px-1.5 py-2 md:py-4 relative rounded-xl">
    <div className="font-bold text-black text-4xl md:text-7xl">
      <AnimatedValue value={value} />
    </div>
    <span className="block font-bold uppercase text-sm md:text-lg tracking-widest opacity-75 mt-0">
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
}

export const Timer = ({
  initialTime,
  targetDate,
  labels = {
    days: "Días",
    hours: "Hrs",
    minutes: "Min",
    seconds: "Seg",
  },
}: TimerProps) => {
  const endDate = targetDate instanceof Date ? targetDate : new Date(targetDate)

  const { days, hours, minutes, seconds } = useTimer(initialTime, endDate)

  const clampedDays = days > 0 ? days : 0
  const clampedHours = hours > 0 ? hours : 0
  const clampedMinutes = minutes > 0 ? minutes : 0
  const clampedSeconds = seconds > 0 ? seconds : 0

  if (clampedDays === 0 && clampedHours === 0 && clampedMinutes === 0 && clampedSeconds === 0) {
    return (
      <p className="text-3xl font-medium animate-bounce pt-4">
        ¡Comenzó el Build With AI Sucre 2026!
      </p>
    )
  }

  const timeUnits: TimeUnitProps[] = [
    { label: labels.days, value: clampedDays },
    { label: labels.hours, value: clampedHours },
    { label: labels.minutes, value: clampedMinutes },
    { label: labels.seconds, value: clampedSeconds },
  ]

  return (
    <>
      <p className="font-bold text-xl tracking-tight leading-tight lg:text-4xl">
        Faltan para comenzar
      </p>
      <div className="flex gap-2 w-full">
        {timeUnits.map(unit => (
          <TimeUnit key={unit.label} {...unit} />
        ))}
      </div>
    </>
  )
}
