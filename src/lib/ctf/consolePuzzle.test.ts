import { describe, expect, it } from "bun:test"
import {
  CANONICAL_DINO_KEY,
  analyzeSubmission,
  generateDinoPackets,
  validateFlag,
} from "./obfuscation"
import {
  initConsolePuzzle,
  getProfileUrl,
  getStorageBadgeUrl,
} from "./consolePuzzle"

describe("DevTools Challenge Dino Pipeline", () => {
  it("should generate 20 packets with both valid and corrupted items", () => {
    const packets = generateDinoPackets()
    expect(packets).toHaveLength(20)

    const validPackets = packets.filter(p => !p.corrupted)
    const corruptedPackets = packets.filter(p => p.corrupted)

    expect(validPackets).toHaveLength(15)
    expect(corruptedPackets).toHaveLength(5)
  })

  it("reconstructs the canonical Dino Key when filtering, sorting, and joining", () => {
    const packets = generateDinoPackets()

    const reconstructed = packets
      .filter(p => !p.corrupted)
      .sort((a, b) => a.seq - b.seq)
      .map(p => p.char)
      .join("")

    expect(reconstructed).toBe(CANONICAL_DINO_KEY)
    expect(reconstructed).toBe("GDG_DINO_HACKER")
    expect(validateFlag(reconstructed)).toBe(true)
  })

  it("validates the flag flexibly (case-insensitively and with whitespace)", () => {
    expect(validateFlag("gdg_dino_hacker")).toBe(true)
    expect(validateFlag("  GDG_DINO_HACKER  ")).toBe(true)
    expect(validateFlag("WRONG_KEY")).toBe(false)
    expect(validateFlag("")).toBe(false)
  })

  it("provides intelligent diagnostics when noise characters are included", () => {
    const diagnostic = analyzeSubmission("GDG_DINO_HACKER_X")
    expect(diagnostic).toContain("corrupted: true")
    expect(diagnostic).toContain(".filter")
  })

  it("provides intelligent diagnostics when sequence order is incorrect", () => {
    const diagnostic = analyzeSubmission("HACKER_DINO_GDG")
    expect(diagnostic).toContain("no están en orden")
    expect(diagnostic).toContain(".sort")
  })

  it("provides prompt when input is empty or missing", () => {
    const diagnostic = analyzeSubmission("")
    expect(diagnostic).toContain("Debes pasar tu clave resuelta")
  })

  it("handles storage persistence and badge serialization", () => {
    const storage: Record<string, string> = {}
    const mockLocalStorage = {
      getItem: (key: string) => storage[key] || null,
      setItem: (key: string, val: string) => {
        storage[key] = val
      },
      removeItem: (key: string) => {
        delete storage[key]
      },
    }

    mockLocalStorage.setItem(
      "gdg_devtools_badge_unlocked",
      JSON.stringify({
        id: "dino-hacker",
        name: "Dino Hacker",
        unlockedAt: 1700000000000,
        flag: "GDG_DINO_HACKER",
      })
    )

    const stored = JSON.parse(mockLocalStorage.getItem("gdg_devtools_badge_unlocked")!)
    expect(stored.name).toBe("Dino Hacker")
    expect(stored.flag).toBe(CANONICAL_DINO_KEY)
  })

  it("keeps gdg.hint ambiguous without giving away the direct code solution", () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(" "))
    }

    try {
      const globalAny = globalThis as unknown as { window?: Record<string, unknown> }
      const mockWin: Record<string, unknown> = {}
      globalAny.window = mockWin

      initConsolePuzzle()

      const gdg = mockWin.gdg as { hint: () => void }
      expect(typeof gdg?.hint).toBe("function")

      gdg.hint()

      const fullHintOutput = logs.join("\n")
      expect(fullHintOutput).not.toContain("p => !p.corrupted")
      expect(fullHintOutput).not.toContain("a.seq - b.seq")
      expect(fullHintOutput).not.toContain("GDG_DINO_HACKER")
      expect(fullHintOutput).toContain("PISTA")
    } finally {
      console.log = originalLog
      delete (globalThis as Record<string, unknown>).window
    }
  })

  it("prints a direct hyperlink to the profile page when unlocking the badge", async () => {
    const logs: string[] = []
    const originalLog = console.log
    console.log = (...args: unknown[]) => {
      logs.push(args.map(String).join(" "))
    }

    try {
      const globalAny = globalThis as unknown as {
        window?: Record<string, unknown>
        fetch?: typeof fetch
      }
      const mockWin: Record<string, unknown> = {
        location: { origin: "https://gdgsucre.com" },
        dispatchEvent: () => true,
      }
      globalAny.window = mockWin
      globalAny.fetch = async () =>
        new Response(JSON.stringify({ ok: true }), { status: 200 })

      initConsolePuzzle()

      const gdg = mockWin.gdg as {
        unlock: (key: string) => Promise<{ success: boolean }>
      }
      const result = await gdg.unlock(CANONICAL_DINO_KEY)

      expect(result.success).toBe(true)
      const fullLog = logs.join("\n")
      expect(fullLog).toContain("https://gdgsucre.com/perfil")
      expect(fullLog).toContain("ROAAAR")
    } finally {
      console.log = originalLog
      delete (globalThis as Record<string, unknown>).window
    }
  })

  it("resolves profile and storage asset URLs dynamically", () => {
    delete (globalThis as Record<string, unknown>).window
    expect(getProfileUrl()).toBe("/perfil")
    const storageUrl = getStorageBadgeUrl("badges/dino-hacker.svg")
    expect(storageUrl).toContain("/storage/v1/object/public/assets/badges/dino-hacker.svg")

    const globalAny = globalThis as unknown as { window?: Record<string, unknown> }
    globalAny.window = { location: { origin: "https://my-custom-domain.com" } }
    expect(getProfileUrl()).toBe("https://my-custom-domain.com/perfil")
    delete globalAny.window
  })
})
