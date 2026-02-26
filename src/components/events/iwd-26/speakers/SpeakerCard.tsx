export interface Props {
  id: string
  title: string
  img: string
  name: string
  description: string
  skills?: string[]
}

export const SpeakerCard = ({ id, title, img, name, description, skills }: Props) => {
  return (
    <div className="card-speaker flex flex-col rounded-lg overflow-hidden shadow-lg">
      <div className="mb-2 flex flex-col h-full overflow-hidden"></div>
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
      </div>
      <div className="p-4">
        <div className="text-sm font-semibold text-blue-500 mb-1" id="skills">
          {skills &&
            skills.map(skill => (
              <span
                key={skill}
                className="inline-block bg-white rounded-full px-2 py-1 text-xs mr-2 mb-1 border border-blue-500"
              >
                {skill}
              </span>
            ))}
        </div>
        <h1 className="text-xl font-semibold">{name}</h1>
        <h2 className="text-sm text-gray-500">@CTO TechFlow</h2>
        <p className="text-sm text-gray-600 mt-2 line-clamp-3 leading-relaxed">{title}</p>
      </div>
    </div>
  )
}
