import { BadgeCheck, Candy, Coffee, Cookie, CupSoda, Flower2, Sparkles } from "lucide-react"
import type { PackageFeatureType } from "@/data/nwd-26/packages"

const icons: Record<PackageFeatureType, typeof Coffee> = {
  snack: CupSoda,
  credential: BadgeCheck,
  cup: Coffee,
  candle: Sparkles,
  scrunchie: Flower2,
  stickers: Cookie,
  earrings: Candy,
}

export function PackageFeatureIcon({ type }: { type: PackageFeatureType }) {
  const Icon = icons[type]
  return <Icon aria-hidden="true" strokeWidth={2.15} className="size-5 shrink-0 text-[#1355cc]" />
}
