import useSvgIcons from "./useSvgIcons"
import "./organizerCard.css"

export interface OrganizerCardProps {
  id?: string
  name: string
  photoUrl: string
  socialNetworks?: { type: string; url: string }[]
  uuid: number
}

const bgColors = ["bg-[#FBBC04]", "bg-[#34A853]", "bg-[#EA4335]", "bg-[#4285F4]"]

export const OrganizerCard = ({
  photoUrl,
  name,
  socialNetworks = [],
  uuid,
}: OrganizerCardProps) => {
  const { gitHubSVG, linkedinSVG, instagramSVG, twitterSVG, facebookSVG, devSVG } = useSvgIcons()

  const isSocialNetworksEmpty: boolean = socialNetworks.length === 0

  return (
    <div className="cut-corners-r mt-4 h-full bg-black p-0.5 transition-all dark:bg-white">
      <div className={`cut-corners-r h-full pb-2 pr-2 ${bgColors[uuid % 4]}`}>
        <div className="card h-full border-b-2 border-r-2 border-black bg-white text-center dark:border-white dark:bg-[#202124]">
          <div className="card-details">
            <img
              className="text-title mx-auto h-48 w-48 rounded-full border-2 border-black dark:border-white object-cover aspect-square"
              src={photoUrl}
              alt={name}
              loading="lazy"
              width="200"
              height="200"
            />
            <div className="text-body">
              <div className="flex items-center justify-around px-2">
                {isSocialNetworksEmpty && (
                  <span className="mt-4 inline-flex items-center rounded-full border border-black bg-white px-3 py-1 shadow-md">
                    <span>{devSVG()}</span>
                  </span>
                )}
                {socialNetworks.map(socialNetwork => (
                  <a
                    href={socialNetwork.url}
                    key={socialNetwork.url || socialNetwork.type}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${name} ${socialNetwork.type}`}
                  >
                    <span className="mt-4 inline-flex items-center rounded-full border border-black bg-white px-3 py-1 shadow-md">
                      <span>
                        {socialNetwork.type === "linkedin" && linkedinSVG()}
                        {socialNetwork.type === "github" && gitHubSVG()}
                        {socialNetwork.type === "instagram" && instagramSVG()}
                        {socialNetwork.type === "facebook" && facebookSVG()}
                        {socialNetwork.type === "twitter" && twitterSVG()}
                      </span>
                    </span>
                  </a>
                ))}
              </div>
              <h2 className="mt-2 text-2xl font-semibold text-black dark:text-white px-2">
                {name}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OrganizerCard
