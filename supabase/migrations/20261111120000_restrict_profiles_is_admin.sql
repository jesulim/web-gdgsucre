-- Keep is_admin out of reach of the person whose profile it is.


REVOKE INSERT, UPDATE ON "public"."profiles" FROM "anon", "authenticated";

GRANT INSERT (
  "id",
  "email",
  "first_name",
  "last_name",
  "occupation",
  "phone_number",
  "avatar_url",
  "share_data",
  "display_name"
) ON "public"."profiles" TO "authenticated";

GRANT UPDATE (
  "email",
  "first_name",
  "last_name",
  "occupation",
  "phone_number",
  "avatar_url",
  "share_data",
  "display_name",
  "updated_at"
) ON "public"."profiles" TO "authenticated";
