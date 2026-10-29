INSERT INTO "public"."events" ("name", "date", "slug", "image_url", "registration_open")
SELECT 'DevFest Sucre 2024', '2024-11-16'::date, 'devfest-24', 'devfest-24.webp', false
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."events" WHERE "slug" = 'devfest-24'
);

INSERT INTO "public"."badges" ("name", "image_url")
SELECT v."name", v."image_url"
FROM (VALUES
  ('Participante DevFest Sucre 2024', 'devfest-24.webp'),
  ('Organizador DevFest Sucre 2024', 'devfest-24.webp')
) AS v("name", "image_url")
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."badges" b WHERE b."name" = v."name"
);
