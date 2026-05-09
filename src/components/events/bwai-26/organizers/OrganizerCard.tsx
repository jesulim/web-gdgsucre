const background = "/assets/figma/bg-organizer.svg"

export interface Props {
  image: string | null
  first_name: string
  last_name: string
  areas: string[]
}

export const OrganizerCard = ({ image, first_name, last_name, areas }: Props) => {
  return (
    <div
      className="flex flex-col items-center rounded-lg overflow-hidden w-65 h-[374px] py-4 px-3 bg-cover bg-center bg-no-repeat mx-auto"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="w-full flex justify-center">
        <img
          src={image}
          alt={first_name}
          className="border border-black w-56 h-56 object-cover rounded-lg"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="flex flex-col items-center justify-center text-center w-full gap-2 mt-4">
        <h3 className="pt-4 text-lg font-semibold leading-tight w-40">
          {first_name} {last_name.split(" ")[0]}
        </h3>

        <div className="flex flex-wrap justify-center gap-3 w-full mt-2">
          {areas?.map(area => (
            <span
              key={area}
              className="inline-block bg-blue-500 rounded-lg px-2 py-1 text-xs font-bold border text-white"
            >
              {area}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
