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
  <div className="flex w-[86px] flex-col items-center justify-center gap-0 border-2 border-[#1976D2] bg-white px-[11px] py-[7px] sm:w-[130px] sm:border-3 sm:px-[22px] sm:py-[11px] md:w-[173px] md:px-[32px] md:py-[18px] lg:w-[216px] lg:px-[54px] lg:py-[22px] shadow-lg">
    <div className="relative h-[43px] w-full overflow-visible text-center sm:h-[65px] md:h-[86px] lg:h-[130px]">
      <div className="flex items-center justify-center h-full w-full text-[2.7rem] font-bold leading-none text-[#1976D2] sm:text-[4.05rem] md:text-[5.4rem] lg:text-[7.2rem] tracking-tight">
        <AnimatedValue value={value} />
      </div>
    </div>
    <span className="whitespace-nowrap text-[0.675rem] font-bold text-[#ebb842] sm:text-[0.788rem] md:text-[1.013rem] lg:text-[1.125rem] uppercase tracking-widest">
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
    <div className="flex items-center justify-center gap-[11px] sm:gap-[18px] md:gap-[22px] lg:gap-[32px]">
      {timeUnits.map(unit => (
        <TimeUnit key={unit.label} {...unit} />
      ))}
    </div>
  )
}
