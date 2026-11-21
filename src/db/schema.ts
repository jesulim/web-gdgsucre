import { sql } from "drizzle-orm"
import {
  bigint,
  bigserial,
  boolean,
  check,
  date,
  jsonb,
  primaryKey,
  smallint,
  snakeCase,
  text,
  timestamp,
  unique,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core"

const timestamps = () => ({
  createdAt: timestamp({
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),

  updatedAt: timestamp({
    withTimezone: true,
    mode: "string",
  })
    .defaultNow()
    .notNull(),
})

export const badges = snakeCase.table("badges", {
  id: bigserial({ mode: "number" }).primaryKey(),
  ...timestamps(),
  name: text().notNull().unique(),
  imageUrl: text().notNull(),
})

export const profiles = snakeCase.table("profiles", {
  id: uuid().primaryKey(),
  ...timestamps(),
  firstName: text().notNull(),
  lastName: text().notNull(),
  email: text(),
  occupation: text(),
  phoneNumber: text(),
  avatarUrl: text(),
  displayName: text(),
  shareData: boolean().default(false).notNull(),
  isAdmin: boolean().default(false).notNull(),
})

export const userBadges = snakeCase.table(
  "user_badges",
  {
    profileId: uuid()
      .notNull()
      .references(() => profiles.id),
    badgeId: bigint({ mode: "number" })
      .notNull()
      .references(() => badges.id),
    issuedAt: timestamp({ withTimezone: true, mode: "string" }).defaultNow().notNull(),
  },
  table => [primaryKey({ columns: [table.profileId, table.badgeId] })]
)

export const events = snakeCase.table(
  "events",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    ...timestamps(),
    name: text().notNull(),
    date: date(),
    slug: text(),
    registrationOpen: boolean().default(true).notNull(),
  },
  table => [uniqueIndex("idx_events_slug").on(table.slug)]
)

export const activities = snakeCase.table(
  "activities",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    ...timestamps(),
    eventId: bigint({ mode: "number" })
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    name: text().notNull(),
    label: text(),
  },
  table => [unique("unique_activities_name_event").on(table.name, table.eventId)]
)

export const registrationActivities = snakeCase.table(
  "registration_activities",
  {
    ...timestamps(),
    updatedBy: uuid()
      .notNull()
      .references(() => profiles.id),
    registrationId: bigint({ mode: "number" })
      .notNull()
      .references(() => registrations.id, { onDelete: "cascade" }),
    activityId: bigint({ mode: "number" })
      .notNull()
      .references(() => activities.id, { onDelete: "cascade" }),
    completed: boolean().default(false),
  },
  table => [
    primaryKey({
      columns: [table.registrationId, table.activityId],
      name: "registration_activities_pkey",
    }),
  ]
)

export const eventFormFields = snakeCase.table(
  "event_form_fields",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    ...timestamps(),
    eventId: bigint({ mode: "number" })
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    order: smallint().notNull(),
    options: jsonb(),
    imageUrl: text(),
    name: text().notNull(),
    label: text().notNull(),
    type: text().notNull(),
    required: boolean().default(true).notNull(),
    exemptOption: text(),
  },
  table => [
    unique("unique_event_form_fields_name_event").on(table.name, table.eventId),
    unique("unique_event_form_fields_order_event").on(table.order, table.eventId),
    check(
      "check_event_form_fields_type",
      sql`type = ANY (ARRAY['text'::text, 'select'::text, 'file'::text])`
    ),
    check(
      "check_event_form_fields_options_for_select",
      sql`(options IS NULL) OR ((type = 'select'::text) AND (jsonb_typeof(options) = 'array'::text))`
    ),
  ]
)

export const registrations = snakeCase.table(
  "registrations",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    ...timestamps(),
    eventId: bigint({ mode: "number" })
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }),
    profileId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    responses: jsonb(),
    status: text().default("pending").notNull(),
    token: text(),
    qrUrl: text(),
  },
  table => [
    unique("unique_registrations_token_event").on(table.token, table.eventId),
    unique("unique_registrations_user_event").on(table.profileId, table.eventId),
    check("check_registrations_status", sql`${table.status} IN ('pending', 'confirmed')`),
  ]
)

export const organizers = snakeCase.table(
  "organizers",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    ...timestamps(),
    profileId: uuid()
      .notNull()
      .references(() => profiles.id, { onDelete: "cascade" }),
    eventId: bigint({ mode: "number" })
      .notNull()
      .references(() => events.id, { onDelete: "cascade" }),
    areas: text(),
  },
  table => [unique("unique_organizers_profile_event").on(table.profileId, table.eventId)]
)

export const eventStaff = snakeCase.table(
  "event_staff",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    ...timestamps(),
    profileId: uuid()
      .notNull()
      .references(() => profiles.id),
    eventId: bigint({ mode: "number" })
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }),
    role: text(),
  },
  table => [unique("unique_event_staff_profile_event").on(table.profileId, table.eventId)]
)

export const teams = snakeCase.table(
  "teams",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    ...timestamps(),
    eventId: bigint({ mode: "number" })
      .notNull()
      .references(() => events.id, { onDelete: "restrict" }),
    name: text().notNull(),
    code: text().notNull(),
  },
  table => [unique("unique_teams_event_code").on(table.eventId, table.code)]
)

export const teamRegistrations = snakeCase.table(
  "team_registrations",
  {
    ...timestamps(),
    teamId: bigint({ mode: "number" })
      .notNull()
      .references(() => teams.id),
    registrationId: bigint({ mode: "number" })
      .notNull()
      .references(() => registrations.id, { onDelete: "cascade" })
      .unique(),
    leader: boolean().default(false).notNull(),
  },
  table => [
    primaryKey({ columns: [table.teamId, table.registrationId] }),
    uniqueIndex("idx_team_registrations_one_leader_per_team")
      .on(table.teamId)
      .where(sql`${table.leader} = true`),
  ]
)

export const communities = snakeCase.table("communities", {
  id: bigserial({ mode: "number" }).primaryKey(),
  ...timestamps(),
  name: text().notNull(),
  shortName: text(),
  website: text(),
  contactEmail: text().notNull(),
  image: text(),
  accepted: boolean().default(false).notNull(),
  color: text(),
})

export const calendarEvents = snakeCase.table(
  "calendar_events",
  {
    id: bigserial({ mode: "number" }).primaryKey(),
    ...timestamps(),
    name: text().notNull(),
    communityId: bigint({ mode: "number" })
      .notNull()
      .references(() => communities.id, { onDelete: "cascade" }),
    startDatetime: timestamp({ withTimezone: true, mode: "string" }),
    endDatetime: timestamp({ withTimezone: true, mode: "string" }),
    format: text(),
    registrationLink: text(),
    location: text(),
    accepted: boolean().default(false).notNull(),
  },
  table => [
    check(
      "check_calendar_events_dates",
      sql`${table.endDatetime} IS NULL OR
      ${table.startDatetime} IS NULL OR
      ${table.endDatetime} >= ${table.startDatetime}`
    ),
  ]
)
