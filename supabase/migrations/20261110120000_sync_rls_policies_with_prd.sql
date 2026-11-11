-- Sync RLS policies with the prd project.
--
-- These policies were edited by hand in the database console, so the repo no
-- longer described the real schema. This migration replays them: after it runs,
-- `supabase db push` / `db reset` ends on the same policies prd has.
--
-- It is a no-op on prd: every DROP is IF EXISTS and every CREATE replaces an
-- identical policy.
--
-- Supabase only: the public role is "anon" here.

-- ---------------------------------------------------------------------------
-- Drop the policies written by the previous migrations.
-- ---------------------------------------------------------------------------

-- activities
DROP POLICY IF EXISTS "Can view activities" ON "public"."activities";
DROP POLICY IF EXISTS "Admins can insert activities" ON "public"."activities";
DROP POLICY IF EXISTS "Admins can update activities" ON "public"."activities";
DROP POLICY IF EXISTS "Admins can delete activities" ON "public"."activities";
DROP POLICY IF EXISTS "Policy with security definer functions" ON "public"."activities";

-- badges
DROP POLICY IF EXISTS "Can view badges" ON "public"."badges";
DROP POLICY IF EXISTS "Admins can insert badges" ON "public"."badges";
DROP POLICY IF EXISTS "Admins can update badges" ON "public"."badges";
DROP POLICY IF EXISTS "Admins can delete badges" ON "public"."badges";

-- calendar_events
DROP POLICY IF EXISTS "Can view calendar events" ON "public"."calendar_events";
DROP POLICY IF EXISTS "Can insert calendar events" ON "public"."calendar_events";
DROP POLICY IF EXISTS "Can update calendar events" ON "public"."calendar_events";
DROP POLICY IF EXISTS "Can delete calendar events" ON "public"."calendar_events";

-- communities
DROP POLICY IF EXISTS "Can view communities" ON "public"."communities";
DROP POLICY IF EXISTS "Can insert communities" ON "public"."communities";
DROP POLICY IF EXISTS "Can update communities" ON "public"."communities";
DROP POLICY IF EXISTS "Can delete communities" ON "public"."communities";

-- event_form_fields
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON "public"."event_form_fields";
DROP POLICY IF EXISTS "Admins can insert event_form_fields" ON "public"."event_form_fields";
DROP POLICY IF EXISTS "Admins can update event_form_fields" ON "public"."event_form_fields";
DROP POLICY IF EXISTS "Admins can delete event_form_fields" ON "public"."event_form_fields";

-- event_staff
DROP POLICY IF EXISTS "Can view event staff" ON "public"."event_staff";
DROP POLICY IF EXISTS "Can insert event staff" ON "public"."event_staff";
DROP POLICY IF EXISTS "Can update event staff" ON "public"."event_staff";
DROP POLICY IF EXISTS "Can delete event staff" ON "public"."event_staff";

-- events
DROP POLICY IF EXISTS "Can view events" ON "public"."events";
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON "public"."events";
DROP POLICY IF EXISTS "Admins can update events" ON "public"."events";

-- organizers
DROP POLICY IF EXISTS "Can view organizers" ON "public"."organizers";
DROP POLICY IF EXISTS "Can insert organizers" ON "public"."organizers";
DROP POLICY IF EXISTS "Can delete organizers" ON "public"."organizers";

-- profiles
DROP POLICY IF EXISTS "Can create profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Can view profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Users can update only its own profile" ON "public"."profiles";
DROP POLICY IF EXISTS "Admins can update profiles" ON "public"."profiles";

-- registration_activities
DROP POLICY IF EXISTS "Can view registration activities" ON "public"."registration_activities";
DROP POLICY IF EXISTS "Can manage registration activities" ON "public"."registration_activities";
DROP POLICY IF EXISTS "Admins and staff can update registration_activities" ON "public"."registration_activities";
DROP POLICY IF EXISTS "Admins can insert registration_activities" ON "public"."registration_activities";
DROP POLICY IF EXISTS "Admins can delete registration_activities" ON "public"."registration_activities";
DROP POLICY IF EXISTS "Policy with security definer functions" ON "public"."registration_activities";

-- registrations
DROP POLICY IF EXISTS "Can view registrations" ON "public"."registrations";
DROP POLICY IF EXISTS "Can manage own registrations" ON "public"."registrations";
DROP POLICY IF EXISTS "Admins can insert registrations" ON "public"."registrations";
DROP POLICY IF EXISTS "Admins can update registrations" ON "public"."registrations";
DROP POLICY IF EXISTS "Admins can delete registrations" ON "public"."registrations";
DROP POLICY IF EXISTS "Allow all to authenticated users" ON "public"."registrations";

-- team_registrations
DROP POLICY IF EXISTS "Can view team registrations" ON "public"."team_registrations";
DROP POLICY IF EXISTS "Admins can insert team_registrations" ON "public"."team_registrations";
DROP POLICY IF EXISTS "Admins can update team_registrations" ON "public"."team_registrations";
DROP POLICY IF EXISTS "Admins can delete team_registrations" ON "public"."team_registrations";
DROP POLICY IF EXISTS "Allow all to authenticated users" ON "public"."team_registrations";

-- teams
DROP POLICY IF EXISTS "Can view teams" ON "public"."teams";
DROP POLICY IF EXISTS "Admins can insert teams" ON "public"."teams";
DROP POLICY IF EXISTS "Admins can update teams" ON "public"."teams";
DROP POLICY IF EXISTS "Admins can delete teams" ON "public"."teams";
DROP POLICY IF EXISTS "Allow all to authenticated users" ON "public"."teams";

