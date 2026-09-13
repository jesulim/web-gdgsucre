import { useEffect, useMemo, useState } from "react"

function useCountdown(target: Date) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const diff = Math.max(0, target.getTime() - now)
  return {
    days: Math.floor(diff / 86400000),
    hours: Math.floor((diff % 86400000) / 3600000),
    mins: Math.floor((diff % 3600000) / 60000),
    secs: Math.floor((diff % 60000) / 1000),
  }
}

export function Countdown() {
  // May 27, 2026 — Día de la Madre en Bolivia
  const target = useMemo(() => new Date(2026, 4, 27, 0, 0, 0), [])
  const { days, hours, mins, secs } = useCountdown(target)
  const cells = [
    { v: days, l: "días" },
    { v: hours, l: "horas" },
    { v: mins, l: "min" },
    { v: secs, l: "seg" },
  ]
  return (
    <div
      className="w-full bg-white border-2 border-[#0F1A2B] rounded-2xl p-5"
      style={{ boxShadow: "6px 6px 0 #0F1A2B" }}
    >
      <div className="flex items-center gap-2 mb-3">
        <span className="w-2 h-2 rounded-full bg-[#1F6FE5] animate-pulse flex-shrink-0" />
        <span className="font-mono text-[11px] lg:text-sm uppercase tracking-[0.12em] text-[#3C4A5E]">
          Faltan para el 27 de mayo
        </span>
      </div>
      <div className="grid grid-cols-4 gap-1.5">
        {cells.map(c => (
          <div
            key={c.l}
            className="flex flex-col items-center py-2.5 px-1 rounded-xl"
            style={{ background: "rgba(31,111,229,0.07)" }}
          >
            <span className="font-google text-[#1F6FE5] text-[30px] lg:text-[42px] font-bold leading-none tabular-nums tracking-tight">
              {String(c.v).padStart(2, "0")}
            </span>
            <span className="font-mono text-[#3C4A5E] text-[10px] lg:text-xs uppercase tracking-wide mt-1">
              {c.l}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
