# Reusable .NET + React project blueprint

Source baseline inspected October 13, 2026; blueprint reviewed October 14, 2026. Derived from the production application and its checked-in manifests, configuration, agent instructions, and architecture documentation. Versions describe that application, not a claim about current releases. Replace `Project` with the new application's name.

## Start a new project

These two documents are a specification and agent template; this folder does not contain a runnable scaffold. [AGENTS.md](AGENTS.md) supplies agent rules; this guide supplies the stack, structure, and setup contract.

1. Choose a PascalCase solution name, lowercase package name, uppercase ticket prefix, and CSS token namespace. Replace `Project`, `project-api`, and the sample `APP` prefix consistently, including namespaces, generated-client configuration, and commands.
2. Copy AGENTS.md into the new repository root. Keep this guide as `docs/stack-and-structure.md` if the new project needs a local reference. The original blueprint files remain reusable outside that repository.
3. Scaffold the core projects below, pin the SDK in global.json, configure strict TypeScript and the Vite plugins, and commit package-lock.json. Start with database, migrations, API, and one working frontend feature; add optional services only as required.
4. Wire OpenAPI generation, Orval, the shared fetch adapter, test setup, and CI. Configure the new identity-provider registration, local HTTPS callbacks, and secrets for that project; do not reuse source-project credentials or addresses.
5. Verify one complete user journey: authenticate, load a protected view, perform a validated mutation, persist it, and read it back. Include forbidden/error/loading paths and an isolated API integration test before extending the product.

## Core stack

| Area | Baseline and purpose |
| --- | --- |
| Browser | React 19, React DOM 19, strict TypeScript 6 |
| Build | Vite 8, React Compiler, Node.js 24, npm with a committed lockfile |
| Styling | Tailwind CSS 4 through its Vite plugin; semantic design tokens |
| Routing and data | TanStack Router for file-based routes and URL state; Query 5 for server state; Table 9 for tables |
| Forms | React Hook Form 7, Zod 4, hookform resolvers |
| Accessible UI | Radix primitives and Icons; React Aria Components for search fields and searchable comboboxes |
| Variants | class-variance-authority (CVA), clsx, tailwind-merge |
| Localization | i18next and react-i18next |
| API contracts | ASP.NET Core built-in OpenAPI; Orval 8 generates fetch clients and TanStack Query hooks through a shared fetch mutator |
| Backend | .NET 10; ASP.NET Core minimal REST endpoints; nullable reference types |
| Persistence | EF Core 10, Npgsql PostgreSQL provider; PostgreSQL is authoritative (source integration tests use PostgreSQL 18.3) |
| Orchestration | Aspire 13.5 AppHost; shared service defaults, health checks, service discovery, HTTP resilience |
| Telemetry | OpenTelemetry logs, traces, metrics, and OTLP export |
| Authentication | External OIDC authorization code flow with PKCE; HTTP-only cookie sessions; antiforgery checks |
| Authorization | Backend policies and verified tenant membership when multi-tenancy applies; Problem Details errors |
| Frontend quality | Prettier, ESLint, Vitest, React Testing Library, MSW, Playwright |
| Backend quality | xUnit, ASP.NET Core WebApplicationFactory, Testcontainers; reviewed OpenAPI snapshot drift checks |

Representative pins: .NET SDK `10.0.300` with `latestFeature` roll-forward, EF Core `10.0.11`, Npgsql provider `10.0.0`, Aspire AppHost SDK `13.5.3`, React `^19.2.8`, TypeScript `~6.0.2`, Vite `^8.2.2`, Tailwind `^4.3.3`. These frontend ranges are manifest constraints, not exact installed versions. Preserve compatible package families and pin the chosen SDK and lockfile in the new project.

## Architecture and repository structure

Start with a modular monolith and deliver complete vertical slices across UI, API, persistence, and tests. Organize by business capability. Use a browser SPA and ASP.NET Core backend; server rendering is not required by this baseline.

