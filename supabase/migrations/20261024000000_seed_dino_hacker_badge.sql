-- Seed Dino Hacker easter egg badge in public.badges
INSERT INTO "public"."badges" ("name", "image_url")
SELECT 'Dino Hacker', 'badges/dino-hacker.svg'
WHERE NOT EXISTS (
  SELECT 1 FROM "public"."badges" WHERE "name" = 'Dino Hacker'
);

-- Ensure existing records point to the Supabase storage path rather than legacy local public path
UPDATE "public"."badges"
SET "image_url" = 'badges/dino-hacker.svg'
WHERE "name" = 'Dino Hacker' AND "image_url" = '/badges/dino-hacker.svg';
