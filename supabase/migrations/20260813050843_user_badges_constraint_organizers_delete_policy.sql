-- Delete duplicated rows
DELETE FROM public.user_badges a
USING public.user_badges b
WHERE a.ctid < b.ctid
  AND a.badge_id = b.badge_id
  AND a.user_id = b.user_id;

DELETE FROM public.organizers a
USING public.organizers b
WHERE a.id < b.id
  AND a.profile_id = b.profile_id
  AND a.event_id = b.event_id;

ALTER TABLE "public"."user_badges"
ADD CONSTRAINT unique_badge_per_user UNIQUE (badge_id, user_id);

ALTER TABLE "public"."organizers"
ADD CONSTRAINT unique_profile_event UNIQUE (profile_id, event_id);

-- Migrated to organizers table
ALTER TABLE "public"."registrations" DROP COLUMN IF EXISTS role;

DROP POLICY IF EXISTS "Admins can delete organizers" ON "public"."organizers";

CREATE POLICY "Admins can delete organizers" ON "public"."organizers"
  AS permissive
  FOR DELETE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()));
