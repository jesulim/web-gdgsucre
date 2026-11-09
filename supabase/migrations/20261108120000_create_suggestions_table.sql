CREATE TABLE IF NOT EXISTS "public"."suggestions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "subject" "text" NOT NULL,
    "message" "text" NOT NULL,
    "status" "text" DEFAULT 'unread' NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "suggestions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "suggestions_user_id_idx" ON "public"."suggestions" ("user_id");

ALTER TABLE "public"."suggestions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can create suggestions" ON "public"."suggestions"
    AS PERMISSIVE FOR INSERT TO authenticated
    WITH CHECK ("auth"."uid"() = "user_id");

CREATE POLICY "Users can view their own suggestions" ON "public"."suggestions"
    AS PERMISSIVE FOR SELECT TO authenticated
    USING ("auth"."uid"() = "user_id" OR "public"."is_admin"("auth"."uid"()));

CREATE POLICY "Admins can update suggestions" ON "public"."suggestions"
    AS PERMISSIVE FOR UPDATE TO authenticated
    USING ("public"."is_admin"("auth"."uid"()))
    WITH CHECK ("public"."is_admin"("auth"."uid"()));

CREATE POLICY "Admins can delete suggestions" ON "public"."suggestions"
    AS PERMISSIVE FOR DELETE TO authenticated
    USING ("public"."is_admin"("auth"."uid"()));
