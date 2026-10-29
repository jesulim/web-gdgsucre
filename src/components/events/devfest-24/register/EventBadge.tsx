import Atropos from "atropos/react"
import "atropos/css"
import Diplodocus from "./Diplodocus"
import Logo from "./Logo"
import Parasaurolophus from "./Parasaurolophus"

export interface EventBadgeProps {
  userName: string
  email?: string | null
  role?: string | null
  picture?: string | null
}

export default function EventBadge({ userName, email, role, picture }: EventBadgeProps) {
  const avatarSrc = picture || (email ? `https://unavatar.io/${email}` : "/favicon.svg")

  return (
    <Atropos
      className="atropos-banner"
      rotateTouch="scroll-y"
      activeOffset={50}
      rotateXMax={15}
      rotateYMax={5}
      rotateXInvert={true}
      shadowOffset={80}
    >
      <div className="flex items-center justify-center bg-[#FFA500] p-4">
        <div className="relative flex aspect-[3/4] w-full max-w-[310px] flex-col overflow-hidden border-2 border-black bg-white p-0 shadow-lg sm:max-w-[380px]">
          <div className="grid h-1/4 grid-cols-12">
            <div
              className="col-span-5 flex items-center justify-center bg-white p-2 dark:text-black"
              data-atropos-offset="4"
            >
              <div className="h-36 w-36">
                <Logo />
              </div>
            </div>

            <div className='col-span-4 items-center justify-center bg-[url("/events/devfest-24/textures/arroba.png")] bg-repeat'>
              <div className="grid grid-cols-6 gap-1" />
            </div>

            <div className="col-span-3 grid grid-rows-2">
              <div className="flex items-center justify-center bg-[#4285F4]">
                <svg
                  className="h-12 w-12 text-white"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  data-atropos-offset="4"
                  aria-hidden="true"
                >
                  <path d="M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z" />
                </svg>
              </div>
              <div className='flex items-center justify-center bg-[url("/events/devfest-24/textures/gdg.png")] bg-repeat' />
            </div>
          </div>

          <div className="flex h-2/4 flex-col content-between justify-center p-4">
            <div className="flex gap-4 items-center">
              <img
                src={avatarSrc}
                alt={userName}
                className="h-16 w-16 rounded-full border-2 border-black object-cover shrink-0"
                data-atropos-offset="8"
                onError={e => {
                  ;(e.currentTarget as HTMLImageElement).src = "/favicon.svg"
                }}
              />
              <div
                className="relative mb-8 min-w-0 flex-1 border-2 border-black bg-white p-3 text-black shadow-[8px_8px_0px_0px_rgba(255,186,0,1)]"
                data-atropos-offset="8"
              >
                <h2 className="text-center text-xl font-bold capitalize text-black truncate">
                  {userName}
                </h2>
              </div>
            </div>
            <div className="flex h-12 items-center gap-4" data-atropos-offset="6">
              {role === "Organizador" ? (
                <Parasaurolophus className="w-28" />
              ) : (
                <Diplodocus className="w-24" />
              )}
              <div className="rounded-2xl border-2 border-black bg-white px-6 py-2 sm:px-10">
                <span className="text-xl font-bold text-black">{role || "Participante"}</span>
              </div>
            </div>
          </div>

          <div className="relative flex-grow">
            <div className='absolute bottom-0 left-0 flex h-full w-1/3 items-end justify-start bg-[url("/events/devfest-24/textures/scales.png")] bg-repeat' />
            <div className="absolute bottom-0 right-0 h-full w-2/3">
              <div className="flex h-1/2 items-start justify-center bg-[#4285F4]">
                <svg
                  viewBox="0 0 254 76"
                  className="-mt-2 w-24 sm:-mt-4 sm:w-32"
                  data-atropos-offset="5"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden="true"
                >
                  <path
                    d="M37.9004 72.8011C57.1754 72.8011 72.8008 57.1757 72.8008 37.9007C72.8008 18.6257 57.1754 3.00024 37.9004 3.00024C18.6254 3.00024 3 18.6257 3 37.9007C3 57.1757 18.6254 72.8011 37.9004 72.8011Z"
                    fill="white"
                    stroke="black"
                    strokeWidth="6"
                  />
                  <path
                    d="M126.987 72.8011C146.262 72.8011 161.887 57.1757 161.887 37.9007C161.887 18.6257 146.262 3.00024 126.987 3.00024C107.712 3.00024 92.0864 18.6257 92.0864 37.9007C92.0864 57.1757 107.712 72.8011 126.987 72.8011Z"
                    fill="white"
                    stroke="black"
                    strokeWidth="6"
                  />
                  <path
                    d="M216.067 72.8009C235.342 72.8009 250.968 57.1754 250.968 37.9005C250.968 18.6255 235.342 3 216.067 3C196.792 3 181.167 18.6255 181.167 37.9005C181.167 57.1754 196.792 72.8009 216.067 72.8009Z"
                    fill="white"
                    stroke="black"
                    strokeWidth="6"
                  />
                </svg>
              </div>
              <div className='flex h-1/2 items-center justify-center bg-[url("/events/devfest-24/textures/hearts.png")] bg-repeat' />
            </div>
          </div>
        </div>
      </div>
    </Atropos>
  )
}
