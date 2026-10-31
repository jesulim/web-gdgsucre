import type React from "react"
import FacebookSvg from "@/assets/events/devfest-23/social/Facebook.svg?url"
import GithubSvg from "@/assets/events/devfest-23/social/Github.svg?url"
import InstagramSvg from "@/assets/events/devfest-23/social/Instagram.svg?url"
import LinkedinSvg from "@/assets/events/devfest-23/social/Linkedin.svg?url"
import TwitterSvg from "@/assets/events/devfest-23/social/Twitter.svg?url"
import WebSvg from "@/assets/events/devfest-23/social/Web.svg?url"
import { Tilt3DCard } from "./Tilt3DCard"

const socialNetworksIcons: Record<string, { icon: string; alt: string }> = {
  facebook: { icon: FacebookSvg, alt: "Facebook" },
  twitter: { icon: TwitterSvg, alt: "Twitter" },
  instagram: { icon: InstagramSvg, alt: "Instagram" },
  linkedin: { icon: LinkedinSvg, alt: "LinkedIn" },
  github: { icon: GithubSvg, alt: "GitHub" },
  web: { icon: WebSvg, alt: "Web" },
}

export interface OrganizerCardProps {
  id: string
  name: string
  photoUrl: string
  socialNetworks?: { type: string; url: string }[]
}

export const OrganizerCard: React.FC<OrganizerCardProps> = ({
  id,
  name,
  photoUrl,
  socialNetworks,
}) => {
  return (
    <div>
      <Tilt3DCard className="atropos-banner" shadow={false}>
        <div className="relative m-4" key={id}>
          <img src={photoUrl} alt={name} className="w-full h-full block" loading="lazy" />
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
            <div className="px-2 bg-black relative inline-block w-max">
              <span
                data-atropos-offset="2"
                className="relative inline-block text-white text-md md:text-xl"
              >
                {name}
              </span>
            </div>
          </div>
        </div>
      </Tilt3DCard>

      <div className="flex space-x-4 justify-center mt-2">
        {socialNetworks?.map(({ type, url }) => {
          const iconData = socialNetworksIcons[type]
          if (!iconData) return null
          return (
            <a
              key={type}
              href={url}
              className="opacity-80 lg:opacity-70 hover:opacity-100 transition-opacity"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src={iconData.icon} alt={iconData.alt} className="w-5 h-5 block" />
            </a>
          )
        })}
      </div>
    </div>
  )
}
