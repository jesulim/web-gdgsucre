CREATE OR REPLACE FUNCTION "public"."remove_registration_badge"()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  DELETE FROM public.user_badges ub
  USING public.events e, public.badges b
  WHERE e.id = OLD.event_id
    AND b.name = 'Participante ' || e.name
    AND ub.badge_id = b.id
    AND ub.user_id = OLD.user_id;

  RETURN OLD;
END;
$$;

REVOKE EXECUTE ON FUNCTION "public"."remove_registration_badge"() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS "remove_registration_badge" ON "public"."registrations";
CREATE TRIGGER "remove_registration_badge"
  BEFORE DELETE
  ON "public"."registrations"
  FOR EACH ROW EXECUTE FUNCTION "public"."remove_registration_badge"();
