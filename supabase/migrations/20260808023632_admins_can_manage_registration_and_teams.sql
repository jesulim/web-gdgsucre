DROP POLICY IF EXISTS "Admins can insert registrations" ON "public"."registrations";
DROP POLICY IF EXISTS "Admins can update registrations" ON "public"."registrations";
DROP POLICY IF EXISTS "Admins can delete registrations" ON "public"."registrations";

DROP POLICY IF EXISTS "Admins can insert registration_activities" ON "public"."registration_activities";
DROP POLICY IF EXISTS "Admins can update registration_activities" ON "public"."registration_activities";
DROP POLICY IF EXISTS "Admins can delete registration_activities" ON "public"."registration_activities";

DROP POLICY IF EXISTS "Admins can insert teams" ON "public"."teams";
DROP POLICY IF EXISTS "Admins can update teams" ON "public"."teams";
DROP POLICY IF EXISTS "Admins can delete teams" ON "public"."teams";

DROP POLICY IF EXISTS "Admins can insert team_registrations" ON "public"."team_registrations";
DROP POLICY IF EXISTS "Admins can update team_registrations" ON "public"."team_registrations";
DROP POLICY IF EXISTS "Admins can delete team_registrations" ON "public"."team_registrations";

CREATE POLICY "Admins can insert registrations" ON "public"."registrations"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can update registrations" ON "public"."registrations"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can delete registrations" ON "public"."registrations"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can insert registration_activities" ON "public"."registration_activities"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can update registration_activities" ON "public"."registration_activities"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can delete registration_activities" ON "public"."registration_activities"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can insert teams" ON "public"."teams"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can update teams" ON "public"."teams"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can delete teams" ON "public"."teams"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can insert team_registrations" ON "public"."team_registrations"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can update team_registrations" ON "public"."team_registrations"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can delete team_registrations" ON "public"."team_registrations"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));
