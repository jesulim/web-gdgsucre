import React, { useMemo } from "react"
import "@/components/events/CredentialCard.css"
import { type CredentialCardProps, getInitials } from "@/components/events/credentialCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCardTilt } from "@/hooks/useCardTilt"

const CredentialCardComponent: React.FC<CredentialCardProps> = ({
  avatarUrl,
  innerGradient,
  className = "",
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 3,
  firstName,
  lastName,
  role,
  grainUrl,
  qrUrl,
}) => {
  const cardRef = useCardTilt({ enableTilt, enableMobileTilt, mobileTiltSensitivity })

  const finalAvatar = avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : "/avatar-default.webp"

  const userInitials = getInitials(firstName)

  const cardStyle = useMemo(
    () =>
      ({
        "--inner-gradient": innerGradient ? `url("${innerGradient}")` : "none",
        "--grain": grainUrl ? `url(${grainUrl})` : "none",
      }) as React.CSSProperties,
    [innerGradient, grainUrl]
  )

  return (
    <section
      ref={cardRef}
      className={`pc-card pc-card--devfest-25 ${className}`.trim()}
      style={cardStyle}
    >
      <div className="pc-inside">
        <div className="pc-shine" />
        <div className="pc-glare" />
        <div className="pc-content">
          <div
            className="absolute left-1/2 -translate-x-1/2
  top-[23%] sm:top-[25%] md:top-[23%] lg:top-[20%] w-25 h-24 rounded-full overflow-hidden"
          >
            <Avatar className="w-full h-full">
              <AvatarImage src={finalAvatar} className="w-full h-full object-cover" />
              <AvatarFallback>{userInitials}</AvatarFallback>
            </Avatar>
          </div>
          <div
            className="
    absolute top-[48%] sm:top-[48%] -translate-y-1/2
    left-10 right-10 sm:left-10 sm:right-10
    grid place-items-center bg-white text-black rounded-3xl
    px-6 py-3 sm:px-2 sm:py-2
    pointer-events-auto
  "
          >
            <p className="text-base sm:text-xl leading-tight wrap-break-word text-center">
              {`${firstName} ${lastName}`}
            </p>
          </div>

          <div className="absolute top-[59%] left-5 right-5 -translate-y-1/2 grid place-items-center px-3.5 py-3 pointer-events-auto">
            <p className="text-3xl">{`${role}`}</p>
          </div>

          <div className="absolute left-1/2 -translate-x-2 top-[66%] sm:top-[66%] w-37 h-36 sm:w-37 sm:h-36 inline-block">
            <img
              src={qrUrl}
              alt="Código QR de la credencial"
              className="rounded-sm object-contain border-8 border-white"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

const CredentialCard = React.memo(CredentialCardComponent)
export default CredentialCard
