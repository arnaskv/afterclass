# Roadmap

> "Afterclass" is an internal codename. The brand name is chosen in Milestone 1 (candidates: [naming.md](naming.md)).

## Context
Afterclass (codename) is a SaaS tool for **activity providers**: clubs, studios, coaches and schools that run hobby and after-class groups for children and teenagers. Parents and kids use a portal. Adults are a later segment.

The project has two goals:
1. Learning: .NET 10, Aspire, RabbitMQ, .NET Worker services, React 19, system design, and UI/UX with motion.
2. A product that could earn some money: providers pay per organization.

The two uploaded documents (AGENTS.md and STACK-AND-STRUCTURE.md) are the binding blueprint. Names: `Project` → `Afterclass`, ticket prefix `AFC`, CSS token namespace `--ac-*`, npm package `afterclass-web`, OpenAPI snapshot `openapi/afterclass-api.json`.

Decisions so far: provider-first B2B, the Lithuanian market first (LT is the default locale, with EN prepared through i18next), Keycloak inside Aspire for OIDC, and a new GitHub repo named `afterclass`.

Each milestone below teaches something new and ships one end-to-end vertical slice. Infrastructure is added only when a feature needs it, as AGENTS.md requires. For example, RabbitMQ comes in when notifications need it, not on day one.

---

## Domain model (first version)
- **Organization** (the tenant) and **Membership**: a user's role in an org. Roles are Owner, Admin and Coach.
- **Activity**: for example "Robotics" or "Ballet". It has a category, a description and an image.
- **Group**: one class within an activity. It has a season (term), an age range, a capacity, a price, a coach and a location.
- **Schedule rule**: a recurring weekly slot. Sessions are generated from it.
- **Session**: one concrete occurrence. It can be cancelled or rescheduled.
- **Participant** (the child) and **Guardian** (the parent account), linked many-to-many.
- **Enrollment**: a state machine `Requested → Waitlisted | Active → Paused | Cancelled`. Explicit command endpoints change its state.
- **Attendance**: one row per session and participant (Present, Absent, Excused).
- Later: Invoice/Payment, Announcement, Notification.

Tenant isolation: every tenant-scoped table has `OrganizationId`. A global EF query filter applies a tenant context resolved from a verified membership. Unique constraints and cache keys are scoped to the tenant.

---

## Milestone 0 — Repo and walking skeleton
*Learning focus: Aspire, solution layout, OIDC with cookies, CI.*

1. Repository `arnaskv/afterclass`.
2. Scaffold to the blueprint:
   - `Afterclass.slnx`, `global.json` (.NET 10 SDK), `.editorconfig`, `AGENTS.md` (filled in), and `docs/stack-and-structure.md`.
   - `src/Afterclass.AppHost`, `Afterclass.ServiceDefaults`, `Afterclass.Api`, `Afterclass.Persistence`, `Afterclass.MigrationService` and `Afterclass.Web` (Vite 8, React 19, TS 6, Tailwind 4, TanStack Router/Query, React Compiler).
   - `tests/Afterclass.Api.UnitTests` and `tests/Afterclass.Api.IntegrationTests` (xUnit, Testcontainers PostgreSQL).
3. AppHost resources:
   - PostgreSQL with pgAdmin.
   - Keycloak with an imported realm JSON. The realm includes a `afterclass-web` client set up for confidential code flow with PKCE, plus seed users.
   - The migration service. The Api waits for it to finish.
   - The Vite app.
4. Authentication: the API acts as a backend-for-frontend.
   - OIDC sign-in uses `AddOpenIdConnect` and stores the session in a cookie.
   - `/api/auth/me` returns the current user, `/api/auth/login` starts sign-in, `/api/auth/logout` ends it.
   - Mutations are protected with antiforgery.
   - Unauthenticated API calls get a 401, never an HTML redirect.
5. Contract pipeline: an OpenAPI export test writes the snapshot, Orval generates the client from it, and the shared `fetcher.ts` mutator handles requests.
6. Tooling: ESLint, Prettier and Vitest with MSW, Playwright, and the `check` scripts from the blueprint.
7. CI: GitHub Actions runs backend restore, build and test (Docker is available on GitHub runners), frontend `check`, and Playwright with mocks.
8. The first journey to prove: sign in → see an "empty dashboard" page that is protected → sign out.

## Milestone 1 — Design foundation with Claude Design
*Learning focus: UI/UX, design tokens, motion principles.*

