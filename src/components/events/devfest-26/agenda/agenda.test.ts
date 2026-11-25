import { afterAll, beforeAll, describe, expect, it } from "bun:test"
import { resolve } from "node:path"
import { getViteConfig } from "astro/config"
import { experimental_AstroContainer as AstroContainer } from "astro/container"
import { createServer, type ViteDevServer } from "vite"
import { AgendaColor, type AgendaSlot, resolveAgendaSlotColors } from "./agenda"
import { DEVFEST_26_AGENDA_SLOTS } from "./agendaData"

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

describe("DevFest 26 provisional agenda slots", () => {
  it("exposes all 11 provisional slots from 08:00 - 08:45 through 14:00 - 15:30 with corrected Spanish orthography", () => {
    expect(DEVFEST_26_AGENDA_SLOTS).toHaveLength(11)
    expect(DEVFEST_26_AGENDA_SLOTS[0]).toEqual({
      time: "08:00 - 08:45",
      title: "Acreditación",
      color: AgendaColor.Green,
    })
    expect(DEVFEST_26_AGENDA_SLOTS[1]).toEqual({
      time: "08:45 - 09:00",
      title: "Inauguración del Evento y palabras conmemorativas",
      color: AgendaColor.White,
    })
    expect(DEVFEST_26_AGENDA_SLOTS[3]?.title).toBe("Dinámicas y espacio publicitario")
    expect(DEVFEST_26_AGENDA_SLOTS[5]?.title).toBe("Refrigerio y Networking")
    expect(DEVFEST_26_AGENDA_SLOTS[7]?.title).toBe("Dinámicas y espacio publicitario")
    expect(DEVFEST_26_AGENDA_SLOTS[9]).toEqual({
      time: "13:15 - 13:45",
      title: "Cierre del Evento",
      color: AgendaColor.Red,
    })
    expect(DEVFEST_26_AGENDA_SLOTS[10]).toEqual({
      time: "14:00 - 15:30",
      title: "Almuerzo",
      color: AgendaColor.Blue,
    })

    const speakers = DEVFEST_26_AGENDA_SLOTS.filter(slot => slot.speaker).map(slot => slot.speaker)
    expect(speakers).toEqual(["Sergio Ochoa", "Brian Castillo", "Yury Camacho", "David Rios"])
  })
})

