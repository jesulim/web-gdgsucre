-- Allows a non-admin (anon or authenticated) caller to create a community and
-- get its id back, even though the "Can view accepted communities" SELECT
-- policy (accepted OR is_admin) would otherwise reject the RETURNING clause
-- on a plain INSERT ... SELECT for a row that is created as accepted = false.
-- SECURITY DEFINER lets the function bypass RLS internally while still only
-- ever inserting with accepted = false (the parameter is not exposed).
CREATE OR REPLACE FUNCTION "public"."create_pending_community"(
  "p_name" text,
  "p_short_name" text,
  "p_website" text,
  "p_contact_email" text
)
RETURNS bigint
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id bigint;
BEGIN
  IF p_name IS NULL OR btrim(p_name) = '' THEN
    RAISE EXCEPTION 'name es requerido';
  END IF;

  IF p_contact_email IS NULL OR btrim(p_contact_email) = '' THEN
    RAISE EXCEPTION 'contact_email es requerido';
  END IF;

  INSERT INTO "public"."communities" ("name", "short_name", "website", "contact_email", "accepted")
  VALUES (
    btrim(p_name),
    NULLIF(btrim(p_short_name), ''),
    NULLIF(btrim(p_website), ''),
    btrim(p_contact_email),
    false
  )
  RETURNING "id" INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION "public"."create_pending_community"(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION "public"."create_pending_community"(text, text, text, text) TO "anon", "authenticated";
