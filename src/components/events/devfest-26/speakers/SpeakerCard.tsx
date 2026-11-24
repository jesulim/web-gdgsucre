import Atropos from "atropos/react"
import "atropos/css"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const areaStyles = [
  "border-blue-500 text-blue-500",
  "border-yellow-500 text-yellow-500",
  "border-red-500 text-red-500",
  "border-green-500 text-green-500",
]

export interface SpeakersCardProps {
  area: string
  img: string
  name: string
  bio: string
  index: number
}

export const SpeakerCard = ({ area, img, name, bio, index }: SpeakersCardProps) => {
  const gradient = index % 2 === 0 ? "from-blue-500 to-red-500" : "from-yellow-500 to-green-500"
  const areaStyle = areaStyles[index % areaStyles.length]

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group w-full cursor-pointer text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/50 rounded-2xl"
          aria-label={`Ver detalles de ${name}`}
        >
          <Atropos className="atropos-banner w-full h-full" rotateTouch="scroll-y" shadow={false}>
            <div className="flex h-full mx-1 flex-col gap-4 rounded-2xl border bg-linear-to-b from-white/20 to-white/5 p-4 md:p-6 transition-colors group-hover:border-white/30">
              <span
                className={`mx-auto px-2 w-fit rounded-full border text-sm sm:text-base text-center font-medium bg-black ${areaStyle}`}
              >
                {area}
              </span>

              <div
                className={`mx-auto w-32 md:w-40 rounded-full bg-linear-to-r ${gradient} p-1`}
                data-atropos-offset="3"
              >
                <img
                  src={img}
                  alt={name}
                  className="size rounded-full object-cover"
                  loading="lazy"
                />
              </div>

              <h3
                className="text-center text-xl font-bold text-white sm:text-left md:text-2xl"
                data-atropos-offset="2"
              >
                {name}
              </h3>

              <p
                className="hidden text-md text-white/80 sm:line-clamp-1 md:line-clamp-5 font-monospace"
                data-atropos-offset="1"
              >
                {bio}
              </p>
            </div>
          </Atropos>
        </button>
      </DialogTrigger>

      <DialogContent className="speaker-modal bg-white text-neutral-900 border-neutral-200 sm:max-w-md">
        <DialogHeader className="text-left">
          <DialogTitle className="text-xl font-bold text-neutral-900 sm:text-2xl">
            {name}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-neutral-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {bio}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
