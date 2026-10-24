import { describe, expect, it } from "bun:test"
import { POST } from "./claim"

describe("Badge Claim API endpoint (/api/badges/claim)", () => {
  it("returns 400 for an invalid flag", async () => {
    const mockRequest = new Request("http://localhost/api/badges/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag: "INCORRECT_FLAG" }),
    })

    const response = await POST({
      request: mockRequest,
      cookies: {} as any,
    } as any)

    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toBe("Invalid flag")
  })

  it("returns 400 for missing flag payload", async () => {
    const mockRequest = new Request("http://localhost/api/badges/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    })

    const response = await POST({
      request: mockRequest,
      cookies: {} as any,
    } as any)

    expect(response.status).toBe(400)
  })

  it("returns 200 and badge details for canonical Dino Key", async () => {
    const mockRequest = new Request("http://localhost/api/badges/claim", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flag: "GDG_DINO_HACKER" }),
    })

    const response = await POST({
      request: mockRequest,
      cookies: {
        get: () => undefined,
      } as any,
    } as any)

    expect(response.status).toBe(200)
    const json = await response.json()
    expect(json.success).toBe(true)
    expect(json.badge.name).toBe("Dino Hacker")
    expect(json.badge.image_url).toBe("/badges/dino-hacker.svg")
  })
})
