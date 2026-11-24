import { beforeEach, describe, expect, it, mock } from "bun:test"
import type { APIContext } from "astro"

interface TestProfile {
  id: string
  first_name: string
  last_name?: string
  email: string
  existsInDb?: boolean
}

interface TestUser {
  id: string
  email?: string
}

let mockProfile: TestProfile | null = null
let mockUser: TestUser | null = null
let profileUpsertCalled = false
let emailInvokeCalled = false
let emailInvokeShouldFail = false

const actualSupabase = await import("@/lib/supabase")
const actualProfileService = await import("@/lib/services/profileService")

mock.module("@/lib/supabase", () => ({
  ...actualSupabase,
  createUserClient: async () => ({
    from: (table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({
              maybeSingle: async () => ({
                data: mockProfile?.existsInDb ? { id: mockProfile.id } : null,
                error: null,
              }),
            }),
          }),
          upsert: async () => {
            profileUpsertCalled = true
            return { error: null }
          },
        }
      }
      if (table === "suggestions") {
        return {
          insert: (values: { user_id: string; subject: string; message: string }) => ({
            select: () => ({
              single: async () => ({
                data: {
                  id: "sugg-123",
                  user_id: values.user_id,
                  subject: values.subject,
                  message: values.message,
                  status: "unread",
                  created_at: new Date().toISOString(),
                },
                error: null,
              }),
            }),
          }),
        }
      }
      return {}
    },
    functions: {
      invoke: async () => {
        emailInvokeCalled = true
        if (emailInvokeShouldFail) {
          return { error: new Error("SMTP connection failed") }
        }
        return { data: { success: true }, error: null }
      },
    },
    auth: {
      getUser: async () => ({ data: { user: mockUser }, error: null }),
    },
  }),
}))

mock.module("@/lib/services/profileService", () => ({
  ...actualProfileService,
  getProfile: async () => mockProfile,
  getUser: async () => mockUser,
}))

const { POST } = await import("./suggestions")

function createMockContext(request: Request): APIContext {
  return {
    request,
    cookies: {
      get: () => undefined,
      has: () => false,
      set: () => {},
      delete: () => {},
    },
  } as unknown as APIContext
}

describe("Suggestions API endpoint (/api/suggestions)", () => {
  beforeEach(() => {
    mockProfile = null
    mockUser = null
    profileUpsertCalled = false
    emailInvokeCalled = false
    emailInvokeShouldFail = false
  })

  it("returns 401 when the user is not authenticated", async () => {
    mockProfile = null
    const request = new Request("http://localhost/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "Taller de Rust",
        message: "Me gustaría aprender Rust y WebAssembly en Sucre.",
      }),
    })

    const response = await POST(createMockContext(request))
    expect(response.status).toBe(401)
    const json = await response.json()
    expect(json.error).toContain("No autorizado")
  })

  it("returns 400 when payload is missing or invalid JSON", async () => {
    mockProfile = { id: "user-1", first_name: "Ana", email: "ana@example.com" }
    const request = new Request("http://localhost/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "not-a-json",
    })

    const response = await POST(createMockContext(request))
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.details).toBeDefined()
  })

  it("returns 400 with specific error when subject is shorter than 3 chars", async () => {
    mockProfile = { id: "user-1", first_name: "Ana", email: "ana@example.com" }
    const request = new Request("http://localhost/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "  ab  ",
        message: "Este es un mensaje lo suficientemente largo.",
      }),
    })

    const response = await POST(createMockContext(request))
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBe("El asunto debe tener al menos 3 caracteres")
  })

  it("returns 400 with specific error when message is shorter than 10 chars", async () => {
    mockProfile = { id: "user-1", first_name: "Ana", email: "ana@example.com" }
    const request = new Request("http://localhost/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "Asunto válido",
        message: "  hola  ",
      }),
    })

    const response = await POST(createMockContext(request))
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBe("El mensaje debe tener al menos 10 caracteres")
  })

  it("returns 201 and persists suggestion when valid and profile exists in DB", async () => {
    mockProfile = {
      id: "user-1",
      first_name: "Carlos",
      last_name: "Gutiérrez",
      email: "carlos@example.com",
      existsInDb: true,
    }
    const request = new Request("http://localhost/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "Taller de Clean Architecture",
        message: "Excelente iniciativa, me gustaría ver Clean Architecture en backend.",
      }),
    })

    const response = await POST(createMockContext(request))
    expect(response.status).toBe(201)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(json.message).toBe("¡Gracias por tu sugerencia!")
    expect(profileUpsertCalled).toBe(false)
    expect(emailInvokeCalled).toBe(true)
  })

  it("returns 201 and auto-creates profile in DB when user has no existing profile row", async () => {
    mockProfile = {
      id: "user-new",
      first_name: "Nuevo",
      last_name: "Usuario",
      email: "nuevo@example.com",
      existsInDb: false,
    }
    const request = new Request("http://localhost/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "Hackathon 2026",
        message: "Propongo un fin de semana completo para una hackathon tecnológica.",
      }),
    })

    const response = await POST(createMockContext(request))
    expect(response.status).toBe(201)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(profileUpsertCalled).toBe(true)
  })

  it("returns 201 even when email dispatch fails (does not abort DB insert)", async () => {
    mockProfile = {
      id: "user-1",
      first_name: "Carlos",
      email: "carlos@example.com",
      existsInDb: true,
    }
    emailInvokeShouldFail = true

    const request = new Request("http://localhost/api/suggestions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subject: "Taller de Flutter",
        message: "Nos gustaría que continúen con la serie de talleres de Flutter.",
      }),
    })

    const response = await POST(createMockContext(request))
    expect(response.status).toBe(201)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(emailInvokeCalled).toBe(true)
  })
})