```text
Project.slnx
AGENTS.md
global.json
.editorconfig
src/
  Project.Api/                 # feature endpoints, DTOs, operations, authorization
    Features/<Capability>/
  Project.Web/
    AGENTS.md                 # optional: frontend-specific refinements
    package.json
    package-lock.json
    vite.config.ts
    orval.config.ts
    tsconfig.app.json
    e2e/                      # mocked journeys and isolated real-API smoke tests
    src/
      app/                    # providers, router setup, application layout
      routes/                 # compose features; thin file-based routes
      features/<capability>/  # domain UI, hooks, schemas, API adapters, tests
      shared/
        ui/
        api/client/           # shared fetch mutator
        api/generated/        # Orval output
        hooks/
        lib/
        types/
        i18n/
      styles/                 # theme tokens and global foundations
      mocks/
      test/
  Project.Persistence/        # DbContext, feature entities/configurations, migrations
  Project.MigrationService/   # one-shot migration process
  Project.AppHost/            # local resources and dependency startup
  Project.ServiceDefaults/   # shared telemetry, health, resilience, discovery
  Project.Worker/             # optional: durable background processing
  Project.Messaging/          # optional: outbox/inbox and message delivery
  Project.Search/             # optional: rebuildable search projections
  Project.Integrations/       # optional: real external-provider boundaries
  Project.Contracts/          # optional: only when shared contracts have consumers
tests/
  Project.Api.UnitTests/
  Project.Api.IntegrationTests/
openapi/project-api.json
docs/
.github/workflows/
```

Frontend dependencies flow `app/routes → features → shared`. Features may use shared code; cross-feature imports need an explicit product relationship. Create subfolders only as needed. Keep shared UI domain-neutral. Persistence owns database models/configuration/migrations; the API owns endpoint contracts and business operations. The API and migration service reference Persistence. AppHost waits for migrations to complete before starting database-dependent processes.

Use REST resources for CRUD and explicit commands for workflow transitions. Return stable DTOs rather than EF entities, validate requests on the backend as well as in forms, return Problem Details for failures, and define consistent pagination/filter/sort behavior. Review compatibility when changing public contracts.

The shared fetch adapter owns cookie credentials, antiforgery headers for unsafe methods, cancellation, Problem Details conversion, empty-response handling, and the response shape expected by Orval. Keep tenant context/query-key scoping explicit when applicable. Do not expose authentication secrets to frontend environment variables.

Prefer one public origin: SPA at `/`, REST at `/api/`. Development Vite proxies API and OIDC callback paths to the backend; production can serve the Vite build from the API static web root. Configure URLs, ports, secrets, and identity-provider callbacks for each environment.

## Optional capabilities

| Capability | Add when needed | Required invariants |
| --- | --- | --- |
| File storage | S3-compatible object storage; local MinIO | Keep file bytes outside PostgreSQL; authorize access; retain metadata in PostgreSQL |
| Background work | Separate .NET Worker Service and durable database jobs | Persist job state; bounded retries; idempotent processing |
| Broker delivery | RabbitMQ plus transactional outbox/inbox | Commit business changes and outbox together; publisher confirms; ack after commit; deduplicate; retry and dead-letter failures; version contracts; send identifiers rather than file bytes |
| Full-text search | Elasticsearch 9.x (source image: 9.5.3) | Eventually consistent, tenant-filtered, rebuildable projection; PostgreSQL remains authoritative |
| External processing | Dedicated provider client and application-owned result mapping | Validate provider output; isolate provider schemas from canonical business models |
| Push updates | SignalR | Add only for an established push-update requirement |
| Distributed cache | Redis/Valkey | Add only for a demonstrated cache, scale-out, or coordination requirement |

Docker is needed for Aspire container resources and Testcontainers. Docker Compose publishing exists in the source project; the blueprint does not prescribe its staging runner or hosting environment. SignalR and distributed caching were planned options, not implemented baseline requirements.

## Commands and verification

Prerequisites: the selected .NET SDK, Node.js 24/npm, and a running Docker-compatible engine for container resources/tests. The commands below assume `Project` has been replaced and the scaffold/configuration exists. On first setup run `npm --prefix src/Project.Web install` to create the lockfile; commit it. Use `ci` for subsequent clean installs.

