export enum AgendaColor {
  White = "white",
  Blue = "blue",
  Green = "green",
  Yellow = "yellow",
  Red = "red",
}

export interface AgendaSlot {
  time: string
  title: string
  speaker?: string
  color?: AgendaColor
}

export interface ResolvedAgendaSlotColors {
  speakerName?: string
  titleClass: string
  speakerClass?: string
}

const AGENDA_COLOR_CLASSES: Record<AgendaColor, string> = {
  [AgendaColor.White]: "text-white",
  [AgendaColor.Blue]: "text-blue-400",
  [AgendaColor.Green]: "text-green-400",
  [AgendaColor.Yellow]: "text-yellow-400",
  [AgendaColor.Red]: "text-red-400",
}

/**
 * Resolves text color classes for an agenda slot: when a speaker is present,
 * the slot color (default Yellow) styles the speaker and the title stays white;
 * when no speaker is present, the slot color (default White) styles the title.
 */
export function resolveAgendaSlotColors(slot: AgendaSlot): ResolvedAgendaSlotColors {
  const speakerName = slot.speaker?.trim()

  if (speakerName) {
    return {
      speakerName,
      titleClass: AGENDA_COLOR_CLASSES[AgendaColor.White],
      speakerClass: AGENDA_COLOR_CLASSES[slot.color ?? AgendaColor.Yellow],
    }
  }

  return {
    titleClass: AGENDA_COLOR_CLASSES[slot.color ?? AgendaColor.White],
  }
}
