export interface Props {
  id: string
  title: string
  img: string
  name: string
  description: string
}

export const SpeakerCard = ({ id, title, img, name, description }: Props) => {
  return (
    <div key={id} className="card-speaker flex flex-col">
      <div className="mb-2 flex flex-col h-full overflow-hidden">
        <h1 className="text-xl">{title}</h1>
      </div>

      <div className="relative">
        <img
          src={img}
          alt={name}
          className="w-full object-cover"
          width="340"
          height="301"
          loading="lazy"
          decoding="async"
        />
        <div className="absolute bottom-2 left-2">
          <h2 className="text-lg font-semibold">{name}</h2>
          <p className="text-sm text-red-500">{description}</p>
        </div>
      </div>
    </div>
  )
}
