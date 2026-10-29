import { useState } from "react"
import { ModalSpeaker, type SocialNetworksType } from "./ModalSpeaker"

const bgColors = ["bg-[#FBBC04]", "bg-[#34A853]", "bg-[#EA4335]", "bg-[#4285F4]"]

export interface SpeakerCardProps {
  id: number
  img: string
  name: string
  location: string
  flag: string
  descriptions: Array<string>
  socialNetworks: Array<SocialNetworksType>
}

export const SpeakerCard = ({
  id,
  img,
  name,
  location,
  flag,
  descriptions,
  socialNetworks,
}: SpeakerCardProps) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)

  const openModal = () => {
    setIsModalOpen(true)
    document.body.style.overflow = "hidden"
  }
  const closeModal = () => {
    setIsModalOpen(false)
    document.body.style.overflow = "unset"
  }

  return (
    <div>
      <ModalSpeaker
        isOpen={isModalOpen}
        onClose={closeModal}
        data={{ name, descriptions, socialNetworks }}
      />

      {/* Card */}
      <div className="cut-corners-l pointer-events-auto h-full bg-black p-0.5 mix-blend-luminosity transition-all duration-300 dark:bg-white md:hover:!scale-100 md:hover:!blur-none md:group-hover:scale-[0.90] md:group-hover:blur-[1px]">
        <div className={`cut-corners-l h-full pb-2 pl-2 ${bgColors[id % 4]}`}>
          <div className="flex h-full flex-col items-center border-b-2 border-l-2 border-black bg-white px-2 pb-2 pt-4 text-center dark:border-white dark:bg-[#202124] dark:text-white sm:py-4 md:py-6">
            <img
              src={img}
              alt={name}
              className="w-11/12 rounded-full border-2 border-black dark:border-white sm:w-48 aspect-square object-cover"
              decoding="async"
              loading="lazy"
              width="500"
              height="500"
            />

            <span className="py-2 font-semibold leading-tight sm:text-2xl text-black dark:text-white">
              {name}
            </span>
            <div className="mb-auto flex items-center justify-center pb-4">
              <img
                width="30"
                height="15"
                src={flag}
                alt="country flag"
                className="pr-2 lg:w-8 h-auto"
                decoding="async"
                loading="lazy"
              />
              <p className="text-xs sm:text-lg text-black dark:text-white">{location}</p>
            </div>

            <button
              type="button"
              className="text-[#4285F4] hover:underline font-medium cursor-pointer"
              onClick={openModal}
            >
              Ver biografía
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
export default SpeakerCard
