import { useRef } from "react"

import abiertoIcon from "@/assets/events/devfest-25/abierto.svg"
import cerradoIcon from "@/assets/events/devfest-25/cerrado.svg"
import derechaIcon from "@/assets/events/devfest-25/derecha.svg"
import izquierdaIcon from "@/assets/events/devfest-25/izquierda.svg"

export type Organizer = {
  id: number
  image: string | null
  first_name: string
  last_name: string
  areas: string
}

type Props = { organizers: Organizer[] }

export default function OrganizersSlider({ organizers }: Props) {
  const ref = useRef<HTMLDivElement | null>(null)

  const scroll = (direction: "left" | "right") => {
    const el = ref.current
    if (!el) return
    const amount = Math.round(el.clientWidth * 0.9)
    const next = direction === "left" ? el.scrollLeft - amount : el.scrollLeft + amount
    el.scrollTo({ left: next, behavior: "smooth" })
  }

  if (!organizers?.length) return null

  return (
    <section className="relative w-full px-4 md:px-8 my-8">
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 ml-6 hidden md:block"
      >
        <img
          className="pointer-events-none"
          src={izquierdaIcon.src}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </button>
      <div
        ref={ref}
        className="flex overflow-x-auto overflow-y-hidden scroll-smooth snap-x snap-mandatory gap-8 md:gap-11 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {organizers.map(organizer => (
          <div
            key={organizer.id}
            className="snap-start snap-always shrink-0 flex flex-col w-fit gap-6 md:gap-10 justify-start items-center px-5 py-6 md:p-8 border-4 rounded-4xl border-white"
          >
            <div className="h-32 md:h-52 rounded-4xl flex gap-2.5 md:gap-4">
              <img src={abiertoIcon.src} alt="" loading="lazy" decoding="async" />
              {organizer.image ? (
                <img
                  className="w-full h-full object-cover rounded-4xl"
                  src={organizer.image}
                  alt={`${organizer.first_name} ${organizer.last_name}`}
                  width="208"
                  height="208"
                  loading="lazy"
                  decoding="async"
                />
              ) : (
                <div>No se encontró imagen</div>
              )}
              <img src={cerradoIcon.src} alt="" loading="lazy" decoding="async" />
            </div>
            <div className="max-w-52 md:max-w-80 flex flex-col gap-1">
              <p className="font-semibold text-lg md:text-3xl text-center">
                {organizer.first_name} {organizer.last_name}
              </p>
              <p className="font-medium text-sm md:text-2xl text-center text-red-500">
                {organizer.areas}
              </p>
            </div>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 mr-6 hidden md:block cursor-pointer"
      >
        <img
          className="pointer-events-none"
          src={derechaIcon.src}
          alt=""
          loading="lazy"
          decoding="async"
        />
      </button>
    </section>
  )
}
