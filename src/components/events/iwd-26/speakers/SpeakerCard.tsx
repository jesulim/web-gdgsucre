export interface Props {
  id: string
  title: string
  ciudad: string
  img: string
  name: string
  description: string
  description_summarize: string
  skills?: string[]
}

export const SpeakerCard = ({
  id,
  title,
  ciudad,
  img,
  name,
  description,
  description_summarize,
  skills,
}: Props) => {
  return (
    <div className="card-speaker flex flex-col rounded-lg overflow-hidden shadow-lg h-full">
      <div className="relative">
        <img
          src={img}
          alt={name}
          className="w-full object-cover h-[330px] object-center rounded-t-lg"
          width="auto"
          height="330"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div className="p-4">
        <div className="text-sm text-[#1976D2] font-semibold mb-1" id="skills">
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
        <h2 className="text-sm text-gray-800">{ciudad}</h2>
        <p className="text-sm text-gray-500 mt-2 line-clamp-10 leading-relaxed">
          {description_summarize}
        </p>
      </div>
    </div>
  )
}
