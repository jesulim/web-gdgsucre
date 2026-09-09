# AGENTS.md

## Project
GDG Events is an event management platform for GDG Sucre and allied communities.

Stack: **Astro 7 (SSR) + React 19 + Tailwind CSS 4 + Supabase + Vercel**.

* Package manager: **Bun**
* Runtime: **Node >= 24**

## Commands

```bash
bun install                    # install dependencies
bun dev                        # start development server
bun run build                  # production build and primary verification
bunx biome check --write       # lint and format
```

There is currently no automated test command. Do not claim tests passed when no test suite was run.

## Architecture

### Rendering

This is an **SSR-first** application (`output: "server"`).

* Prefer server-side rendering and server-side data access.
* Use React only when client-side interactivity is required.
* Use the narrowest appropriate `client:*` hydration directive.
* Do not move logic to the client unnecessarily.

### Data flow

Prefer this flow:

```text
Page / Form / Client
        ↓
API route or server boundary
        ↓
Zod validation
        ↓
Service
        ↓
Supabase / external service
```

Rules:

* Validate untrusted input at application boundaries.
* Keep pages and API handlers focused on orchestration.
* Put business logic and data access in the appropriate service.
* Reuse existing services instead of duplicating database queries.

### Supabase

Supabase access is centralized in:

```text
src/lib/supabase.ts
```

Services live in:

```text
src/lib/services/
```

Pages and API routes should use services rather than calling Supabase directly when an appropriate service exists. Do not expose server-only credentials or secrets to client code.

### Validation

Zod schemas live in:

```text
src/lib/validators/
```

Add or reuse schemas when validating external input, forms, or API payloads.

### Authentication and authorization

* Supabase Auth handles authentication.
* Middleware refreshes sessions and protects route access.
* Do not rely solely on client-side checks for authorization.
* Sensitive server operations must enforce their own authorization requirements.

## Code conventions

### Imports

`@/*` maps to `./src/*`.

Prefer absolute imports for non-local modules:

```ts
import { cn } from "@/lib/utils"
import { Component } from "@/components/module/Component"
```

Use relative imports only for closely related files where they improve readability.

### Formatting

Biome is the formatter and linter.

Key conventions:
* Spaces
* `lineWidth: 100`
* Double quotes
* Semicolons as needed
* ES5 trailing commas

Do not use ESLint or Prettier.

### Components

All pages should be mobile-first and responsive. Use size constraints instead of hardcoded values.

Reuse existing components and utilities before introducing new abstractions.

Avoid hard-coding tailwind values such as `h-[16px]`, when possible use canonical classes like `h-4`.

Always try to break down components into smaller, more focused pieces.

Avoid generic dumping-ground files such as `utils.ts`, `helpers.ts`, or `common.ts` when the code has a clearer domain or owner.

`src/components/ui/**` contains shadcn-generated components and is excluded from Biome.
* Prefer composing or wrapping these components.
* Avoid modifying them unless the task requires changing the primitive itself.


## Database changes

Supabase migrations live in:

```text
supabase/migrations/
```

Rules:

* Create a new timestamped migration for schema changes.
* Do not modify an existing migration that may already have been applied.
* Do not change RLS policies or authorization behavior unless required by the task.
* Do not implement schema changes implicitly in application code.

For remote migrations:

```bash
supabase db push
```

## Edge Functions

Supabase Edge Functions live in:

```text
supabase/functions/
```

They are Deno-based and each function may have its own `deno.json` import map.

Current functions:

* `generate-qr` and `batch-generate-qr` Generate QR codes for event accreditation.
* `send-email` General purpose email sender.

Preserve each function's runtime and import conventions when modifying it.

## Dependencies

Before adding a dependency:

1. Check whether the existing stack already solves the problem reasonably.
2. Prefer existing project dependencies and patterns.
3. Avoid introducing dependencies for small utilities or trivial abstractions.

Do not add dependencies as incidental refactors.

## Verification

Before considering a change complete:

1. Run Biome:

```bash
bunx biome check --write
```

2. Run a production build when the change affects application behavior, configuration, types, routes, components, or server code:

```bash
bun run build
```

If verification cannot be run, clearly state what was not run and why.

Do not fix unrelated failures unless they are required for the requested change.

## Change boundaries

* Prefer the smallest change that solves the requested problem.
* Prefer the simplest approach. Don't overcomplicate implementations. Don't optimize prematurely.
* Preserve existing architectural patterns unless the task explicitly involves changing them.
* Do not change authentication, authorization, environment variables, deployment configuration, or database behavior as an incidental side effect.
* Do not refactor unrelated code opportunistically.

## Gotchas

* `.env` contains secrets and must never be committed.
* Never log credentials, tokens, or other secrets.
* Refuse to use npm.
* Biome auto-fixes on commit via lint-staged and Husky. Do not manually undo formatter changes.
* Biome ignores `.svg` and `**/templates/*.html`.
* `dist/` is build output. Never edit it manually.
* `security.checkOrigin: false` is intentional. Do not enable it as an incidental security change because it breaks the current local development workflow.

## When in doubt

Before creating a new abstraction, dependency, service, or architectural pattern:

1. Search for an existing equivalent in the repository.
2. Follow the closest established pattern.
3. Prefer a small, local change over a broad refactor.
4. Ask for clarifications, don't assume.
