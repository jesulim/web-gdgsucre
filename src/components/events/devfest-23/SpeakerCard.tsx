import type React from "react"
import { Tilt3DCard } from "./Tilt3DCard"

export interface SpeakerCardProps {
  id: number | string
  img: string
  name: string
  bgSrc: string
}

export const SpeakerCard: React.FC<SpeakerCardProps> = ({ id, img, name, bgSrc }) => {
  return (
    <Tilt3DCard className="atropos-banner">
      <div className="relative" key={id}>
        <img
          src={bgSrc}
          alt=""
          className="w-full h-full block"
          data-atropos-offset="0"
          loading="lazy"
        />
        <img
          src={img}
          alt={name}
          className="absolute inset-0 mx-auto h-full object-cover block"
          data-atropos-offset="-4.5"
          loading="lazy"
        />
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
          <div data-atropos-offset="-2" className="px-2 bg-black relative inline-block w-max">
            <span
              data-atropos-offset="5"
              className="font-emoji relative inline-block text-white text-md md:text-xl"
            >
              {name}
            </span>
          </div>
        </div>
      </div>
    </Tilt3DCard>
  )
}
