import { describe, expect, it } from "bun:test"
import {
  CANONICAL_DINO_KEY,
  analyzeSubmission,
  generateDinoPackets,
  validateFlag,
} from "./obfuscation"
import { initConsolePuzzle } from "./consolePuzzle"

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
    }
  })
})
