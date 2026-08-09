DROP POLICY IF EXISTS "Admins can update events" ON "public"."events";

DROP POLICY IF EXISTS "Admins can insert activities" ON "public"."activities";
DROP POLICY IF EXISTS "Admins can update activities" ON "public"."activities";
DROP POLICY IF EXISTS "Admins can delete activities" ON "public"."activities";

DROP POLICY IF EXISTS "Admins can insert event_form_fields" ON "public"."event_form_fields";
DROP POLICY IF EXISTS "Admins can update event_form_fields" ON "public"."event_form_fields";
DROP POLICY IF EXISTS "Admins can delete event_form_fields" ON "public"."event_form_fields";

CREATE POLICY "Admins can update events" ON "public"."events"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can insert activities" ON "public"."activities"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can update activities" ON "public"."activities"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can delete activities" ON "public"."activities"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can insert event_form_fields" ON "public"."event_form_fields"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can update event_form_fields" ON "public"."event_form_fields"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "Admins can delete event_form_fields" ON "public"."event_form_fields"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));