Run from the new repository root:

```sh
npm --prefix src/Project.Web ci
dotnet restore Project.slnx
dotnet build Project.slnx --configuration Release --no-restore
dotnet test Project.slnx --configuration Release --no-build --logger trx --results-directory artifacts/test-results
dotnet run --project src/Project.AppHost
```

Run frontend verification independently of the long-running AppHost:

```sh
npm --prefix src/Project.Web run format
npm --prefix src/Project.Web run check
(cd src/Project.Web && npx --no-install playwright install chromium)
npm --prefix src/Project.Web run test:e2e
```

Use this scripts object in the frontend package.json after installing/configuring the corresponding tools:

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "typecheck": "tsc -b --pretty false",
    "lint": "eslint .",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "api:generate": "orval --config orval.config.ts",
    "format": "prettier . --write",
    "format:check": "prettier . --check",
    "check": "npm run format:check && npm run lint && npm run test && npm run build"
  }
}
```

Configure Vite with the React/React Compiler, TanStack Router generation, and Tailwind plugins; use strict TypeScript and the `@/` source alias. Configure Vitest with jsdom, Testing Library setup, and MSW. Give Playwright an explicit mocked-suite selection and webServer configuration; run real-API smoke tests separately against an isolated configured AppHost. Browser installation downloads Chromium; CI on Linux may also need `--with-deps`.

Browser tests remain a separate check. Exclude generated clients, route trees, build output, and OpenAPI snapshots from formatting; exclude generated clients/route trees from linting. Use ESLint rules for React Hooks, React Refresh, and TanStack Query, with errors for nested ternaries and missing control-flow braces. Complexity/line-count limits are advisory, not reasons to split cohesive code arbitrarily.

For contract changes: generate the backend OpenAPI document through a test/export tool, review the difference against `openapi/project-api.json`, replace the snapshot with reviewed generated output, run `npm --prefix src/Project.Web run api:generate`, and rerun both sides' checks. Configure Orval to read that snapshot and use the shared fetch mutator. The export harness is application-specific and must be implemented; it is not a built-in dotnet command.

Test authorization, antiforgery, validation, concurrency, migrations, and contract drift against real disposable PostgreSQL; test tenant isolation whenever multi-tenancy is enabled. Test UI permission branches, mutations, loading/error/empty states, keyboard behavior, mobile layouts, and reduced motion. MSW mocks HTTP boundaries; maintain a separate isolated real-API browser smoke suite. CI runs backend checks, frontend checks, and browser journeys; configure required branch checks explicitly.

## Reuse and provenance

Copy the companion AGENTS.md into the new repository root, choose the project name and ticket prefix, and scaffold only the capabilities the new product needs. Do not copy business entities, roles, workflows, styling migration debt, or prototype environment assumptions.

Source inventory (paths relative to the inspected backend repository):

- Explicit rules: `AGENTS.md`, `src/Demi.Web/AGENTS.md`.
- Frontend baseline, all under `src/Demi.Web/`: `package.json`, `vite.config.ts`, `tsconfig.app.json`, `orval.config.ts`, `eslint.config.js`, `.prettierignore`, `playwright.config.ts`, README, and `src/shared/api/client/fetcher.ts`.
- Backend baseline: `global.json`, project files under `src/`, `src/Demi.Api/Program.cs`, authentication configuration, `src/Demi.AppHost/AppHost.cs`, and `src/Demi.MigrationService/Worker.cs`.
- Architecture and operations: `PROJECT_PLAN.md`, `docs/authentication.md`, `docs/messaging-and-search.md`, `docs/continuous-integration.md`, and `.github/workflows/`.

The separate Admin panel prototype is not the production baseline. Setup steps and generic names are reuse guidance, not additional source-project capabilities. Explicit conventions come from agent instructions and architecture/operational documentation. Structural backend conventions inferred from implementation are identified in the companion template. Current manifests/code take precedence over stale planning notes.
