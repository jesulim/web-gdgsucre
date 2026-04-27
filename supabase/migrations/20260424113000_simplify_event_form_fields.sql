ALTER TABLE public.event_form_fields
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS label text,
  ADD COLUMN IF NOT EXISTS type text,
  ADD COLUMN IF NOT EXISTS required boolean DEFAULT true;

-- Migrate data from form_fields to event_form_fields
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
    AND table_name = 'form_fields'
  ) THEN
    UPDATE "public"."event_form_fields" eff
    SET
        "name"     = ff."name",
        "label"    = ff."label",
        "type"     = ff."type",
        "required" = ff."required"
    FROM "public"."form_fields" ff
    WHERE eff."form_field_id" = ff."id";
  END IF;
END $$;

UPDATE public.event_form_fields
SET required = true
WHERE required IS NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM public.event_form_fields
    WHERE name IS NULL
       OR label IS NULL
       OR type IS NULL
       OR required IS NULL
  ) THEN
    RAISE EXCEPTION 'event_form_fields metadata backfill incomplete; name, label, type, and required must be populated before dropping form_field_id';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.event_form_fields
    WHERE type NOT IN ('text', 'select', 'file')
  ) THEN
    RAISE EXCEPTION 'event_form_fields contains unsupported type values; allowed values are text, select, file';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.event_form_fields
    WHERE options IS NOT NULL
      AND (
        type <> 'select'
        OR jsonb_typeof(options) <> 'array'
      )
  ) THEN
    RAISE EXCEPTION 'event_form_fields.options must be null unless type = select, and when present it must be a JSON array';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.event_form_fields
    GROUP BY event_id, name
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'event_form_fields contains duplicate (event_id, name) values';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM public.event_form_fields
    GROUP BY event_id, "order"
    HAVING COUNT(*) > 1
  ) THEN
    RAISE EXCEPTION 'event_form_fields contains duplicate (event_id, order) values';
  END IF;
END $$;

ALTER TABLE public.event_form_fields
    ALTER COLUMN name SET NOT NULL,
    ALTER COLUMN label SET NOT NULL,
    ALTER COLUMN type SET NOT NULL,
    ALTER COLUMN required SET NOT NULL;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'event_form_fields_type_check'
      AND conrelid = 'public.event_form_fields'::regclass
  ) THEN
    ALTER TABLE public.event_form_fields
      DROP CONSTRAINT event_form_fields_type_check;
  END IF;

  ALTER TABLE public.event_form_fields
    ADD CONSTRAINT event_form_fields_type_check
    CHECK (type IN ('text', 'select', 'file'));
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'event_form_fields_options_for_select_check'
      AND conrelid = 'public.event_form_fields'::regclass
  ) THEN
    ALTER TABLE public.event_form_fields
      DROP CONSTRAINT event_form_fields_options_for_select_check;
  END IF;

  ALTER TABLE public.event_form_fields
    ADD CONSTRAINT event_form_fields_options_for_select_check
    CHECK (
      options IS NULL
      OR (
        type = 'select'
        AND jsonb_typeof(options) = 'array'
      )
    );
END $$;

CREATE INDEX IF NOT EXISTS idx_event_form_fields_event_id
  ON public.event_form_fields (event_id);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'event_form_fields_event_id_name_key'
      AND conrelid = 'public.event_form_fields'::regclass
  ) THEN
    ALTER TABLE public.event_form_fields
      ADD CONSTRAINT event_form_fields_event_id_name_key
      UNIQUE (event_id, name);
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'event_form_fields_event_id_order_key'
      AND conrelid = 'public.event_form_fields'::regclass
  ) THEN
    ALTER TABLE public.event_form_fields
      ADD CONSTRAINT event_form_fields_event_id_order_key
      UNIQUE (event_id, "order");
  END IF;
END $$;

DO $$
DECLARE
  dependency record;
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'event_form_fields'
      AND column_name = 'form_field_id'
  ) THEN
    FOR dependency IN
      SELECT con.conname AS dependency_name
      FROM pg_constraint AS con
      JOIN pg_attribute AS att
        ON att.attrelid = con.conrelid
       AND att.attnum = ANY (con.conkey)
      WHERE con.conrelid = 'public.event_form_fields'::regclass
        AND con.contype = 'f'
        AND att.attname = 'form_field_id'
    LOOP
      EXECUTE format(
        'ALTER TABLE public.event_form_fields DROP CONSTRAINT %I',
        dependency.dependency_name
      );
    END LOOP;

    FOR dependency IN
      SELECT indexname AS dependency_name
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'event_form_fields'
        AND indexdef ILIKE '%(form_field_id%'
    LOOP
      EXECUTE format('DROP INDEX IF EXISTS public.%I', dependency.dependency_name);
    END LOOP;

    ALTER TABLE public.event_form_fields
      DROP COLUMN form_field_id;
  END IF;
END $$;

DROP TABLE IF EXISTS public.form_fields;
