import type { ComponentType } from "react"
import CardBWAI from "@/components/events/bwai-26/CredentialCard"
import type { CredentialCardProps } from "@/components/events/credentialCard"
import CardDevfest25 from "@/components/events/devfest-25/CredentialCard"
import CardDevfest26 from "@/components/events/devfest-26/CredentialCard"
import CardIO from "@/components/events/io-extended-26/CredentialCard"
import CardIWD from "@/components/events/iwd-26/CredentialCard"

const CARDS: Record<string, { Component: ComponentType<CredentialCardProps>; bg: string }> = {
  "bwai-26": { Component: CardBWAI, bg: "/events/bwai-26/bg-credencial.svg" },
  "devfest-25": { Component: CardDevfest25, bg: "/events/devfest-25/bg-credencial_v2.svg" },
  "devfest-26": { Component: CardDevfest26, bg: "/events/devfest-26/bg-credencial.webp" },
  "io-extended-26": { Component: CardIO, bg: "/events/io-extended-26/bg-credencial.svg" },
  "iwd-26": { Component: CardIWD, bg: "/events/iwd-26/bg-credencial.svg" },
}

type CredentialCardByEventProps = CredentialCardProps & { eventSlug: string }

export default function CredentialCardByEvent({ eventSlug, ...props }: CredentialCardByEventProps) {
  const { Component, bg } = CARDS[eventSlug] ?? CARDS["bwai-26"]
  return <Component {...props} innerGradient={bg} />
}
