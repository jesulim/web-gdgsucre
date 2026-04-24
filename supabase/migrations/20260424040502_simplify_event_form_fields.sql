ALTER TABLE "public"."event_form_fields"
    ADD COLUMN "name" "text",
    ADD COLUMN "label" "text",
    ADD COLUMN "type" "text",
    ADD COLUMN "required" boolean DEFAULT true;

-- Migrate data from form_fields to event_form_fields
UPDATE "public"."event_form_fields" eff
SET
    "name"     = ff."name",
    "label"    = ff."label",
    "type"     = ff."type",
    "required" = ff."required"
FROM "public"."form_fields" ff
WHERE eff."form_field_id" = ff."id";

ALTER TABLE "public"."event_form_fields"
    ALTER COLUMN "name"     SET NOT NULL,
    ALTER COLUMN "label"    SET NOT NULL,
    ALTER COLUMN "type"     SET NOT NULL,
    ALTER COLUMN "required" SET NOT NULL,
    DROP COLUMN "form_field_id";

DROP TABLE "public"."form_fields";
