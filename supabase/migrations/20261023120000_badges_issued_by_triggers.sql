CREATE OR REPLACE FUNCTION "public"."sync_checkin_badge"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_registration_id bigint;
  v_activity_id bigint;
  v_completed boolean;
  v_user_id uuid;
  v_badge_id bigint;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_registration_id := OLD.registration_id;
    v_activity_id := OLD.activity_id;
    v_completed := false;
  ELSE
    v_registration_id := NEW.registration_id;
    v_activity_id := NEW.activity_id;
    v_completed := COALESCE(NEW.completed, false);
  END IF;

  SELECT r.user_id, b.id
  INTO v_user_id, v_badge_id
  FROM public.registrations r
  JOIN public.activities a
    ON a.id = v_activity_id AND a.event_id = r.event_id AND a.name = 'check_in'
  JOIN public.events e ON e.id = r.event_id
  JOIN public.badges b ON b.name = 'Participante ' || e.name
  WHERE r.id = v_registration_id
  ORDER BY b.id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF v_completed THEN
    INSERT INTO public.user_badges (user_id, badge_id)
    VALUES (v_user_id, v_badge_id)
    ON CONFLICT (badge_id, user_id) DO NOTHING;
  ELSE
    DELETE FROM public.user_badges
    WHERE user_id = v_user_id AND badge_id = v_badge_id;
  END IF;

  RETURN NULL;
END;
$$;

CREATE OR REPLACE FUNCTION "public"."sync_organizer_badge"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_profile_id uuid;
  v_event_id bigint;
  v_badge_id bigint;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_profile_id := OLD.profile_id;
    v_event_id := OLD.event_id;
  ELSE
    v_profile_id := NEW.profile_id;
    v_event_id := NEW.event_id;
  END IF;

  SELECT b.id
  INTO v_badge_id
  FROM public.events e
  JOIN public.badges b ON b.name = 'Organizador ' || e.name
  WHERE e.id = v_event_id
  ORDER BY b.id
  LIMIT 1;

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  IF TG_OP = 'DELETE' THEN
    DELETE FROM public.user_badges
    WHERE user_id = v_profile_id AND badge_id = v_badge_id;
  ELSE
    INSERT INTO public.user_badges (user_id, badge_id)
    VALUES (v_profile_id, v_badge_id)
    ON CONFLICT (badge_id, user_id) DO NOTHING;
  END IF;

  RETURN NULL;
END;
$$;

REVOKE EXECUTE ON FUNCTION "public"."sync_checkin_badge"() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION "public"."sync_organizer_badge"() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS "sync_checkin_badge" ON "public"."registration_activities";
CREATE TRIGGER "sync_checkin_badge"
  AFTER INSERT OR DELETE OR UPDATE OF "completed"
  ON "public"."registration_activities"
  FOR EACH ROW EXECUTE FUNCTION "public"."sync_checkin_badge"();

DROP TRIGGER IF EXISTS "sync_organizer_badge" ON "public"."organizers";
CREATE TRIGGER "sync_organizer_badge"
  AFTER INSERT OR DELETE
  ON "public"."organizers"
  FOR EACH ROW EXECUTE FUNCTION "public"."sync_organizer_badge"();

INSERT INTO "public"."badges" ("name", "image_url")
SELECT v."name", v."image_url"
FROM (VALUES
  ('Participante I/O Extended Sucre 2026', 'io-extended-26.webp'),
  ('Organizador I/O Extended Sucre 2026', 'io-extended-26.webp')
) AS v("name", "image_url")
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."badges" b WHERE b."name" = v."name"
);

INSERT INTO "public"."user_badges" ("user_id", "badge_id")
SELECT DISTINCT r."user_id", b."id"
FROM "public"."registrations" r
JOIN "public"."events" e ON e."id" = r."event_id" AND e."slug" = 'io-extended-26'
JOIN "public"."activities" a ON a."event_id" = e."id" AND a."name" = 'check_in'
JOIN "public"."registration_activities" ra
  ON ra."registration_id" = r."id" AND ra."activity_id" = a."id" AND ra."completed"
JOIN "public"."badges" b ON b."name" = 'Participante ' || e."name"
ON CONFLICT ("badge_id", "user_id") DO NOTHING;

INSERT INTO "public"."user_badges" ("user_id", "badge_id")
SELECT DISTINCT o."profile_id", b."id"
FROM "public"."organizers" o
JOIN "public"."events" e ON e."id" = o."event_id" AND e."slug" = 'io-extended-26'
JOIN "public"."badges" b ON b."name" = 'Organizador ' || e."name"
ON CONFLICT ("badge_id", "user_id") DO NOTHING;
