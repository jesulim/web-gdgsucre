export interface CredentialCardProps {
  avatarUrl?: string
  innerGradient?: string
  className?: string
  enableTilt?: boolean
  enableMobileTilt?: boolean
  mobileTiltSensitivity?: number
  firstName: string
  lastName: string
  role: string
  grainUrl?: string
  qrUrl: string
}

export const getInitials = (firstName?: string | null) => {
  const parts = firstName?.trim().split(" ").filter(Boolean) ?? []
  if (parts.length === 0) return "?"
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase()
}
