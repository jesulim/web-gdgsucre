import React, { useMemo, useState } from "react"
import "@/components/events/CredentialCard.css"
import { Loader2, Share2 } from "lucide-react"
import { type CredentialCardProps, getInitials } from "@/components/events/credentialCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCardTilt } from "@/hooks/useCardTilt"
import { type CredentialLayout, shareOrDownloadCredential } from "@/lib/shareCredential"

const AVATAR_RING_STOPS: [number, string][] = [
  [0, "#F27E1D"],
  [30 / 360, "#CBB716"],
  [90 / 360, "#37A851"],
  [150 / 360, "#CCB717"],
  [180 / 360, "#F27E1D"],
  [210 / 360, "#BF5466"],
  [270 / 360, "#4584F1"],
  [330 / 360, "#BE5466"],
  [1, "#F27E1D"],
]

const AVATAR_RING_GRADIENT = `conic-gradient(${AVATAR_RING_STOPS.map(
  ([offset, color]) => `${color} ${offset * 360}deg`
).join(", ")})`

const SHARE_LAYOUT: Partial<CredentialLayout> = {
  baseWidth: 360,
  baseHeight: 540,
  nameCenterY: 0.6284,
  nameMaxWidth: 0.83,
  nameFontSize: 20,
  nameColor: "#ffffff",
  avatarCenterY: 0.4302,
  avatarDiameter: 0.3704,
  avatarRingWidth: 2,
  avatarRingStops: AVATAR_RING_STOPS,
  roleCenterY: 0.737,
  roleFontSize: 20,
  roleFontWeight: "500",
  roleColor: "#ffffff",
  relocateBgPill: {
    srcX: 119 / 540,
    srcY: 423 / 810,
    srcW: 302 / 540,
    srcH: 65 / 810,
    destCenterY: 0.737,
  },
}

const CredentialCardComponent: React.FC<CredentialCardProps> = ({
  avatarUrl,
  innerGradient = "/events/devfest-26/bg-credencial.webp",
  className = "",
  enableTilt = true,
  enableMobileTilt = false,
  mobileTiltSensitivity = 3,
  name,
  firstName,
  lastName,
  role,
  grainUrl,
  qrUrl,
}) => {
  const cardRef = useCardTilt({ enableTilt, enableMobileTilt, mobileTiltSensitivity })
  const [isSharing, setIsSharing] = useState(false)

  const finalAvatar = avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : "/avatar-default.webp"

  const userInitials = getInitials(firstName)

  const handleShare = async () => {
    if (isSharing) return
    setIsSharing(true)
    try {
      await shareOrDownloadCredential(
        {
          name,
          firstName,
          lastName,
          role,
          avatarUrl: finalAvatar,
          bgImageUrl: innerGradient,
          layout: {
            ...SHARE_LAYOUT,
            ...(cardRef.current && { fontFamily: getComputedStyle(cardRef.current).fontFamily }),
          },
        },
        {
          title: `Credencial de ${firstName} ${lastName} - GDG Sucre`,
          text: "Estoy participando del DevFest Sucre 2026, ingresa a https://gdgsucre.com 🚀",
          url: null,
          filename: `credencial-${(firstName ?? "").toLowerCase().replace(/\s+/g, "-")}.png`,
        }
      )
    } catch (err) {
      console.error("Error al compartir la credencial:", err)
    } finally {
      setIsSharing(false)
    }
  }

  const cardStyle = useMemo(
    () =>
      ({
        "--inner-gradient": innerGradient ? `url("${innerGradient}")` : "none",
        "--grain": grainUrl ? `url(${grainUrl})` : "none",
      }) as React.CSSProperties,
    [innerGradient, grainUrl]
  )

  return (
    <div className="flex flex-col items-center">
      <div
        ref={cardRef}
        className={`pc-card pc-card--devfest-26 ${className}`.trim()}
        style={cardStyle}
      >
        <div className="pc-inside">
          <div className="pc-shine" />
          <div className="pc-glare" />
          <div className="pc-content border-2 md:border-0 border-gray-500 rounded-2xl md:rounded-none">
            <div
              className="absolute left-1/2 -translate-x-1/2
                top-[25.52%] -translate-y-1/2 w-[38%] aspect-square overflow-hidden rounded-full p-0.5"
              style={{ backgroundImage: AVATAR_RING_GRADIENT }}
            >
              <Avatar className="w-full h-full">
                <AvatarImage src={finalAvatar} className="w-full h-full object-cover" />
                <AvatarFallback className="rounded-full">{userInitials}</AvatarFallback>
              </Avatar>
            </div>

            <div className="absolute top-[45.34%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[83%] grid place-items-center text-white pointer-events-auto">
              <p className="text-lg sm:text-xl font-bold leading-tight wrap-break-word text-center">
                {name}
              </p>
            </div>

            <div className="absolute top-[56.2%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] flex items-center justify-center pointer-events-auto">
              <p className="text-lg sm:text-xl font-medium text-white text-center truncate">
                {role}
              </p>
            </div>

            <div className="absolute top-[80.37%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[46.1%] aspect-square bg-white rounded-xl p-2.5 shadow-md">
              <img
                src={qrUrl}
                alt="Código QR de la credencial"
                className="w-full h-full rounded-sm object-contain"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 md:mt-12 flex gap-4 justify-center">
        <a
          href="/perfil"
          className="border-2 font-semibold text-sm sm:text-base px-4 py-2 rounded-full hover:bg-white/20 transition-all"
        >
          Editar perfil
        </a>

        <button
          type="button"
          onClick={handleShare}
          disabled={isSharing}
          className="flex items-center gap-2.5 bg-white text-black font-semibold text-sm sm:text-base px-4 py-2 rounded-full border  hover:bg-gray-100 transition-all"
        >
          {isSharing ? (
            <Loader2 className="w-5 h-5 animate-spin text-gray-600" />
          ) : (
            <Share2 className="w-5 h-5 text-gray-800" />
          )}
          <span>{isSharing ? "Generando credencial..." : "Compartir Credencial"}</span>
        </button>
      </div>
    </div>
  )
}

const CredentialCard = React.memo(CredentialCardComponent)
export default CredentialCard
