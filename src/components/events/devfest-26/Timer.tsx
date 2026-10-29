import { AnimatePresence, motion } from "motion/react"
import { memo, useEffect, useRef } from "react"
import { useTimer } from "@/hooks/useTimer"

const zeroPad = (value: number): string => `${Math.max(0, value)}`.padStart(2, "0")

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
        <motion.span
          key={value}
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -20, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute inset-0 z-10 flex items-center justify-center"
        >
          {zeroPad(value)}
        </motion.span>
      </AnimatePresence>
    )
  }

  return (
    <span className="absolute inset-0 z-10 flex items-center justify-center">{zeroPad(value)}</span>
  )
})

AnimatedValue.displayName = "AnimatedValue"

interface TimeUnitProps {
  label: string
  value: number
  tone: "blue" | "red" | "yellow" | "green"
}

const toneClasses = {
  blue: "text-[#eaf2ff]",
  red: "text-[#fff1ef]",
  yellow: "text-[#fff9e7]",
  green: "text-[#effff4]",
} as const

const glowClasses = {
  blue: "bg-[radial-gradient(circle,_rgb(66_133_244_/_0.36)_0%,_rgb(66_133_244_/_0.16)_24%,_transparent_74%)]",
  red: "bg-[radial-gradient(circle,_rgb(234_67_53_/_0.34)_0%,_rgb(234_67_53_/_0.14)_24%,_transparent_74%)]",
  yellow:
    "bg-[radial-gradient(circle,_rgb(251_188_4_/_0.32)_0%,_rgb(251_188_4_/_0.14)_24%,_transparent_74%)]",
  green:
    "bg-[radial-gradient(circle,_rgb(52_168_83_/_0.34)_0%,_rgb(52_168_83_/_0.14)_24%,_transparent_74%)]",
} as const

const TimeUnit = memo<TimeUnitProps>(({ label, value, tone }) => (
  <div className="relative flex shrink-0 flex-col items-center justify-center gap-2">
    <div
      className={`relative flex size-14 items-center justify-center text-4xl font-semibold leading-none tracking-tight sm:size-24 sm:text-5xl md:size-28 md:text-7xl ${toneClasses[tone]}`}
    >
      <span
        className={`pointer-events-none absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 animate-pulse rounded-full bg-no-repeat mix-blend-screen sm:size-40 md:size-48 ${glowClasses[tone]}`}
        aria-hidden="true"
      />
      <AnimatedValue value={value} />
    </div>
    <span className="text-sm font-medium uppercase tracking-wider text-white/60 sm:text-base">
      {label}
    </span>
  </div>
))

TimeUnit.displayName = "TimeUnit"

interface TimerProps {
  initialTime: number
  targetDate: Date
}

export const Timer = ({ initialTime, targetDate }: TimerProps) => {
  const { days, hours, minutes, seconds } = useTimer(Math.max(0, initialTime), targetDate)
  const hasStarted = initialTime <= 0 || (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0)

  if (hasStarted) {
    return (
      <div className="mt-8 text-center text-lg font-semibold text-white sm:text-2xl">
        El evento ya comenzó
      </div>
    )
  }

  const timeUnits: TimeUnitProps[] = [
    { label: "Días", value: days, tone: "blue" },
    { label: "Horas", value: hours, tone: "red" },
    { label: "Mins", value: minutes, tone: "yellow" },
    { label: "Segs", value: seconds, tone: "green" },
  ]

  return (
    <div
      className="w-full items-center px-4 py-0 sm:px-8 lg:px-16 lg:py-8 2xl:py-6"
      role="timer"
      aria-live="polite"
      aria-label="Cuenta regresiva para DevFest Sucre 2026"
    >
      <h2 className="mt-3 text-center text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl">
        El evento comienza en
      </h2>

      <div className="mx-auto max-w-md md:max-w-2xl">
        <div className="mt-8 grid w-full grid-cols-4 md:grid-cols-7 gap-2 md:gap-20">
          {timeUnits.map((unit, index) => (
            <>
              <TimeUnit {...unit} />
              {index < timeUnits.length - 1 && (
                <span className="hidden md:block text-white text-8xl mt-3 text-center">/</span>
              )}
            </>
          ))}
        </div>
        <div className="timer-spectrum mt-4 h-0.5 rounded-full" />
      </div>
    </div>
  )
}
