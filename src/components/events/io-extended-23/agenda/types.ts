export interface SocialLink {
  type: "GITHUB" | "LINKEDIN" | "TWITTER" | "INSTAGRAM" | "BLOG"
  link: string
}

export interface ScheduleEntry {
  id: string
  schedule: string
  title: string
  photoUrl: string
  name: string
  aboutMe: string
  description: string
  SocialNetwork: SocialLink[]
  type: "Actividad" | "Conferencia" | "Taller"
  technologyType: "Cloud" | "Web" | "IA" | "Mobile" | ""
}