1. **Brand naming session first.** Start from the brainstorm list in [naming.md](naming.md). Pick the name together with the mascot, logo and tone of voice, aimed at kids and parents, with a playful Lithuanian feel.
2. Use the design artifact type to create the **design system**:
   - Brand personality: playful but trustworthy. Parents pay and providers run a business.
   - Color, type scale, radii, shadows and spacing.
   - Light and dark themes.
   - A motion spec: durations, easings, and a reduced-motion fallback.
3. Design the key screens as mockups:
   - Provider dashboard (today's sessions, enrollment requests).
   - Group detail with a roster.
   - Weekly calendar.
   - Coach attendance view on mobile.
   - Parent portal home.
   - Public group catalog page.
4. Turn the design into code:
   - Tokens go into `src/styles/theme.css`: fixed values in `@theme`, semantic values as `--ac-*` in `:root` exposed through `@theme inline`.
   - Shared primitives use CVA: Button, Input, Card, Badge, Dialog (Radix), EmptyState, Skeleton.
   - The app shell has a sidebar layout.
5. Motion: use the `motion` library (Framer Motion) only where it helps the user understand what happened. Examples are list reorder and enroll/waitlist transitions, the shared-layout card to detail transition, and the attendance tap feedback. Global CSS keyframes cover skeletons, and `prefers-reduced-motion` is respected everywhere.

## Milestone 2 — Organizations, activities and groups
*Learning focus: multi-tenancy, vertical slices, REST and DTOs, forms.*
- Onboarding: create an organization, which makes you its Owner, then invite staff. Invitations are stored now and emailed later in M5.
- CRUD for activities and groups using TanStack Table, React Hook Form with Zod, and Problem Details validation.
- A tenant switcher. The server checks membership, and tenant-scoped query keys include the active tenant ID.
- Tests: tenant isolation, authorization policies, validation, and an OpenAPI drift check.

## Milestone 3 — Scheduling and sessions
*Learning focus: domain logic, time zones (NodaTime or DateOnly/TimeOnly with org time zone), calendar UX.*
- Recurring rules generate sessions for each season. Holidays and exceptions are supported, and cancelling a session is a command.
- Week and day calendar views, with filters stored in the URL search params.

## Milestone 4 — Participants and enrollment
*Learning focus: state machines, concurrency.*
- Guardians invited by email and their children.
- Enrollment commands: request, approve, waitlist, cancel.
- Group capacity is enforced so that two people can't take the last spot at once. This uses a row lock or a concurrency token, and has a race test.
- Automatic promotion from the waitlist when a spot opens.

## Milestone 5 — Worker, RabbitMQ and notifications
*Learning focus: RabbitMQ, transactional outbox and inbox, .NET Worker services.*
This milestone has a real need behind it: emails for invitations, enrollment changes, waitlist promotion and session reminders.
- Add `Afterclass.Messaging`, `Afterclass.Worker` and RabbitMQ as an Aspire resource. Mailpit catches email locally.
- The outbox table is written in the same transaction as the business change. A publisher with publisher confirms sends it to RabbitMQ.
- The consumer acknowledges a message only after its database commit. It deduplicates with an inbox table, retries a bounded number of times, and sends failures to a dead-letter queue. Messages are versioned contracts that carry IDs, not data.
- First build it by hand with `RabbitMQ.Client` so you see every mechanic. Optionally compare with MassTransit or Wolverine afterwards.
- A scheduled job in the Worker sends session reminders 24 hours ahead.

## Milestone 6 — Attendance and the coach mobile experience
- A one-tap attendance list built mobile-first, with optimistic updates and motion feedback.
- Attendance statistics for each group and participant.

## Milestone 7 — Parent portal and public catalog (monetization groundwork)
- Parents see their children's schedules, cancellations and attendance, and can request enrollment.
- A public, shareable catalog page for each organization. This is how providers attract families.
- Monthly invoices are generated by the Worker. Online payments come later.
- Lithuanian specifics:
  - Support for the **NVŠ krepšelis** (the state-funded voucher for children's non-formal education). Providers must track eligible children and attendance and report them to the municipality, which is a strong selling point.
  - Paysera or Montonio for payments, instead of only Stripe.
  - GDPR handling for children's data, including guardian consent.
- Pricing idea: a free tier with 1 group and up to 15 kids, then a paid plan per organization.

## Later options (only when needed)
SignalR for live dashboard updates, Elasticsearch for catalog search, object storage (MinIO/S3) for activity images and documents, i18n (LT/EN) with i18next from day one but only one locale to start, and Stripe.
