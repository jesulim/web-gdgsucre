import "./speaker.css"

export interface Props {
  id: string
  title: string
  img: string
  name: string
  description: string
  countryFlag: string
}

export const SpeakerCard = ({ id, title, img, name, countryFlag, description }: Props) => {
  return (
    <div key={id} className="card-speaker flex flex-col">
      {/* Header */}
      <div className="mb-2 flex flex-col h-full rounded-lg shadow-md overflow-hidden">
        <h1 className="text-xl text-white">{title}</h1>
      </div>

      {/* Imagen y datos */}
      <div className="relative">
        <img src={img} alt={name} className="rounded-lg w-full object-cover" />
        <div className="absolute bottom-2 left-2">
          <h2 className="text-lg font-semibold text-white">{name}</h2>
          <p className="text-sm" style={{ color: "#EA4535" }}>
            {description}
          </p>
        </div>
      </div>
    </div>
  )
}
