# Agent rules: Afterclass

Afterclass is a hobby and after-class activity management app for providers (clubs, studios, coaches) and families, Lithuania first. Derived from the reusable .NET + React blueprint in `docs/stack-and-structure.md`; the roadmap is in `docs/roadmap.md`.

## Project specifics

- "Afterclass" is an internal codename for the repository, solution, namespaces and packages. The user-facing brand is not chosen yet: keep brand text in i18n strings (`app.name`), the logo and `<title>` only.
- Ticket prefix `AFC`; CSS token namespace `--ac-*`; npm package `afterclass-web`; OpenAPI snapshot `openapi/afterclass-api.json`.
- Lithuanian (`lt`) is the default locale; keep `en` translations complete. Never hard-code user-visible strings.
- Tests use Microsoft.Testing.Platform (configured in `global.json`): `dotnet test --solution Afterclass.slnx`, filter with `--filter-class`, `--filter-not-class`, `--filter-method`.
- The local dev Keycloak realm (`src/Afterclass.AppHost/Realms`) and its seed users are development-only. Never reuse them elsewhere.

When working in an existing project, inspect its manifests, configuration, and applicable agent rules first. Preserve its established versions and conventions unless a migration is requested; this baseline does not authorize silent upgrades or unrelated rewrites. When starting a new project, implement this baseline with compatible versions and committed lockfiles.

## Stack and architecture — documented conventions

- Use React 19, strict TypeScript 6, Vite 8 with React Compiler, and Tailwind CSS 4. Use TanStack Router/Query/Table, React Hook Form with Zod, Radix primitives/icons, React Aria search controls, CVA, and i18next.
- Use .NET 10, ASP.NET Core REST endpoints, EF Core/Npgsql with PostgreSQL, built-in OpenAPI, policy authorization, Problem Details, Aspire 13.6, and OpenTelemetry.
- Build a modular monolith in end-to-end vertical slices. Keep the frontend in `src/Afterclass.Web`, backend projects alongside it, and tests at the repository root.
- Organize frontend and API code by business feature. Dependencies flow `app/routes → features → shared`. Routes compose features; keep substantial domain UI and API logic inside features.
- Cross-feature imports require an explicit product relationship. Prefer composition at the route/application layer. Shared UI must stay domain-neutral.
- Extract abstractions only after two meaningful consumers exist, unless they enforce accessibility or security. Create folders and shared-contract projects only when needed.

## Frontend readability and UI — explicit agent conventions

- Keep pages focused on routing, queries, and layout. Extract meaningful sections, not every wrapper. Extract hooks for cohesive stateful responsibilities or reuse.
- Use guard clauses for loading/error/empty branches. Do not use nested ternaries. Use braces for control flow and descriptive callback names. Treat size/complexity warnings as review signals.
- Let Prettier format JSX; preserve behavior during refactors.
- Use Radix primitives for dialogs, menus, popovers, tooltips, tabs, and fixed-option selects. Use React Aria Components for search fields and searchable comboboxes. Do not rebuild keyboard/focus/listbox behavior without documenting a concrete library gap.
- Use Radix Icons. Use accessible shared row-action patterns; avoid nested popover triggers and flyout submenus. Use a popover when actions need persistent pending/error feedback or host a dialog that must outlive a menu.
- Use Tailwind utilities, CVA for visual variants, and a `cn()` helper for conditional classes. Extend shared primitives before adding inconsistent one-off controls.
- Define fixed scales/fonts/radii/shadows with Tailwind v4 `@theme`. Define themeable semantic values in `:root` under the `--ac-*` namespace and expose them through `@theme inline`.
- Prefer semantic utilities such as `bg-surface`, `text-foreground`, and `border-border`. Avoid raw colors and arbitrary values when an existing token fits. Add intentional reusable tokens; use brand scales only for brand identity.
- Reserve global CSS for tokens, resets, typography, and shared animations. Implement themes by overriding semantic variables. Adopt Radix Themes only through an explicit design-system decision.

## State, contracts, and security — documented conventions

- TanStack Query owns server state; Router search parameters own shareable filters, sorting, pagination, and other URL state; React Hook Form owns substantial forms; local state owns temporary interaction.
- Do not copy query data into component state except for editable drafts. Include the active tenant ID in every tenant-scoped query key when multi-tenancy applies.
- Production features use the Orval-generated API client and shared fetch mutator. Do not call fetch directly from routes/features or duplicate generated request/response types.
- Never hand-edit or format generated API files, `src/routeTree.gen.ts`, or the OpenAPI snapshot. Generate and review the contract, then regenerate consumers.
- Use external OIDC with PKCE and HTTP-only cookie sessions. Protect cookie-authenticated mutations with antiforgery checks. Prefer same-origin browser/API hosting.
- Never persist credentials, access tokens, antiforgery tokens, or authentication responses in local storage or other persistent browser storage. UI permissions improve presentation; backend authorization remains authoritative.
- Verify tenant selection against active membership and scope database/search access on the server. A tenant selector alone grants no access. For multi-tenant products, scope uniqueness constraints, cache keys, file paths, and background-job context to the tenant; explicitly authorize and audit cross-tenant operations.
- Use REST resources for CRUD and explicit commands for workflow transitions. Validate requests on the server; use stable DTOs rather than exposing EF entities. Keep pagination/filter/sort behavior consistent and review breaking contract changes.
- Handle expected 401/403/404, validation, and unexpected failures explicitly. Keep secrets and sensitive document contents out of structured logs; distinguish audit history from diagnostic logs.

