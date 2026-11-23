import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import { relations } from "./relations"

const databaseUrl = import.meta.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured")
}

const client = neon(databaseUrl)

export const db = drizzle({
  client,
  relations,
})
