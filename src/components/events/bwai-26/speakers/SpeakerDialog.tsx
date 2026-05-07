import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Props {
  speakerName: string
  speakerImageSrc: string
  talkTitle: string
  talkTitleSizeMobile: string
  talkTitleSizeDesktop: string
  description: string
}

export default function SpeakerDialog({
  speakerName,
  speakerImageSrc,
  talkTitle,
  talkTitleSizeMobile,
  talkTitleSizeDesktop,
  description,
}: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        className="flex gap-4 py-4 px-3 lg:px-12 lg:py-10 justify-center items-center h-full flex-1 w-full cursor-pointer lg:cursor-default bg-transparent border-none text-left"
        onClick={() => {
          if (window.innerWidth < 1024) setOpen(true)
        }}
      >
        <div className="relative lg:hidden shrink-0">
          <img
            src={speakerImageSrc}
            alt={speakerName}
            className="w-40 rounded-2xl border-2 border-black"
          />
          <p className="absolute bottom-0 left-0 right-0 text-center bg-blue-500/80 text-white rounded-b-2xl px-2 py-2 text-sm font-bold">
            {speakerName}
          </p>
        </div>

        <p
          className={`${talkTitleSizeMobile} ${talkTitleSizeDesktop} font-bold lg:text-center max-w-100 lg:leading-11 whitespace-pre-line`}
        >
          {talkTitle}
        </p>
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="w-[90vw] max-w-sm rounded-3xl border-2 border-black">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-left whitespace-pre-line mt-2">
              {talkTitle}
            </DialogTitle>
          </DialogHeader>
          <p className="text-base font-medium whitespace-pre-line">{description}</p>
        </DialogContent>
      </Dialog>
    </>
  )
}
