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
      className={`pc-card pc-card--square ${className}`.trim()}
      style={cardStyle}
    >
      <div className="pc-inside">
        <div className="pc-shine" />
        <div className="pc-glare" />
        <div className="pc-content border-2 md:border-0 border-gray-500 rounded-2xl md:rounded-none">
          <div
            className="absolute left-1/2 -translate-x-1/2
  top-[18%] sm:top-[18%] md:top-[18%] lg:top-[18%] w-30 h-30 sm:w-30 sm:h-30 overflow-hidden rounded-xl"
          >
            <Avatar className="w-full h-full" rounded={false}>
              <AvatarImage src={finalAvatar} className="w-full h-full object-cover" />
              <AvatarFallback rounded={false} className="rounded-xl">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
          <div
            className="
    absolute top-[48%] -translate-y-1/2
    left-10 right-10 sm:left-10 sm:right-10
    grid place-items-center bg-white text-black rounded-3xl
    pointer-events-auto"
          >
            <p className="text-base sm:text-[18px] font-semibold leading-tight wrap-break-word text-center py-2 px-3  rounded-2xl">
              {`${firstName} ${lastName}`}
            </p>
          </div>

          <div className="absolute top-[58.2%] left-5 right-5 -translate-y-1/2 grid place-items-center px-3.5 py-3 pointer-events-auto">
            <p className="text-2xl text-white font-bold">{`${role}`}</p>
          </div>

          <div className="absolute bottom-4 right-6 w-40 h-40 bg-white rounded-2xl p-2">
            <img
              src={qrUrl}
              alt="Código QR de la credencial"
              className="rounded-sm object-contain "
            />
          </div>
        </div>
      </div>
    </section>
  )
}

const CredentialCard = React.memo(CredentialCardComponent)
export default CredentialCard
