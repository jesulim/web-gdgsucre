# Architecture Review — Deepening Opportunities

Tracked per the [improve-codebase-architecture](../.agents/skills/improve-codebase-architecture/SKILL.md) process.

## Candidates

| # | Title | Status |
|---|-------|--------|
| 1 | Auth client module — dual supabase client strategies | proposed |
| 2 | Email side-effect module — synchronous SMTP in request path | proposed |
| 3 | Event landing page component duplication | **exploring** |
| 4 | API route handler boilerplate extraction | proposed |
| 5 | Registration orchestration module — distributed multi-step flow | proposed |

## Candidate 1 — Auth client module

**Files**: `src/lib/supabase.ts`, `src/middleware.ts`, `src/pages/api/auth/*.ts`, `src/lib/utils.ts`

**Problem**: Two parallel client creation strategies (`createSupabaseServerClient` via `@supabase/ssr` vs `createUserClient` via manual bearer token from cookies). Caller must know which to use.

**Solution sketch**: Merge behind a single `createAuthenticatedClient(context)`.

---

## Candidate 2 — Email side-effect module

**Files**: `src/lib/services/emailService.ts`, `src/pages/api/register.ts`, `src/pages/api/teams/create.ts`, `src/pages/api/sendPaymentConfirmation.ts`

**Problem**: Email blocks HTTP response, reads templates from disk, singleton transporter goes stale in serverless.

**Solution sketch**: Background/queued side-effect. Interface becomes "schedule email," not "send email now."

---

## Candidate 3 — Event landing page duplication *(exploring)*

**Files**: `src/components/events/{bwai-26,devfest-25,io-extended-25,iwd-26}/*`

**Problem**: 4 per-event subdirectories with near-duplicated components (Timer, Footer, Sponsors, Speakers, etc.). Each event's Timer is ~125 lines — ~50 lines of identical logic (`zeroPad`, `usePrevious`, `AnimatedValue`), ~75 lines of brand-specific styling.

**Constraint**: Each event has its own brand guide — a one-config-fits-all component won't work.

**Alternatives under discussion**:
- Extract mechanically-identical behavior to shared primitives; leave visual assembly per-event
- Headless / render-prop pattern that handles animation/state, events own the visual shell
- CSS-variable-driven theming per event

---

## Candidate 4 — API route handler boilerplate

**Files**: All 22 routes under `src/pages/api/**/*.ts`

**Problem**: Every route repeats `createUserClient(cookies)`, try/catch, `new Response(JSON.stringify(...))`. ~30% of every route is reusable scaffolding.

**Solution sketch**: `defineApiHandler` wrapper.

---

## Candidate 5 — Registration orchestration module

**Files**: `src/pages/api/register.ts`, `src/pages/api/teams/create.ts`, `src/pages/api/teams/join.ts`, `src/lib/services/{registration,team,profile}Service.ts`

**Problem**: Registration is a distributed state machine across 4+ endpoints. `teamService.joinTeam` destructively deletes registration on failure — side-effects applied piecemeal.

**Solution sketch**: Single `registerForEvent(type, data)` module with transactional guarantees.
