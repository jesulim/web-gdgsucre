import { Loader2Icon, PencilIcon, XIcon } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import Cropper, { type Area } from "react-easy-crop"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.crossOrigin = "anonymous"
    image.src = url
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("Failed to load image"))
  })
}

async function getCroppedImg(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await createImage(imageSrc)
  const canvas = document.createElement("canvas")
  const ctx = canvas.getContext("2d")
  if (!ctx) throw new Error("Could not get canvas context")

  const size = Math.min(pixelCrop.width, pixelCrop.height)
  canvas.width = size
  canvas.height = size

  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2)
  ctx.closePath()
  ctx.clip()

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size
  )

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      blob => {
        if (blob) resolve(blob)
        else reject(new Error("Canvas toBlob failed"))
      },
      "image/webp",
      0.9
    )
  })
}

interface AvatarUploadProps {
  currentAvatarUrl?: string | null
  userName?: string
  onAvatarChange: (url: string) => void
}

export function AvatarUpload({ currentAvatarUrl, userName, onAvatarChange }: AvatarUploadProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const initials =
    userName
      ?.split(" ")
      .map(n => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "?"

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels)
  }, [])

  function handleClick() {
    if (imageSrc) return
    fileInputRef.current?.click()
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => setImageSrc(reader.result as string)
    reader.readAsDataURL(file)
    e.target.value = ""
  }

  async function handleSave() {
    if (!imageSrc || !croppedAreaPixels) return
    setUploading(true)

    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels)
      const formData = new FormData()
      formData.append("avatar", blob, "avatar.webp")

      const res = await fetch("/api/profile/avatar", {
        method: "POST",
        body: formData,
      })

      if (!res.ok) throw new Error(await res.text())

      const { avatar_url } = await res.json()
      onAvatarChange(avatar_url)
      toast.success("Foto de perfil actualizada")
      setImageSrc(null)
    } catch (error) {
      toast.error("Error al actualizar la foto")
      console.error(error)
    } finally {
      setUploading(false)
    }
  }

  function handleCancel() {
    setImageSrc(null)
    setZoom(1)
    setCrop({ x: 0, y: 0 })
  }

  if (imageSrc) {
    return (
      <div className="flex flex-col items-center gap-3 w-full">
        <div className="relative w-xs h-44 md:w-full md:h-48 bg-black/5 rounded-lg overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
          />
        </div>
        <div className="flex items-center gap-2 w-full max-w-xs">
          <span className="text-sm shrink-0">Zoom</span>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={e => setZoom(Number(e.target.value))}
            className="flex-1"
          />
        </div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleCancel}>
            <XIcon />
            Cancelar
          </Button>
          <Button type="button" size="sm" onClick={handleSave} disabled={uploading}>
            {uploading && <Loader2Icon className="animate-spin" />}
            Guardar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative mx-auto">
      <Avatar
        className="size-32 cursor-pointer border-off-white hover:border-blue-500 border-2 transition-colors"
        onClick={handleClick}
      >
        <AvatarImage src={currentAvatarUrl || ""} alt={userName} />
        <AvatarFallback className="text-lg">{initials}</AvatarFallback>
      </Avatar>

      <button
        type="button"
        onClick={handleClick}
        className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1.5 hover:bg-blue-600 transition-colors"
        aria-label="Cambiar foto de perfil"
      >
        <PencilIcon className="size-5 text-white" />
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />
    </div>
  )
}
