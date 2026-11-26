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

export interface SpeakersCardProps {
  index: number
  img: string
  name: string
  bio: string
  country: string
}

export const SpeakerCard = ({ index, img, name, bio, country }: SpeakersCardProps) => {
  const gradient = index % 2 === 0 ? "from-blue-500 to-red-500" : "from-yellow-500 to-green-500"

  return (
    <Dialog>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group w-full cursor-pointer text-left focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/50 rounded-2xl"
          aria-label={`Ver detalles de ${name}`}
        >
          <Atropos
            className="atropos-banner w-full h-full p-1"
            rotateTouch="scroll-y"
            shadow={false}
          >
            <div className="flex h-full flex-col gap-4 rounded-2xl border bg-linear-to-b from-white/20 to-white/5 p-4 md:p-6 transition-colors group-hover:border-white/30">
              <div
                className={`mx-auto w-32 lg:w-40 rounded-full bg-linear-to-r ${gradient} p-1`}
                data-atropos-offset="3"
              >
                <img src={img} alt={name} className="rounded-full object-cover" loading="lazy" />
              </div>

              <h3
                className="text-center text-xl font-bold text-white sm:text-left md:text-2xl"
                data-atropos-offset="2"
              >
                {name}
              </h3>

              <span
                className={"-mt-2 mx-auto w-full text-sm sm:text-base text-center sm:text-left"}
              >
                {country}
              </span>

              <p
                className="hidden text-md text-white/80 sm:line-clamp-2 md:line-clamp-5 font-monospace"
                data-atropos-offset="1"
              >
                {bio}
              </p>
            </div>
          </Atropos>
        </button>
      </DialogTrigger>

      <DialogContent className="bg-black text-white border-neutral-200 sm:max-w-md">
        <DialogHeader className="text-left flex flex-row items-center gap-4">
          <img src={img} alt={name} className="size-8 rounded-full" loading="lazy" />
          <DialogTitle className="text-xl font-bold sm:text-2xl">{name}</DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {bio}
        </DialogDescription>
      </DialogContent>
    </Dialog>
  )
}
