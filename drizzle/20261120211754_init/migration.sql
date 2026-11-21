CREATE TABLE "activities" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" bigint NOT NULL,
	"name" text NOT NULL,
	"label" text,
	CONSTRAINT "unique_activities_name_event" UNIQUE("name","event_id")
);
--> statement-breakpoint
CREATE TABLE "badges" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL UNIQUE,
	"image_url" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "calendar_events" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"community_id" bigint NOT NULL,
	"start_datetime" timestamp with time zone,
	"end_datetime" timestamp with time zone,
	"format" text,
	"registration_link" text,
	"location" text,
	"accepted" boolean DEFAULT false NOT NULL,
	CONSTRAINT "check_calendar_events_dates" CHECK ("end_datetime" IS NULL OR
      "start_datetime" IS NULL OR
      "end_datetime" >= "start_datetime")
);
--> statement-breakpoint
CREATE TABLE "communities" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"short_name" text,
	"website" text,
	"contact_email" text NOT NULL,
	"image" text,
	"accepted" boolean DEFAULT false NOT NULL,
	"color" text
);
--> statement-breakpoint
CREATE TABLE "event_form_fields" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" bigint NOT NULL,
	"order" smallint NOT NULL,
	"options" jsonb,
	"image_url" text,
	"name" text NOT NULL,
	"label" text NOT NULL,
	"type" text NOT NULL,
	"required" boolean DEFAULT true NOT NULL,
	"exempt_option" text,
	CONSTRAINT "unique_event_form_fields_name_event" UNIQUE("name","event_id"),
	CONSTRAINT "unique_event_form_fields_order_event" UNIQUE("order","event_id"),
	CONSTRAINT "check_event_form_fields_type" CHECK (type = ANY (ARRAY['text'::text, 'select'::text, 'file'::text])),
	CONSTRAINT "check_event_form_fields_options_for_select" CHECK ((options IS NULL) OR ((type = 'select'::text) AND (jsonb_typeof(options) = 'array'::text)))
);
--> statement-breakpoint
CREATE TABLE "event_staff" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"profile_id" uuid NOT NULL,
	"event_id" bigint NOT NULL,
	"role" text,
	CONSTRAINT "unique_event_staff_profile_event" UNIQUE("profile_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"name" text NOT NULL,
	"date" date,
	"slug" text,
	"registration_open" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizers" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"profile_id" uuid NOT NULL,
	"event_id" bigint NOT NULL,
	"areas" text,
	CONSTRAINT "unique_organizers_profile_event" UNIQUE("profile_id","event_id")
);
--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"occupation" text,
	"phone_number" text,
	"avatar_url" text,
	"display_name" text,
	"share_data" boolean DEFAULT false NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "registration_activities" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_by" uuid NOT NULL,
	"registration_id" bigint,
	"activity_id" bigint,
	"completed" boolean DEFAULT false,
	CONSTRAINT "registration_activities_pkey" PRIMARY KEY("registration_id","activity_id")
);
--> statement-breakpoint
CREATE TABLE "registrations" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" bigint NOT NULL,
	"profile_id" uuid NOT NULL,
	"responses" jsonb,
	"status" text DEFAULT 'pending' NOT NULL,
	"token" text,
	"qr_url" text,
	CONSTRAINT "unique_registrations_token_event" UNIQUE("token","event_id"),
	CONSTRAINT "unique_registrations_user_event" UNIQUE("profile_id","event_id"),
	CONSTRAINT "check_registrations_status" CHECK ("status" IN ('pending', 'confirmed'))
);
--> statement-breakpoint
CREATE TABLE "team_registrations" (
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"team_id" bigint,
	"registration_id" bigint UNIQUE,
	"leader" boolean DEFAULT false NOT NULL,
	CONSTRAINT "team_registrations_pkey" PRIMARY KEY("team_id","registration_id")
);
--> statement-breakpoint
CREATE TABLE "teams" (
	"id" bigserial PRIMARY KEY,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"event_id" bigint NOT NULL,
	"name" text NOT NULL,
	"code" text NOT NULL,
	CONSTRAINT "unique_teams_event_code" UNIQUE("event_id","code")
);
--> statement-breakpoint
CREATE TABLE "user_badges" (
	"profile_id" uuid,
	"badge_id" bigint,
	"issued_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_badges_pkey" PRIMARY KEY("profile_id","badge_id")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_events_slug" ON "events" ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_team_registrations_one_leader_per_team" ON "team_registrations" ("team_id") WHERE "leader" = true;--> statement-breakpoint
ALTER TABLE "activities" ADD CONSTRAINT "activities_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "calendar_events" ADD CONSTRAINT "calendar_events_community_id_communities_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_form_fields" ADD CONSTRAINT "event_form_fields_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "event_staff" ADD CONSTRAINT "event_staff_profile_id_profiles_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id");--> statement-breakpoint
ALTER TABLE "event_staff" ADD CONSTRAINT "event_staff_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "organizers" ADD CONSTRAINT "organizers_profile_id_profiles_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "organizers" ADD CONSTRAINT "organizers_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "registration_activities" ADD CONSTRAINT "registration_activities_updated_by_profiles_id_fkey" FOREIGN KEY ("updated_by") REFERENCES "profiles"("id");--> statement-breakpoint
ALTER TABLE "registration_activities" ADD CONSTRAINT "registration_activities_registration_id_registrations_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "registration_activities" ADD CONSTRAINT "registration_activities_activity_id_activities_id_fkey" FOREIGN KEY ("activity_id") REFERENCES "activities"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "registrations" ADD CONSTRAINT "registrations_profile_id_profiles_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "team_registrations" ADD CONSTRAINT "team_registrations_team_id_teams_id_fkey" FOREIGN KEY ("team_id") REFERENCES "teams"("id");--> statement-breakpoint
ALTER TABLE "team_registrations" ADD CONSTRAINT "team_registrations_registration_id_registrations_id_fkey" FOREIGN KEY ("registration_id") REFERENCES "registrations"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "teams" ADD CONSTRAINT "teams_event_id_events_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE RESTRICT;--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_profile_id_profiles_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id");--> statement-breakpoint
ALTER TABLE "user_badges" ADD CONSTRAINT "user_badges_badge_id_badges_id_fkey" FOREIGN KEY ("badge_id") REFERENCES "badges"("id");