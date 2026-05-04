CREATE OR REPLACE FUNCTION "public"."is_admin"("p_user_id" uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((
    SELECT "profiles"."is_admin"
    FROM "public"."profiles"
    WHERE "profiles"."id" = "p_user_id"
  ), false);
$$;

CREATE OR REPLACE FUNCTION "public"."is_event_staff"("p_event_id" bigint, "p_user_id" uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "public"."event_staff"
    WHERE "event_staff"."event_id" = "p_event_id"
      AND "event_staff"."user_id" = "p_user_id"
  );
$$;

CREATE OR REPLACE FUNCTION "public"."can_access_event"("p_event_id" bigint, "p_user_id" uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT "public"."is_admin"("p_user_id")
    OR "public"."is_event_staff"("p_event_id", "p_user_id");
$$;

CREATE OR REPLACE FUNCTION "public"."has_registration_for_event"("p_event_id" bigint, "p_user_id" uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "public"."registrations"
    WHERE "registrations"."event_id" = "p_event_id"
      AND "registrations"."user_id" = "p_user_id"
  );
$$;

CREATE OR REPLACE FUNCTION "public"."can_access_registration"("p_registration_id" bigint, "p_user_id" uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "public"."registrations"
    WHERE "registrations"."id" = "p_registration_id"
      AND (
        "registrations"."user_id" = "p_user_id"
        OR "public"."can_access_event"("registrations"."event_id", "p_user_id")
      )
  );
$$;

CREATE OR REPLACE FUNCTION "public"."can_access_team"("p_team_id" bigint, "p_user_id" uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM "public"."teams"
    WHERE "teams"."id" = "p_team_id"
      AND "public"."can_access_event"("teams"."event_id", "p_user_id")
  )
  OR EXISTS (
    SELECT 1
    FROM "public"."team_registrations"
    JOIN "public"."registrations"
      ON "registrations"."id" = "team_registrations"."registration_id"
    WHERE "team_registrations"."team_id" = "p_team_id"
      AND "registrations"."user_id" = "p_user_id"
  );
$$;

DROP POLICY IF EXISTS "Can view events" ON "public"."events";
DROP POLICY IF EXISTS "Allow all to authenticated users" ON "public"."registrations";
DROP POLICY IF EXISTS "Policy with security definer functions" ON "public"."activities";
DROP POLICY IF EXISTS "Policy with security definer functions" ON "public"."registration_activities";
DROP POLICY IF EXISTS "Allow all to authenticated users" ON "public"."teams";
DROP POLICY IF EXISTS "Allow all to authenticated users" ON "public"."team_registrations";

CREATE POLICY "Can view events" ON "public"."events"
  AS permissive
  FOR SELECT
  TO authenticated
  USING (
    "public"."can_access_event"("events"."id", auth.uid())
    OR "public"."has_registration_for_event"("events"."id", auth.uid())
  );

CREATE POLICY "Can view registrations" ON "public"."registrations"
  AS permissive
  FOR SELECT
  TO authenticated
  USING (
    "registrations"."user_id" = auth.uid()
    OR "public"."can_access_event"("registrations"."event_id", auth.uid())
  );

CREATE POLICY "Can manage own registrations" ON "public"."registrations"
  AS permissive
  FOR ALL
  TO authenticated
  USING ("registrations"."user_id" = auth.uid())
  WITH CHECK ("registrations"."user_id" = auth.uid());

CREATE POLICY "Can view activities" ON "public"."activities"
  AS permissive
  FOR SELECT
  TO authenticated
  USING (
    "public"."can_access_event"("activities"."event_id", auth.uid())
    OR "public"."has_registration_for_event"("activities"."event_id", auth.uid())
  );

CREATE POLICY "Can view registration activities" ON "public"."registration_activities"
  AS permissive
  FOR SELECT
  TO authenticated
  USING ("public"."can_access_registration"("registration_activities"."registration_id", auth.uid()));

CREATE POLICY "Can manage registration activities" ON "public"."registration_activities"
  AS permissive
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM "public"."registrations"
      WHERE "registrations"."id" = "registration_activities"."registration_id"
        AND "public"."can_access_event"("registrations"."event_id", auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM "public"."registrations"
      WHERE "registrations"."id" = "registration_activities"."registration_id"
        AND "public"."can_access_event"("registrations"."event_id", auth.uid())
    )
  );

CREATE POLICY "Can view teams" ON "public"."teams"
  AS permissive
  FOR SELECT
  TO authenticated
  USING ("public"."can_access_team"("teams"."id", auth.uid()));

CREATE POLICY "Can view team registrations" ON "public"."team_registrations"
  AS permissive
  FOR SELECT
  TO authenticated
  USING (
    "public"."can_access_team"("team_registrations"."team_id", auth.uid())
    OR "public"."can_access_registration"("team_registrations"."registration_id", auth.uid())
  );
