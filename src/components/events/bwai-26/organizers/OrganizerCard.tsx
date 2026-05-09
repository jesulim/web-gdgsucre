const background = "/assets/figma/bg-organizer.svg"

export interface Props {
  img: string
  full_name: string
  areas?: string[]
}

export const OrganizerCard = ({ img, full_name, areas }: Props) => {
  return (
    <div
      className="card-speaker flex flex-col items-center rounded-lg overflow-hidden w-65 h-88 py-4 px-3 bg-cover bg-center bg-no-repeat mx-auto"
      style={{ backgroundImage: `url(${background})` }}
    >
      <div className="w-full flex justify-center">
        <img
          src={img}
          alt={full_name}
          className="border-2 border-black w-56 h-56 object-cover rounded-lg"
          loading="lazy"
          decoding="async"
        />
      </div>

      <div className="pt-2 flex flex-col items-center justify-center text-center grow w-full gap-2 mt-5">
        <h3 className="text-lg font-semibold leading-tight">
          {full_name.split(" ").length > 2 ? (
            <>
              {full_name.split(" ").slice(0, 2).join(" ")} <br />
              {full_name.split(" ").slice(2).join(" ")}
            </>
          ) : full_name.split(" ").length === 2 ? (
            <>
              {full_name.split(" ")[0]} <br />
              {full_name.split(" ")[1]}
            </>
          ) : (
            <>
              {full_name} <br />
              {"\u200B"}
            </>
          )}
        </h3>

        <div className="flex flex-wrap justify-center gap-3 w-full mt-2">
          {areas &&
            areas.map(area => (
              <span
                key={area}
                className="inline-block bg-[#4285F4] rounded-lg px-2 py-1 text-xs font-bold border text-white"
              >
                {area}
              </span>
            ))}
        </div>
      </div>
    </div>
  )
}