## Accessibility and asynchronous behavior — explicit agent conventions

- Prefer semantic HTML. Name every interactive control; icon-only controls need a tooltip and aria-label; decorative icons use aria-hidden. Dialogs need a title and description.
- Support keyboard interaction, visible focus, WCAG AA text contrast, reduced motion, and mobile/tablet/desktop layouts.
- Define loading, empty, error, forbidden, and success states where applicable. Do not add decorative controls without working behavior.
- Keep page headers, filters, and surrounding layout mounted during loading. Use structure-matching skeletons initially, compact indicators for small regions, and full-screen loading only for application/session initialization.
- Preserve content during background refetches; mark the affected region aria-busy and show subtle progress without blocking unrelated controls. Loading regions need a role=status label; visual skeletons/spinners are decorative.
- Prevent duplicate mutation submissions, expose aria-busy and action-specific pending feedback, and disable only conflicting controls.
- Use restrained shared animations without layout shifts or delayed access. Preserve keyboard focus; avoid generic entrance animations. Respect reduced motion.
- Confirm destructive or difficult-to-reverse actions. Keep field validation near fields; notify on completed background mutations. Format dates/statuses/identifiers through shared helpers.

## Backend and API integration — inferred from implementation

These defaults reflect the inspected code rather than backend-specific AGENTS.md rules.

- Use ASP.NET Core minimal endpoint groups organized under `Features/<Capability>`, with feature-owned request/response DTOs, operations, and authorization.
- Keep DbContext, entities, configurations, and migrations in `Afterclass.Persistence`. Both API and one-shot MigrationService reference it. AppHost waits for successful migrations before starting dependent services.
- Enable nullable reference types. Reuse ServiceDefaults for telemetry, health, discovery, and HTTP resilience. Keep secrets and resource addresses in environment configuration or secret providers.
- Protect updates against stale writes/races when the workflow needs concurrency guarantees. Choose the constraint, version check, transaction, or database lock appropriate to the operation; do not assume client-side checks suffice.
- The shared fetch adapter must preserve Orval's expected response shape and own cookie credentials, antiforgery headers, cancellation, Problem Details conversion, and empty-response handling. Authenticated API failures return 401/403 rather than HTML login redirects.
- Use secure production cookies. Keep application secrets in backend configuration/secret providers; never expose them in frontend environment variables.
- Keep test-only authentication endpoints gated to Development and reject production enablement.

## Optional infrastructure — documented operational conventions

- Add workers, object storage, messaging, search, push, and distributed caches only for demonstrated requirements. PostgreSQL remains the source of truth.
- Store file bytes in object storage and metadata/jobs in PostgreSQL. Authorize access to files.
- With RabbitMQ, commit business changes and outbox rows together; publish with confirms; acknowledge consumption after database commit; deduplicate through inbox/idempotent processing; use bounded retries and dead-letter queues. Version message contracts and send identifiers rather than file bytes.
- Make Elasticsearch projections eventually consistent, server-scoped, and rebuildable. Use PostgreSQL for immediate authoritative reads.
- Isolate external providers behind clients and application-owned mappers. Validate external output before it changes canonical data.

## Verification and delivery — documented conventions

- After frontend edits run `npm --prefix src/Afterclass.Web run format`; before delivery run `npm --prefix src/Afterclass.Web run check`. Define check as format verification, ESLint, Vitest, and TypeScript/production build.
- Run relevant Playwright journeys when behavior changes. Test user-visible outcomes and use MSW at the HTTP boundary; do not replace production API modules with mock implementations.
- Cover permissions, mutations, validation, loading/error/empty states, background fetching, pending feedback, and loading accessibility as applicable. Preserve tests during refactors.
- Install frontend dependencies before checks: use `npm --prefix src/Afterclass.Web install` once to create a lockfile in a new scaffold, then `npm --prefix src/Afterclass.Web ci` for clean installs. Configure tools/scripts before invoking them; exclude generated files from formatting/linting.
- With Docker available, run `dotnet restore Afterclass.slnx`, `dotnet build Afterclass.slnx --configuration Release --no-restore`, and `dotnet test --solution Afterclass.slnx --configuration Release --no-build`. Use xUnit and Testcontainers for real database integration tests.
- Test authorization, antiforgery, concurrency, migration behavior, and OpenAPI drift; test tenant isolation when applicable. Keep browser smoke tests isolated from shared data and external identity providers.
- For API changes, review generated OpenAPI against the committed snapshot, accept generated output, run `npm --prefix src/Afterclass.Web run api:generate`, and rerun affected backend/frontend checks. Never edit generated schemas manually.
- Run frontend/backend checks for the affected areas; when changing a public contract or completing a new scaffold, verify both sides. Configure the corresponding CI gates.
- Report behavior changed, verification performed, and material unresolved limitations. Do not claim unrun checks passed.

## Git commits — generalized explicit convention

- Format subjects as `<TICKET> <type>(<scope>): <lowercase imperative summary>` with the `AFC` ticket identifier.
- Prefer feat, fix, refactor, style, test, docs, and chore. Use a short lowercase kebab-case scope; omit trailing periods.
- Keep commits focused on one logical change; explain non-obvious reasons/tradeoffs in the body.
- Example: `AFC-42 feat(auth): add session renewal`.
