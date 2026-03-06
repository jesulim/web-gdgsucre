export interface AgendaItem {
  id: string
  type: "talk"
  time: string
  title: string
  titleSize?: "xs" | "sm" | "base"
  name: string
  img: string
  skill?: string
}

export interface BreakItem {
  id: string
  type: "break"
  time: string
  label: string
}

export type AgendaEntry = AgendaItem | BreakItem
