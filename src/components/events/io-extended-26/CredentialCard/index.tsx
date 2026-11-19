import React, { useMemo, useState } from "react"
import "@/components/events/CredentialCard.css"
import { Loader2, Share2 } from "lucide-react"
import { type CredentialCardProps, getInitials } from "@/components/events/credentialCard"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useCardTilt } from "@/hooks/useCardTilt"
import { shareOrDownloadCredential } from "@/lib/shareCredential"

const CredentialCardComponent: React.FC<CredentialCardProps> = ({
  avatarUrl,
  innerGradient = "/events/io-extended-26/bg-credencial.svg",
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
  const [isSharing, setIsSharing] = useState(false)

  const finalAvatar = avatarUrl && avatarUrl.trim() !== "" ? avatarUrl : "/avatar-default.webp"

  const userInitials = getInitials(firstName)

  const handleShare = async () => {
    if (isSharing) return
    setIsSharing(true)
    try {
      await shareOrDownloadCredential(
        {
          firstName,
          lastName,
          role,
          avatarUrl: finalAvatar,
          qrUrl,
          bgImageUrl: innerGradient,
        },
        {
          title: `Credencial de ${firstName} ${lastName} - GDG Sucre`,
          text: `¡Ya estoy registrado para el evento de GDG Sucre! Genera la tuya aquí 🎉`,
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
      <section ref={cardRef} className={`pc-card ${className}`.trim()} style={cardStyle}>
        <div className="pc-inside">
          <div className="pc-shine" />
          <div className="pc-glare" />
          <div className="pc-content border-2 md:border-0 border-gray-500 rounded-2xl md:rounded-none">
            <div
              className="
                absolute top-[9%] -translate-y-1/2
                left-1/2 -translate-x-1/2 w-[69%]
                grid place-items-center text-black
                pointer-events-auto"
            >
              <p className="text-sm sm:text-base font-bold leading-tight wrap-break-word text-center py-2 px-3">
                {`${firstName} ${lastName}`}
              </p>
            </div>

            <div
              className="absolute left-1/2 -translate-x-1/2
                top-[29.8%] -translate-y-1/2 w-[38%] aspect-square overflow-hidden rounded-full"
            >
              <Avatar className="w-full h-full">
                <AvatarImage src={finalAvatar} className="w-full h-full object-cover" />
                <AvatarFallback className="rounded-full">{userInitials}</AvatarFallback>
              </Avatar>
            </div>

            <div className="absolute top-[51.2%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[51.5%] h-14 flex items-center justify-center pointer-events-auto">
              <p
                className="text-xl font-bold tracking-wide bg-clip-text text-transparent text-center shimmer shimmer-duration-3000"
                style={{
                  backgroundImage:
                    "radial-gradient(circle at center, #4285F4 10%, #EA4335 41%, #F9AB00 61%, #34A853 100%)",
                }}
              >
                {`${role}`}
              </p>
            </div>

            <div className="absolute top-[71%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white rounded-xl p-2 shadow-md">
              <img
                src={qrUrl}
                alt="Código QR de la credencial"
                className="rounded-sm object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={handleShare}
          disabled={isSharing}
          className="flex items-center gap-2.5 bg-white text-black font-semibold text-sm sm:text-base px-6 py-3 rounded-full border border-gray-300 hover:bg-gray-100 active:scale-95 transition-all shadow-md cursor-pointer disabled:opacity-50"
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