-- user_badges
DROP POLICY IF EXISTS "Can see its own badges" ON "public"."user_badges";
DROP POLICY IF EXISTS "Admins can issue badges" ON "public"."user_badges";
DROP POLICY IF EXISTS "Admins can issue user_badges" ON "public"."user_badges";
DROP POLICY IF EXISTS "Admins can update user_badges" ON "public"."user_badges";
DROP POLICY IF EXISTS "Admins can delete user_badges" ON "public"."user_badges";

-- ---------------------------------------------------------------------------
-- Policies readable by the public role.
-- ---------------------------------------------------------------------------

CREATE POLICY "activities readable" ON "public"."activities"
  AS permissive
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "badges readable" ON "public"."badges"
  AS permissive
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "calendar events readable" ON "public"."calendar_events"
  AS permissive
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "calendar events insert public" ON "public"."calendar_events"
  AS permissive
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "communities readable" ON "public"."communities"
  AS permissive
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "communities insert public" ON "public"."communities"
  AS permissive
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "form fields readable" ON "public"."event_form_fields"
  AS permissive
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "events readable" ON "public"."events"
  AS permissive
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "organizers readable" ON "public"."organizers"
  AS permissive
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "profiles readable" ON "public"."profiles"
  AS permissive
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- Policies for the authenticated role.
-- ---------------------------------------------------------------------------

-- activities
CREATE POLICY "activities insert admin" ON "public"."activities"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "activities update admin" ON "public"."activities"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "activities delete admin" ON "public"."activities"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));

-- badges
CREATE POLICY "badges insert admin" ON "public"."badges"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "badges update admin" ON "public"."badges"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "badges delete admin" ON "public"."badges"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));

-- calendar_events
CREATE POLICY "calendar events update admin" ON "public"."calendar_events"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "calendar events delete admin" ON "public"."calendar_events"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));

-- communities
CREATE POLICY "communities update admin" ON "public"."communities"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "communities delete admin" ON "public"."communities"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));

-- event_form_fields
CREATE POLICY "form fields insert admin" ON "public"."event_form_fields"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "form fields update admin" ON "public"."event_form_fields"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "form fields delete admin" ON "public"."event_form_fields"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));

-- event_staff
CREATE POLICY "event staff readable" ON "public"."event_staff"
  AS permissive
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "event staff insert auth" ON "public"."event_staff"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "event staff update auth" ON "public"."event_staff"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "event staff delete auth" ON "public"."event_staff"
  AS permissive
  FOR DELETE
  TO authenticated
  USING (true);

-- events
CREATE POLICY "events insert admin" ON "public"."events"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "events update admin" ON "public"."events"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "events delete admin" ON "public"."events"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));

-- organizers
CREATE POLICY "organizers insert auth" ON "public"."organizers"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "organizers update admin" ON "public"."organizers"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "organizers delete admin" ON "public"."organizers"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));

-- profiles
CREATE POLICY "profiles insert auth" ON "public"."profiles"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "profiles update self" ON "public"."profiles"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("id" = auth.uid())
  WITH CHECK ("id" = auth.uid());

CREATE POLICY "profiles update admin" ON "public"."profiles"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

-- registration_activities
CREATE POLICY "registration activities read" ON "public"."registration_activities"
  AS permissive
  FOR SELECT
  TO authenticated
  USING ("public"."can_access_registration"(registration_id, auth.uid()));

CREATE POLICY "registration activities insert staff" ON "public"."registration_activities"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."can_access_registration"(registration_id, auth.uid()));

CREATE POLICY "registration activities update staff" ON "public"."registration_activities"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."can_access_registration"(registration_id, auth.uid()))
  WITH CHECK ("public"."can_access_registration"(registration_id, auth.uid()));

CREATE POLICY "registration activities delete staff" ON "public"."registration_activities"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."can_access_registration"(registration_id, auth.uid()));

-- registrations
CREATE POLICY "registrations read" ON "public"."registrations"
  AS permissive
  FOR SELECT
  TO authenticated
  USING (("user_id" = auth.uid()) OR "public"."can_access_event"(event_id, auth.uid()));

CREATE POLICY "registrations insert self" ON "public"."registrations"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("user_id" = auth.uid());

CREATE POLICY "registrations insert admin" ON "public"."registrations"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "registrations update self" ON "public"."registrations"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("user_id" = auth.uid())
  WITH CHECK ("user_id" = auth.uid());

CREATE POLICY "registrations update staff" ON "public"."registrations"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."can_access_event"(event_id, auth.uid()))
  WITH CHECK ("public"."can_access_event"(event_id, auth.uid()));

CREATE POLICY "registrations delete admin" ON "public"."registrations"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));

-- team_registrations
CREATE POLICY "team registrations readable" ON "public"."team_registrations"
  AS permissive
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "team registrations insert auth" ON "public"."team_registrations"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "team registrations update auth" ON "public"."team_registrations"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "team registrations delete auth" ON "public"."team_registrations"
  AS permissive
  FOR DELETE
  TO authenticated
  USING (true);

-- teams
CREATE POLICY "teams readable" ON "public"."teams"
  AS permissive
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "teams insert auth" ON "public"."teams"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "teams update auth" ON "public"."teams"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "teams delete auth" ON "public"."teams"
  AS permissive
  FOR DELETE
  TO authenticated
  USING (true);

-- user_badges
CREATE POLICY "user badges read own" ON "public"."user_badges"
  AS permissive
  FOR SELECT
  TO authenticated
  USING ("user_id" = auth.uid());

CREATE POLICY "user badges insert admin" ON "public"."user_badges"
  AS permissive
  FOR INSERT
  TO authenticated
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "user badges update admin" ON "public"."user_badges"
  AS permissive
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));

CREATE POLICY "user badges delete admin" ON "public"."user_badges"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));
