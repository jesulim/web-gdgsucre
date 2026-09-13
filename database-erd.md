# Database ERD - GDG Sucre Events Platform

```mermaid
erDiagram
    %% Auth Users (external)
    auth_users {
        uuid id
    }

    %% Profiles
    profiles {
        uuid id PK
        timestamp with time zone created_at
        timestamp without time zone updated_at
        text first_name
        text last_name
        text occupation
        text phone_number
        text email
        text avatar_url
        boolean is_admin
        boolean share_data
        text display_name
    }

    %% Events
    events {
        bigint id PK
        timestamp with time zone created_at
        timestamp with time zone updated_at
        text name
        date date
        text image_url
        text slug
        boolean registration_open
    }

    %% Activities
    activities {
        bigint id PK
        timestamp with time zone created_at
        timestamp with time zone updated_at
        bigint event_id FK
        text name
        text label
    }

    %% Form Fields
    form_fields {
        bigint id PK
        timestamp with time zone created_at
        timestamp with time zone updated_at
        varchar name
        varchar label
        varchar type
        boolean required
    }

    %% Event Form Fields
    event_form_fields {
        bigint id PK
        timestamp with time zone created_at
        timestamp with time zone updated_at
        bigint event_id FK
        bigint form_field_id FK
        smallint "order"
        jsonb options
        text image_url
    }

    %% Badges
    badges {
        bigint id PK
        timestamp with time zone created_at
        timestamp with time zone updated_at
        text name
        text image_url
        text description
    }

    %% Registrations
    registrations {
        bigint id PK
        timestamp with time zone created_at
        timestamp with time zone updated_at
        bigint event_id FK
        text role
        uuid user_id FK
        jsonb responses
        text status
        text token
        text qr_url
    }

    %% Registration Activities
    registration_activities {
        bigint registration_id FK
        bigint activity_id FK
        timestamp with time zone created_at
        timestamp with time zone updated_at
        uuid updated_by
        boolean completed
    }

    %% User Badges
    user_badges {
        bigint id PK
        timestamp with time zone issued_at
        bigint badge_id FK
        uuid user_id FK
    }

    %% Organizers
    organizers {
        bigint id PK
        timestamp with time zone created_at
        timestamp with time zone updated_at
        uuid profile_id FK
        bigint event_id FK
        text areas
    }

    %% Teams
    teams {
        bigint id PK
        timestamp with time zone created_at
        timestamp with time zone updated_at
        bigint event_id FK
        text name
        text code
    }

    %% Team Registrations
    team_registrations {
        bigint id PK
        timestamp with time zone created_at
        timestamp with time zone updated_at
        bigint team_id FK
        bigint registration_id FK
        boolean leader
    }

    %% Event Staff
    event_staff {
        bigint id PK
        timestamp with time zone created_at
        timestamp with time zone updated_at
        uuid user_id FK
        bigint event_id FK
        text role
    }

    %% Relationships
    auth_users ||--o| profiles : "references"

    profiles ||--o| organizers : "profile_id"
    profiles ||--o| user_badges : "user_id"

    events ||--o{ activities : "has"
    events ||--o{ event_form_fields : "has"
    events ||--o{ registrations : "has"
    events ||--o{ organizers : "has"
    events ||--o{ teams : "has"
    events ||--o{ event_staff : "has"

    form_fields ||--o{ event_form_fields : "defines"

    badges ||--o{ user_badges : "issues"

    registrations ||--o{ registration_activities : "tracks"
    registrations ||--o{ team_registrations : "member_of"

    activities ||--o{ registration_activities : "tracks"

    teams ||--o{ team_registrations : "has"

    event_staff }o--|| auth_users : "user"
    event_staff }o--|| events : "event"
```

## Table Summary

| Table | Primary Key | Foreign Keys |
|-------|-------------|---------------|
| profiles | id (uuid) | auth.users — added share_data, display_name |
| events | id (bigint) | - |
| activities | id (bigint) | events |
| form_fields | id (bigint) | - |
| event_form_fields | id (bigint) | events, form_fields |
| badges | id (bigint) | - |
| registrations | id (bigint) | events, profiles |
| registration_activities | (registration_id, activity_id) | registrations, activities |
| user_badges | id (bigint) | badges, profiles |
| organizers | id (bigint) | profiles, events |
| teams | id (bigint) | events |
| team_registrations | id (bigint) | teams, registrations |
| event_staff | id (bigint) | auth.users, events |

## Key Relationships

1. **One-to-Many**: Events → Activities, Registrations, Teams, Organizers, Event Staff
2. **Many-to-Many**: Registrations ↔ Activities (via registration_activities), Teams ↔ Registrations (via team_registrations)
3. **One-to-One**: Profiles ↔ Auth Users, Registrations ↔ Profiles