describe("DevFest 26 Agenda.astro component rendering", () => {
  let viteServer: ViteDevServer
  let container: AstroContainer
  let AgendaComponent: Parameters<AstroContainer["renderToString"]>[0]

  beforeAll(async () => {
    const projectRoot = resolve(import.meta.dir, "../../../..")
    const configFn = getViteConfig(
      {
        cacheDir: "/tmp/gdg-agenda-vite-cache",
        optimizeDeps: { noDiscovery: true },
      },
      { root: projectRoot, configFile: false }
    )
    const viteConfig = await configFn({ mode: "test", command: "serve" })
    viteServer = await createServer({
      ...viteConfig,
      server: { middlewareMode: true, hmr: false },
      appType: "custom",
    })
    const mod = await viteServer.ssrLoadModule(resolve(import.meta.dir, "./Agenda.astro"))
    AgendaComponent = mod.default
    container = await AstroContainer.create()
  })

  afterAll(async () => {
    await viteServer?.close()
  })

  it("renders 'Agenda por confirmar' fallback when slots array is empty", async () => {
    const html = await container.renderToString(AgendaComponent, {
      props: { slots: [] },
    })

    expect(html).toContain('id="agenda"')
    expect(html).toContain("Agenda del Evento")
    expect(html).toContain("Agenda por confirmar")
  })

  it("renders populated speaker and non-speaker slots with expected color classes and no interactive elements", async () => {
    const html = await container.renderToString(AgendaComponent, {
      props: { slots: DEVFEST_26_AGENDA_SLOTS },
    })

    expect(html).toContain("<h2")
    expect(html).toContain("Agenda del Evento")
    expect(html).toContain("08:00 - 08:45")
    expect(html).toContain("Acreditación")
    expect(html).toContain("text-green-400")
    expect(html).toContain("Inauguración del Evento y palabras conmemorativas")
    expect(html).toContain("Sergio Ochoa")
    expect(html).toContain("text-yellow-400")
    expect(html).toContain("Dinámicas y espacio publicitario")
    expect(html).toContain("text-blue-400")
    expect(html).toContain("Cierre del Evento")
    expect(html).toContain("text-red-400")
    expect(html).toContain("14:00 - 15:30")
    expect(html).toContain("Almuerzo")
    expect(html).not.toContain("Agenda por confirmar")
    expect(html).not.toContain("<button")
    expect(html).not.toContain("<a ")
  })

  it("supports a custom heading title prop", async () => {
    const html = await container.renderToString(AgendaComponent, {
      props: { slots: [], title: "Cronograma Oficial" },
    })

    expect(html).toContain("Cronograma Oficial")
    expect(html).not.toContain("Agenda del Evento")
  })

  it("renders an isolated, non-interactive, screen-reader-hidden backdrop with static orbs and desktop-only SVG shapes", async () => {
    const html = await container.renderToString(AgendaComponent, {
      props: { slots: DEVFEST_26_AGENDA_SLOTS },
    })

    const sectionTagMatch = html.match(/<section\b[^>]*>/)
    expect(sectionTagMatch?.[0]).toContain("relative")
    expect(sectionTagMatch?.[0]).toContain("isolate")
    expect(sectionTagMatch?.[0]).toContain("overflow-hidden")
    expect(sectionTagMatch?.[0]).toContain("scroll-mt-24")

    const backdropMatch = html.match(
      /<div\b[^>]*aria-hidden="true"[^>]*>([\s\S]*?)<\/div>\s*<div\b[^>]*relative z-10/
    )
    expect(backdropMatch).not.toBeNull()

    const backdropOpenTag = backdropMatch?.[0].match(/<div\b[^>]*>/)?.[0] ?? ""
    expect(backdropOpenTag).toContain("pointer-events-none")
    expect(backdropOpenTag).toContain("-z-10")
    expect(backdropOpenTag).toContain("overflow-hidden")

    const backdropInner = backdropMatch?.[1] ?? ""
    expect(backdropInner).toContain("bg-yellow-")
    expect(backdropInner).toContain("bg-blue-")
    expect(backdropInner).toContain("bg-red-")
    expect(backdropInner).toContain("blur-")
    expect(backdropInner).not.toContain("animate-blob")

    const svgs = [...backdropInner.matchAll(/<svg\b([^>]*)>/g)]
    expect(svgs).toHaveLength(2)
    for (const [, attrs] of svgs) {
      expect(attrs).toContain("hidden")
      expect(attrs).toContain("lg:block")
    }
  })

  it("masks the ambient orb layer against vertical edge clipping without masking decorative SVGs", async () => {
    const html = await container.renderToString(AgendaComponent, {
      props: { slots: DEVFEST_26_AGENDA_SLOTS },
    })

    const backdropMatch = html.match(
      /<div\b[^>]*aria-hidden="true"[^>]*>([\s\S]*?)<\/div>\s*<div\b[^>]*relative z-10/
    )
    const backdropInner = backdropMatch?.[1] ?? ""

    const orbLayerMatch = backdropInner.match(
      /<div\b[^>]*class="[^"]*\borb-edge-fade\b[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<svg\b/
    )
    expect(orbLayerMatch).not.toBeNull()

    const orbLayerInner = orbLayerMatch?.[1] ?? ""
    expect(orbLayerInner).toContain("bg-yellow-")
    expect(orbLayerInner).toContain("bg-blue-")
    expect(orbLayerInner).toContain("bg-red-")
    expect(orbLayerInner).not.toContain("<svg")
    expect(orbLayerInner).not.toMatch(/\b(?:\w+:)?-(?:top|bottom)-/)
  })
})
