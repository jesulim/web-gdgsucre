ALTER TABLE "public"."profiles"
  ADD COLUMN "share_data" boolean DEFAULT false NOT NULL,
  ADD COLUMN "display_name" text;

CREATE INDEX IF NOT EXISTS "profiles_share_data_idx" ON "public"."profiles" ("share_data");
