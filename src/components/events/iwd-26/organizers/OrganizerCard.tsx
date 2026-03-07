import MarcoSVG from "@/assets/events/iwd-26/patronOrganizers.svg"

export interface Props {
  imageUrl: string | null
  img: string
  full_name: string
  carrera: string
  areas?: string[]
}

export const OrganizerCard = ({ img, full_name, areas }: Props) => {
  return (
    <div className="card-speaker flex flex-col rounded-lg overflow-hidden shadow-lg h-full relative">
      <div className="relative">
        <img
          src={img}
          alt={full_name}
          className="w-full object-cover h-[300px] md:h-[400px] object-center rounded-t-lg"
          width="400"
          height="400"
          loading="lazy"
          decoding="async"
          style={{
            borderBottom: "4px solid #EBBA3C",
          }}
        />
      </div>
      <div className="pt-1 pb-8 flex flex-col items-center gap-2 md:gap-4 text-center">
        <h3 className="text-xl md:text-2xl font-semibold">
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
        <div className="text-sm md:text-base text-[#1976D2] font-semibold mb-1">
          {areas &&
            areas.map(area => (
              <span
                key={area}
                className="inline-block bg-[#0333AB] rounded-full px-2 py-1 text-xs md:text-sm mr-2 mb-1 border border-[#0333AB] text-white"
              >
                {area}
              </span>
            ))}
        </div>
      </div>
      <div>
        <img
          src={MarcoSVG.src}
          alt=""
          aria-hidden="true"
          className="absolute bottom-0 left-0 w-full"
        />
      </div>
    </div>
  )
}
