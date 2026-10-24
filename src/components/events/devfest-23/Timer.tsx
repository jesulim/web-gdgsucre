import type React from "react"
import { useEffect, useState } from "react"

type RemainingDate<T> = {
  days: T
  hours: T
  minutes: T
  seconds: T
}

const alwaysPositive = (value: number) => Math.max(0, value)

const getRemainingTime = (targetDate: Date) => {
  const currentDate = new Date()
  const difference = targetDate.getTime() - currentDate.getTime()

  const days = alwaysPositive(Math.floor(difference / (1000 * 60 * 60 * 24)))
  const hours = alwaysPositive(Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)))
  const minutes = alwaysPositive(Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)))
  const seconds = alwaysPositive(Math.floor((difference % (1000 * 60)) / 1000))

  return { days, hours, minutes, seconds }
}

const fillZeros = (remainingDate: RemainingDate<number>): RemainingDate<string> => {
  return {
    days: `${remainingDate.days}`.padStart(2, "0"),
    hours: `${remainingDate.hours}`.padStart(2, "0"),
    minutes: `${remainingDate.minutes}`.padStart(2, "0"),
    seconds: `${remainingDate.seconds}`.padStart(2, "0"),
  }
}

export const useTimer = (targetDate: Date) => {
  const [remainingDate, setRemainingDate] = useState(() => getRemainingTime(targetDate))

  const { seconds, minutes, hours, days } = remainingDate
  const continueTime = days === 0 && hours === 0 && minutes === 0 && seconds === 0

  useEffect(() => {
    if (continueTime) return

    const timer = setInterval(() => {
      setRemainingDate(getRemainingTime(targetDate))
    }, 1000)

    return () => clearInterval(timer)
  }, [continueTime, targetDate])

  return { ...fillZeros(remainingDate), continueTime }
}

export interface TimerProps {
  targetDate: Date | string
}

export const Timer: React.FC<TimerProps> = ({ targetDate }) => {
  const parsedDate = typeof targetDate === "string" ? new Date(targetDate) : targetDate
  const { days, hours, minutes, seconds, continueTime } = useTimer(parsedDate)

  if (continueTime) {
    return (
      <div className="mb-2 font-bold text-2xl text-df23-yellow animate-bounce">
        ¡Evento Concluido!
      </div>
    )
  }

  const time = [
    { label: "Días", value: days },
    { label: "Horas", value: hours },
    { label: "Minutos", value: minutes },
    { label: "Segundos", value: seconds },
  ]

  return (
    <>
      <span className="mb-2 lg:-mb-2 text-2xl">Faltan:</span>
      <section className="flex justify-center">
        {time.map(({ label, value }, index) => {
          const isLast = index === time.length - 1

          return (
            <div className="flex flex-col w-20 sm:w-24 lg:w-36 items-center" key={label}>
              <div
                className={`text-white font-bold font-quantico text-5xl lg:text-7xl relative ${
                  !isLast
                    ? 'after:ml-2 after:font-bold after:text-df23-yellow after:content-[""] after:absolute lg:after:ml-5'
                    : ""
                }`}
              >
                {value}
              </div>
              {label && <span className="text-df23-yellow text-sm lg:text-base">{label}</span>}
            </div>
          )
        })}
      </section>
      <h2 className="text-2xl lg:text-3xl text-blue-500 text-df23-blue">Sábado 09 de diciembre</h2>
    </>
  )
}
