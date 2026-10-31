import organizersData from "@/data/io-extended-23/organizers.json"

const accentColorByType = {
  4: "red",
  3: "yellow",
  2: "green",
  1: "blue",
}

export const Organizers = () => (
  <div className="mx-auto w-full max-w-screen-md ">
    <div className="grid grid-cols-3 gap-x-2 gap-y-8 sm:gap-8 sm:grid-cols-4">
      {organizersData.map(({ id, type, name, photoUrl, link }) => {
        const accentColor = accentColorByType[type]

        return (
          <a
            className={`text-white text-center w-28 sm:w-32 h-auto hover:text-${accentColor}`}
            key={id}
            {...(link && { href: link })}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              className="w-24 h-24 rounded-full mx-auto border-2 border-black"
              src={photoUrl}
              alt={name}
            />
            <span>{name}</span>
          </a>
        )
      })}
    </div>
  </div>
)
