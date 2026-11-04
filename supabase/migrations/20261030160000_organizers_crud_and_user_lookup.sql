CREATE OR REPLACE FUNCTION "public"."get_user_by_email"("p_email" text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_user record;
BEGIN
  IF NOT "public"."is_admin"(auth.uid()) THEN
    RAISE EXCEPTION 'Unauthorized: only admins can search auth users';
  END IF;

  SELECT id, email, raw_user_meta_data
  INTO v_user
  FROM auth.users
  WHERE LOWER(email) = LOWER(TRIM(p_email))
  LIMIT 1;

  IF v_user.id IS NULL THEN
    RETURN NULL;
  END IF;

  RETURN jsonb_build_object(
    'id', v_user.id,
    'email', v_user.email,
    'raw_user_meta_data', v_user.raw_user_meta_data
  );
END;
$$;

GRANT EXECUTE ON FUNCTION "public"."get_user_by_email"(text) TO "authenticated";

DROP POLICY IF EXISTS "Admins can update profiles" ON "public"."profiles";

CREATE POLICY "Admins can update profiles" ON "public"."profiles"
  FOR UPDATE
  TO authenticated
  USING ("public"."is_admin"(auth.uid()))
  WITH CHECK ("public"."is_admin"(auth.uid()));
