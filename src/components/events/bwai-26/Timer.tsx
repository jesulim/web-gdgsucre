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
  large?: boolean
}

// Mobile cell: white bg, border-[1.5px], py-3, text-36px
// Desktop cell: rgba(255,255,255,0.08) bg, border-[1.5px], px-[6px] py-[14px], text-60px
const TimeUnit = memo<TimeUnitProps>(({ label, value, large = false }) => (
  <div
    className={
      large
        ? "bg-[rgba(255,255,255,0.08)] border-[#1e1e1e] border-[1.5px] border-solid flex flex-col flex-1 items-center overflow-hidden px-[6px] py-[14px] relative rounded-[14px]"
        : "bg-white border-[#1e1e1e] border-[1.5px] border-solid flex flex-col flex-1 items-center overflow-hidden py-3 px-1 relative rounded-[14px]"
    }
  >
    <div className={`relative w-full text-center ${large ? "h-[60px]" : "h-[40px]"}`}>
      <div
        className={`relative h-full w-full font-['Google_Sans',sans-serif] font-bold text-[#1e1e1e] ${
          large ? "text-[60px] tracking-[-1.8px]" : "text-[36px] tracking-tight"
        }`}
      >
        <AnimatedValue value={value} />
      </div>
    </div>
    <span
      className={`font-['Google_Sans',sans-serif] font-bold uppercase ${
        large
          ? "text-[16px] tracking-[2.88px] opacity-75 mt-0"
          : "text-[10px] tracking-[1.5px] opacity-75 mt-1"
      }`}
    >
      {label}
    </span>
  </div>
))

TimeUnit.displayName = "TimeUnit"

interface TimerProps {
  initialTime: number
  targetDate: Date
  large?: boolean
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
  large = false,
  labels = {
    days: "Días",
    hours: "Hrs",
    minutes: "Min",
    seconds: "Seg",
  },
}: TimerProps) => {
  const [mounted, setMounted] = useState(false)
  const endDate = targetDate instanceof Date ? targetDate : new Date(targetDate)

  const { days, hours, minutes, seconds } = useTimer(initialTime, endDate)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  const clampedDays = days > 0 ? days : 0
  const clampedHours = hours > 0 ? hours : 0
  const clampedMinutes = minutes > 0 ? minutes : 0
  const clampedSeconds = seconds > 0 ? seconds : 0

  const timeUnits: TimeUnitProps[] = [
    { label: labels.days, value: clampedDays, large },
    { label: labels.hours, value: clampedHours, large },
    { label: labels.minutes, value: clampedMinutes, large },
    { label: labels.seconds, value: clampedSeconds, large },
  ]

  return (
    <div className="flex gap-2 w-full">
      {timeUnits.map(unit => (
        <TimeUnit key={unit.label} {...unit} />
      ))}
    </div>
  )
}
