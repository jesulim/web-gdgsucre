ALTER TABLE "public"."calendar_events" ALTER COLUMN "start_datetime" DROP NOT NULL;
ALTER TABLE "public"."calendar_events" ALTER COLUMN "end_datetime" DROP NOT NULL;
