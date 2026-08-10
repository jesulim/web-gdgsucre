DROP POLICY IF EXISTS "Can view badges" ON "public"."badges";
DROP POLICY IF EXISTS "Admins can insert badges" ON "public"."badges";
DROP POLICY IF EXISTS "Admins can update badges" ON "public"."badges";
DROP POLICY IF EXISTS "Admins can delete badges" ON "public"."badges";

CREATE POLICY "Can view badges" ON "public"."badges"
  AS permissive
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert badges" ON "public"."badges"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."is_admin"(auth.uid()));


CREATE POLICY "Admins can update badges" ON "public"."badges"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));


CREATE POLICY "Admins can delete badges" ON "public"."badges"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));

DROP POLICY IF EXISTS "Can see its own badges" ON "public"."user_badges";
DROP POLICY IF EXISTS "Admins can issue user_badges" ON "public"."user_badges";
DROP POLICY IF EXISTS "Admins can update user_badges" ON "public"."user_badges";
DROP POLICY IF EXISTS "Admins can delete user_badges" ON "public"."user_badges";

CREATE POLICY "Can see its own badges" ON "public"."user_badges"
  AS permissive
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid() AS uid) = user_id);

CREATE POLICY "Admins can issue badges" ON "public"."user_badges"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can update user_badges" ON "public"."user_badges"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can delete user_badges" ON "public"."user_badges"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));


ALTER TABLE "public"."badges" DROP COLUMN IF EXISTS "description";

INSERT INTO "public"."badges" ("name", "image_url")
SELECT v."name", v."image_url"
FROM (VALUES
  ('Participante I/O Extended Sucre 2025', 'io-extended-25.webp'),
  ('Organizador I/O Extended Sucre 2025', 'io-extended-25.webp'),
  ('Participante DevFest Sucre 2025', 'devfest-25.webp'),
  ('Organizador DevFest Sucre 2025', 'devfest-25.webp'),
  ('Participante Build With AI Sucre 2026', 'bwai-26.webp'),
  ('Organizador Build With AI Sucre 2026', 'bwai-26.webp'),
  ('Participante I/O Extended Sucre 2026', 'io-extended-26.webp'),
  ('Organizador I/O Extended Sucre 2026', 'io-extended-26.webp')
) AS v("name", "image_url")
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."badges" b WHERE b."name" = v."name"
);
