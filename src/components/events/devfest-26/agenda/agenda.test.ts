import { describe, expect, it } from "bun:test"
import { AgendaColor, type AgendaSlot, resolveAgendaSlotColors } from "./agenda"

describe("DevFest 26 Agenda color resolution", () => {
  it("styles title in white by default when speaker is omitted", () => {
    const slot: AgendaSlot = {
      time: "08:45 - 09:00",
      title: "Inauguración del Evento y palabras conmemorativas",
    }

    const resolved = resolveAgendaSlotColors(slot)

    expect(resolved.titleClass).toBe("text-white")
    expect(resolved.speakerClass).toBeUndefined()
  })

  it("styles title with explicit AgendaColor when speaker is omitted", () => {
    const cases: Array<[AgendaColor, string]> = [
      [AgendaColor.White, "text-white"],
      [AgendaColor.Blue, "text-blue-400"],
      [AgendaColor.Green, "text-green-400"],
      [AgendaColor.Yellow, "text-yellow-400"],
      [AgendaColor.Red, "text-red-400"],
    ]

    for (const [color, expectedClass] of cases) {
      const resolved = resolveAgendaSlotColors({
        time: "08:00 - 08:45",
        title: "Acreditación",
        color,
      })

      expect(resolved.titleClass).toBe(expectedClass)
      expect(resolved.speakerClass).toBeUndefined()
    }
  })

  it("styles speaker in yellow by default and keeps title white when speaker is present", () => {
    const slot: AgendaSlot = {
      time: "09:00 - 09:45",
      speaker: "Sergio Ochoa",
      title: "AI Harnesses: más allá del prompting, ingeniería de software con agentes de IA",
    }

    const resolved = resolveAgendaSlotColors(slot)

    expect(resolved.speakerClass).toBe("text-yellow-400")
    expect(resolved.titleClass).toBe("text-white")
  })

  it("styles speaker with explicit AgendaColor while keeping title white when speaker is present", () => {
    const slot: AgendaSlot = {
      time: "10:00 - 11:15",
      speaker: "Brian Castillo",
      title: "Build Your Own Jarvis: Real-Time AI with Gemini Live API & Firebase",
      color: AgendaColor.Blue,
    }

    const resolved = resolveAgendaSlotColors(slot)

    expect(resolved.speakerClass).toBe("text-blue-400")
    expect(resolved.titleClass).toBe("text-white")
  })
})
