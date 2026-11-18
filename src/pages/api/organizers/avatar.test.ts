import { describe, expect, it } from "bun:test"
import type { AuthContext } from "@/lib/auth"
import { uploadProfileAvatar } from "@/lib/services/profileService"
import { handleOrganizerAvatarUpload, POST } from "./avatar"

describe("Organizer Avatar Upload API (/api/organizers/avatar)", () => {
  it("rejects unauthenticated requests with 401", async () => {
    const mockRequest = new Request("http://localhost/api/organizers/avatar", {
      method: "POST",
    })

    const response = await POST({
      request: mockRequest,
      cookies: {
        get: () => undefined,
      } as unknown,
    } as unknown as Parameters<typeof POST>[0])

    expect(response.status).toBe(401)
    const json = await response.json()
    expect(json.error).toBe("No autenticado")
  })

  it("returns 400 when avatar file is missing", async () => {
    const formData = new FormData()
    formData.append("profile_id", "123e4567-e89b-12d3-a456-426614174000")

    const mockRequest = new Request("http://localhost/api/organizers/avatar", {
      method: "POST",
      body: formData,
    })

    const mockAuthContext = {
      request: mockRequest,
      auth: {
        supabase: {} as unknown,
        profile: { id: "admin-id", is_admin: true } as unknown,
      },
    } as unknown as AuthContext

    const response = await handleOrganizerAvatarUpload(mockAuthContext)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toContain("imagen")
  })

  it("returns 400 when profile_id is missing or invalid", async () => {
    const formData = new FormData()
    const file = new File(["dummy content"], "avatar.webp", { type: "image/webp" })
    formData.append("avatar", file)
    formData.append("profile_id", "invalid-uuid")

    const mockRequest = new Request("http://localhost/api/organizers/avatar", {
      method: "POST",
      body: formData,
    })

    const mockAuthContext = {
      request: mockRequest,
      auth: {
        supabase: {} as unknown,
        profile: { id: "admin-id", is_admin: true } as unknown,
      },
    } as unknown as AuthContext

    const response = await handleOrganizerAvatarUpload(mockAuthContext)
    expect(response.status).toBe(400)
    const json = await response.json()
    expect(json.error).toContain("profile_id")
  })

  it("uploads avatar to storage, updates profiles table with cache-busting, and returns 200", async () => {
    const targetProfileId = "123e4567-e89b-12d3-a456-426614174000"
    const formData = new FormData()
    const file = new File(["dummy webp image content"], "avatar.webp", { type: "image/webp" })
    formData.append("avatar", file)
    formData.append("profile_id", targetProfileId)

    const mockRequest = new Request("http://localhost/api/organizers/avatar", {
      method: "POST",
      body: formData,
    })

    let uploadedPath = ""
    let uploadedFile: unknown = null
    let updatedProfileData: { avatar_url?: string } | null = null
    let updatedProfileId = ""

    const mockSupabase = {
      storage: {
        from: (bucket: string) => {
          expect(bucket).toBe("assets")
          return {
            upload: async (path: string, blob: unknown, options: { upsert?: boolean }) => {
              uploadedPath = path
              uploadedFile = blob
              expect(options.upsert).toBe(true)
              return { error: null }
            },
            getPublicUrl: (path: string) => ({
              data: {
                publicUrl: `https://mock-storage.supabase.co/storage/v1/object/public/assets/${path}`,
              },
            }),
          }
        },
      },
      from: (table: string) => {
        expect(table).toBe("profiles")
        return {
          update: (data: { avatar_url?: string }) => {
            updatedProfileData = data
            return {
              eq: (field: string, value: string) => {
                expect(field).toBe("id")
                updatedProfileId = value
                return { error: null }
              },
            }
          },
        }
      },
    }

    const mockAuthContext = {
      request: mockRequest,
      auth: {
        supabase: mockSupabase as unknown,
        profile: { id: "admin-id", is_admin: true } as unknown,
      },
    } as unknown as AuthContext

    const response = await handleOrganizerAvatarUpload(mockAuthContext)
    expect(response.status).toBe(200)

    const json = await response.json()
    expect(json.avatar_url).toBeDefined()
    expect(json.avatar_url).toContain(`profile_pics/${targetProfileId}.webp`)
    expect(json.avatar_url).toMatch(/\?t=\d+$/)

    expect(uploadedPath).toBe(`profile_pics/${targetProfileId}.webp`)
    expect(uploadedFile).toBeDefined()
    expect(updatedProfileId).toBe(targetProfileId)
    expect(updatedProfileData?.avatar_url).toBe(json.avatar_url)
  })

  it("handles storage service upload errors with 500", async () => {
    const targetProfileId = "123e4567-e89b-12d3-a456-426614174000"
    const formData = new FormData()
    const file = new File(["dummy webp image content"], "avatar.webp", { type: "image/webp" })
    formData.append("avatar", file)
    formData.append("profile_id", targetProfileId)

    const mockRequest = new Request("http://localhost/api/organizers/avatar", {
      method: "POST",
      body: formData,
    })

    const mockSupabase = {
      storage: {
        from: () => ({
          upload: async () => ({ error: new Error("Storage bucket connection failed") }),
          getPublicUrl: () => ({ data: { publicUrl: "" } }),
        }),
      },
      from: () => ({
        update: () => ({ eq: () => ({ error: null }) }),
      }),
    }

    const mockAuthContext = {
      request: mockRequest,
      auth: {
        supabase: mockSupabase as unknown,
        profile: { id: "admin-id", is_admin: true } as unknown,
      },
    } as unknown as AuthContext

    const response = await handleOrganizerAvatarUpload(mockAuthContext)
    expect(response.status).toBe(500)
    const json = await response.json()
    expect(json.error).toContain("Storage bucket connection failed")
  })
})

describe("uploadProfileAvatar Service Function", () => {
  it("enforces deterministic .webp storage path and updates profiles table", async () => {
    const profileId = "987fcdeb-51a2-43d7-9012-3456789abcde"
    const file = new File(["sample webp"], "avatar.png", { type: "image/webp" })

    let uploadedPath = ""
    let updatedAvatarUrl = ""

    const mockSupabase = {
      storage: {
        from: (bucket: string) => {
          expect(bucket).toBe("assets")
          return {
            upload: async (
              path: string,
              _blob: unknown,
              options: { upsert?: boolean; contentType?: string }
            ) => {
              uploadedPath = path
              expect(options.upsert).toBe(true)
              expect(options.contentType).toBe("image/webp")
              return { error: null }
            },
            getPublicUrl: (path: string) => ({
              data: {
                publicUrl: `https://example.supabase.co/storage/v1/object/public/assets/${path}`,
              },
            }),
          }
        },
      },
      from: (table: string) => {
        expect(table).toBe("profiles")
        return {
          update: (data: { avatar_url?: string }) => {
            updatedAvatarUrl = data.avatar_url || ""
            return {
              eq: (field: string, value: string) => {
                expect(field).toBe("id")
                expect(value).toBe(profileId)
                return { error: null }
              },
            }
          },
        }
      },
    }

    const result = await uploadProfileAvatar(
      mockSupabase as unknown as Parameters<typeof uploadProfileAvatar>[0],
      profileId,
      file
    )
    expect(result.success).toBe(true)
    if (result.success) {
      expect(uploadedPath).toBe(`profile_pics/${profileId}.webp`)
      expect(result.avatarUrl).toContain(`profile_pics/${profileId}.webp`)
      expect(result.avatarUrl).toMatch(/\?t=\d+$/)
      expect(updatedAvatarUrl).toBe(result.avatarUrl)
    }
  })
})
