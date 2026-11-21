import { describe, expect, it } from "bun:test"
import type { SupabaseClient } from "@supabase/supabase-js"
import { createSuggestion, getSuggestions } from "./suggestionService"

describe("suggestionService", () => {
  it("createSuggestion successfully inserts and returns a suggestion", async () => {
    const mockSupabase = {
      from: (table: string) => {
        expect(table).toBe("suggestions")
        return {
          insert: (values: { user_id: string; subject: string; message: string }) => {
            expect(values.user_id).toBe("user-123")
            expect(values.subject).toBe("Taller Docker")
            expect(values.message).toBe("Me gustaría ver un taller práctico.")
            return {
              select: (fields: string) => {
                expect(fields).toContain("id")
                return {
                  single: async () => ({
                    data: {
                      id: "sugg-abc",
                      user_id: values.user_id,
                      subject: values.subject,
                      message: values.message,
                      status: "unread",
                      created_at: "2026-11-09T10:00:00Z",
                    },
                    error: null,
                  }),
                }
              },
            }
          },
        }
      },
    } as unknown as SupabaseClient

    const result = await createSuggestion(mockSupabase, "user-123", {
      subject: "Taller Docker",
      message: "Me gustaría ver un taller práctico.",
    })

    expect(result.id).toBe("sugg-abc")
    expect(result.user_id).toBe("user-123")
    expect(result.subject).toBe("Taller Docker")
    expect(result.status).toBe("unread")
  })

  it("createSuggestion throws an error if supabase returns an error", async () => {
    const mockSupabase = {
      from: () => ({
        insert: () => ({
          select: () => ({
            single: async () => ({
              data: null,
              error: { message: "violates foreign key constraint" },
            }),
          }),
        }),
      }),
    } as unknown as SupabaseClient

    expect(
      createSuggestion(mockSupabase, "user-123", {
        subject: "Taller",
        message: "Mensaje de prueba",
      })
    ).rejects.toThrow("Error creating suggestion: violates foreign key constraint")
  })

  it("getSuggestions returns a list of suggestions ordered by created_at", async () => {
    const mockSupabase = {
      from: (table: string) => {
        expect(table).toBe("suggestions")
        return {
          select: (fields: string) => {
            expect(fields).toContain("profiles")
            return {
              order: (column: string, opts: { ascending: boolean }) => {
                expect(column).toBe("created_at")
                expect(opts.ascending).toBe(false)
                return Promise.resolve({
                  data: [
                    {
                      id: "sugg-1",
                      user_id: "user-1",
                      subject: "Idea 1",
                      message: "Detalle de idea 1",
                      status: "unread",
                      created_at: "2026-11-09T10:00:00Z",
                      profiles: {
                        first_name: "Juan",
                        last_name: "Pérez",
                        avatar_url: null,
                        email: "juan@example.com",
                      },
                    },
                  ],
                  error: null,
                })
              },
            }
          },
        }
      },
    } as unknown as SupabaseClient

    const results = await getSuggestions(mockSupabase)
    expect(results).toHaveLength(1)
    expect(results[0].subject).toBe("Idea 1")
    expect(results[0].profiles?.first_name).toBe("Juan")
  })

  it("getSuggestions throws an error when query fails", async () => {
    const mockSupabase = {
      from: () => ({
        select: () => ({
          order: () =>
            Promise.resolve({
              data: null,
              error: { message: "Database connection failed" },
            }),
        }),
      }),
    } as unknown as SupabaseClient

    expect(getSuggestions(mockSupabase)).rejects.toThrow(
      "Error fetching suggestions: Database connection failed"
    )
  })
})
