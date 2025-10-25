import { useEffect, useRef, useState } from "react"

interface TimeRemaining {
  days: number
  hours: number
  minutes: number
  seconds: number
}

/**
 * Converts milliseconds to days, hours, minutes, and seconds
 * @param milliseconds - The time in milliseconds to convert
 * @returns Object containing days, hours, minutes, and seconds
 */
const toDatetime = (milliseconds: number): TimeRemaining => {
  const MS_PER_SECOND = 1000
  const MS_PER_MINUTE = MS_PER_SECOND * 60
  const MS_PER_HOUR = MS_PER_MINUTE * 60
  const MS_PER_DAY = MS_PER_HOUR * 24

  const days = Math.floor(milliseconds / MS_PER_DAY)
  const hours = Math.floor((milliseconds % MS_PER_DAY) / MS_PER_HOUR)
  const minutes = Math.floor((milliseconds % MS_PER_HOUR) / MS_PER_MINUTE)
  const seconds = Math.floor((milliseconds % MS_PER_MINUTE) / MS_PER_SECOND)

  return { days, hours, minutes, seconds }
}

/**
 * Custom hook that manages a countdown timer
 * @param initialTime - Initial time remaining in milliseconds
 * @param endTime - Target date/time for the countdown
 * @returns Object containing remaining days, hours, minutes, and seconds
 */
export const useTimer = (initialTime: number, endTime: Date): TimeRemaining => {
  const [remainingMillis, setRemainingMillis] = useState<number>(initialTime)
  const endTimeRef = useRef(endTime)

  // Update ref when endTime changes
  useEffect(() => {
    endTimeRef.current = endTime
  }, [endTime])

  useEffect(() => {
    const calculateRemaining = () => {
      return endTimeRef.current.getTime() - Date.now()
    }

    // Immediately calculate to ensure accuracy
    setRemainingMillis(calculateRemaining())

    const timer = setInterval(() => {
      const remaining = calculateRemaining()
      setRemainingMillis(remaining)

      // Stop the timer when countdown reaches zero
      if (remaining <= 0) {
        clearInterval(timer)
      }
    }, 1000)

    return () => {
      clearInterval(timer)
    }
  }, []) // Empty dependency array is correct - we want this to run once and use the ref

  return toDatetime(Math.max(0, remainingMillis))
}
