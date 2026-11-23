import { defineRelations } from "drizzle-orm"
import * as s from "./schema"

export const relations = defineRelations(s, r => ({
  // Identity
  profiles: {
    registrations: r.many.registrations(),
    badges: r.many.badges({
      from: r.profiles.id.through(r.userBadges.profileId),
      to: r.badges.id.through(r.userBadges.badgeId),
    }),
    organizers: r.many.organizers(),
    staffAssignments: r.many.eventStaff(),
    updatedActivities: r.many.registrationActivities(),
  },

  badges: {
    recipients: r.many.profiles({
      from: r.badges.id.through(r.userBadges.badgeId),
      to: r.profiles.id.through(r.userBadges.profileId),
    }),
  },

  userBadges: {
    profile: r.one.profiles({
      from: r.userBadges.profileId,
      to: r.profiles.id,
    }),
    badge: r.one.badges({
      from: r.userBadges.badgeId,
      to: r.badges.id,
    }),
  },

  // Events
  events: {
    activities: r.many.activities(),
    formFields: r.many.eventFormFields(),
    registrations: r.many.registrations(),
    organizers: r.many.organizers(),
    staff: r.many.eventStaff(),
    teams: r.many.teams(),
  },

  activities: {
    event: r.one.events({
      from: r.activities.eventId,
      to: r.events.id,
    }),
    registrationActivities: r.many.registrationActivities(),
  },

  eventFormFields: {
    event: r.one.events({
      from: r.eventFormFields.eventId,
      to: r.events.id,
    }),
  },

  // Registrations
  registrations: {
    event: r.one.events({
      from: r.registrations.eventId,
      to: r.events.id,
    }),
    profile: r.one.profiles({
      from: r.registrations.profileId,
      to: r.profiles.id,
    }),
    activities: r.many.registrationActivities(),
    teamAssignment: r.one.teamRegistrations(),
  },

  registrationActivities: {
    registration: r.one.registrations({
      from: r.registrationActivities.registrationId,
      to: r.registrations.id,
    }),
    activity: r.one.activities({
      from: r.registrationActivities.activityId,
      to: r.activities.id,
    }),
    updater: r.one.profiles({
      from: r.registrationActivities.updatedBy,
      to: r.profiles.id,
    }),
  },

  // Event staff and organizers
  organizers: {
    profile: r.one.profiles({
      from: r.organizers.profileId,
      to: r.profiles.id,
    }),
    event: r.one.events({
      from: r.organizers.eventId,
      to: r.events.id,
    }),
  },

  eventStaff: {
    profile: r.one.profiles({
      from: r.eventStaff.profileId,
      to: r.profiles.id,
    }),
    event: r.one.events({
      from: r.eventStaff.eventId,
      to: r.events.id,
    }),
  },

  // Teams
  teams: {
    event: r.one.events({
      from: r.teams.eventId,
      to: r.events.id,
    }),
    registrations: r.many.teamRegistrations(),
  },

  teamRegistrations: {
    team: r.one.teams({
      from: r.teamRegistrations.teamId,
      to: r.teams.id,
    }),
    registration: r.one.registrations({
      from: r.teamRegistrations.registrationId,
      to: r.registrations.id,
    }),
  },

  // Community calendar
  communities: {
    events: r.many.calendarEvents(),
  },

  calendarEvents: {
    community: r.one.communities({
      from: r.calendarEvents.communityId,
      to: r.communities.id,
    }),
  },
}))
