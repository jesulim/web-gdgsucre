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
        <motion.div
          key={value}
          initial={{ y: 15, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -15, opacity: 0 }}
          transition={{ duration: 0.25, ease: "easeInOut" }}
          className="inline-block"
        >
          {zeroPad(value)}
        </motion.div>
      </AnimatePresence>
    )
  }

  return <span className="inline-block">{zeroPad(value)}</span>
})

AnimatedValue.displayName = "AnimatedValue"

interface TimerProps {
  initialTime: number
  targetDate: string | Date
}

export const Timer = ({ initialTime, targetDate }: TimerProps) => {
  const dateObj = typeof targetDate === "string" ? new Date(targetDate) : targetDate
  const { days, hours, minutes, seconds } = useTimer(initialTime, dateObj)

  const isCompleted = initialTime <= 0 || (days <= 0 && hours <= 0 && minutes <= 0 && seconds <= 0)

  if (isCompleted) {
    return (
      <div className="mt-8 font-bold text-2xl md:text-4xl text-blue-500 text-center">
        ¡Evento Concluido!
        <p className="text-base md:text-lg font-normal text-neutral-600 dark:text-neutral-400 mt-2">
          Gracias por ser parte del Google I/O Extended Sucre 2024
        </p>
      </div>
    )
  }

  const timeUnits = [
    { label: "Días", value: days },
    { label: "Horas", value: hours },
    { label: "Minutos", value: minutes },
    { label: "Segundos", value: seconds },
  ]

  return (
    <div className="flex gap-3 sm:gap-6 mt-6">
      {timeUnits.map(unit => (
        <div
          key={unit.label}
          className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-neutral-100 dark:bg-neutral-800 border-2 border-black dark:border-white min-w-16 sm:min-w-24 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]"
        >
          <div className="text-2xl sm:text-4xl font-bold text-neutral-900 dark:text-white">
            <AnimatedValue value={unit.value} />
          </div>
          <span className="text-xs sm:text-sm font-medium text-neutral-600 dark:text-neutral-400 mt-1">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  )
}
