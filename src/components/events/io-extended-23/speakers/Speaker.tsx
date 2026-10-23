import Atropos from "atropos/react"

export interface Props {
  id: string
  img: string
  name: string
}

export const Speaker = ({ id, img, name }: Props) => {
  return (
    <Atropos className="atropos-banner" rotateTouch="scroll-y">
      <div className="relative" key={id}>
        <img
          src={img}
          alt={name}
          className="w-auto h-60 lg:h-80 xl:h-96 object-cover object-center"
          data-atropos-offset="-4.5"
        />
        <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2">
          <div
            data-atropos-offset="-2"
            className="p-0 before:block before:absolute before:-inset-1 before:-skew-y-3 before:bg-yellow-500 relative inline-block w-max"
          >
            <span
              data-atropos-offset="4.5"
              className="relative inline-block text-black text-lg md:text-2xl"
            >
              {name}
            </span>
          </div>
        </div>
      </div>
    </Atropos>
  )
}
