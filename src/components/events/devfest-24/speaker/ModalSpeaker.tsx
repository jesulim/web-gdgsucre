import SocialIcons from "./SocialIcons"

export type SocialNetworksType = {
  name: string
  url: string
}

export type ModalPropsType = {
  isOpen: boolean
  onClose: () => void
  data: {
    name?: string
    descriptions?: Array<string>
    socialNetworks?: Array<SocialNetworksType>
  }
}

export const ModalSpeaker = ({ isOpen, onClose, data }: ModalPropsType) => {
  if (!isOpen) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="pointer-events-auto fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center bg-black/70 p-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose()
      }}
      onKeyDown={e => {
        if (e.key === "Escape") onClose()
      }}
    >
      <div className="cut-corners-r max-w-xs bg-black p-0.5 dark:bg-white sm:max-w-xl md:max-w-2xl w-full">
        <div className="cut-corners-r bg-[#4285F4] pb-2 pr-2">
          <div className="flex max-h-[85vh] w-full flex-col border-b-2 border-r-2 border-black bg-white dark:border-white dark:bg-[#202124]">
            {/* Modal header */}
            <div className="flex items-center justify-between border-b-2 border-black bg-[#4285F4] px-3 py-2 text-white dark:border-white">
              <h3 className="ml-2 text-xl font-bold">{data.name}</h3>
              <button
                type="button"
                className="flex h-8 w-8 items-center justify-center border-2 border-black bg-[#EEEEEE] text-black hover:bg-gray-200 cursor-pointer"
                onClick={onClose}
                aria-label="Cerrar modal"
              >
                <svg
                  className="h-6 w-6 text-[#EA4335]"
                  viewBox="0 0 24 24"
                  strokeWidth="2.5"
                  stroke="currentColor"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <title>Cerrar modal</title>
                  <path stroke="none" d="M0 0h24v24H0z" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal body */}
            <div className="flex max-h-[70vh] flex-col space-y-4 overflow-y-auto p-4 sm:p-6">
              {data.descriptions?.map(description => (
                <p
                  key={description.slice(0, 32)}
                  className="text-sm sm:text-base leading-relaxed text-black dark:text-white"
                >
                  {description}
                </p>
              ))}

              <SocialIcons socialNetworks={data.socialNetworks} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default ModalSpeaker
