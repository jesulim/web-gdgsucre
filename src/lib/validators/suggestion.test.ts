import { describe, expect, it } from "bun:test"
import { suggestionSchema } from "./suggestion"

describe("suggestionSchema validator", () => {
  it("validates valid input correctly", () => {
    const input = {
      subject: "Propuesta de taller Docker",
      message: "Me gustaría que organicen un taller práctico sobre contenedores Docker.",
    }
    const result = suggestionSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.subject).toBe("Propuesta de taller Docker")
      expect(result.data.message).toBe(
        "Me gustaría que organicen un taller práctico sobre contenedores Docker."
      )
    }
  })

  it("trims whitespace from subject and message", () => {
    const input = {
      subject: "   Tema interesante   ",
      message: "   Este es un mensaje con espacios en los extremos   ",
    }
    const result = suggestionSchema.safeParse(input)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.subject).toBe("Tema interesante")
      expect(result.data.message).toBe("Este es un mensaje con espacios en los extremos")
    }
  })

  it("fails when subject is too short (< 3 chars after trim)", () => {
    const input = {
      subject: "  ab  ",
      message: "Este es un mensaje suficientemente largo para pasar.",
    }
    const result = suggestionSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.includes("subject"))
      expect(issue).toBeDefined()
    }
  })

  it("fails when subject exceeds 120 characters", () => {
    const input = {
      subject: "a".repeat(121),
      message: "Este es un mensaje suficientemente largo para pasar.",
    }
    const result = suggestionSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.includes("subject"))
      expect(issue).toBeDefined()
    }
  })

  it("fails when message is too short (< 10 chars after trim)", () => {
    const input = {
      subject: "Asunto válido",
      message: "  corto  ",
    }
    const result = suggestionSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.includes("message"))
      expect(issue).toBeDefined()
    }
  })

  it("fails when message exceeds 1000 characters", () => {
    const input = {
      subject: "Asunto válido",
      message: "m".repeat(1001),
    }
    const result = suggestionSchema.safeParse(input)
    expect(result.success).toBe(false)
    if (!result.success) {
      const issue = result.error.issues.find(i => i.path.includes("message"))
      expect(issue).toBeDefined()
    }
  })

  it("fails when required fields are missing or not strings", () => {
    expect(suggestionSchema.safeParse({}).success).toBe(false)
    expect(suggestionSchema.safeParse({ subject: 123, message: null }).success).toBe(false)
    expect(suggestionSchema.safeParse(null).success).toBe(false)
  })
})
