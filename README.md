# Afterclass

Hobby and after-class activity management for clubs, coaches and families, Lithuania first.
"Afterclass" is an internal codename; the product name is chosen in Milestone 1 ([candidates](docs/naming.md)).

- Roadmap: [docs/roadmap.md](docs/roadmap.md)
- Agent and contributor rules: [AGENTS.md](AGENTS.md)
- Stack blueprint: [docs/stack-and-structure.md](docs/stack-and-structure.md)

## Stack

.NET 10 · ASP.NET Core minimal APIs · EF Core + PostgreSQL · Aspire 13 · Keycloak (OIDC, local) ·
React 19 · TypeScript 6 · Vite 8 (React Compiler) · Tailwind CSS 4 · TanStack Router/Query ·
React Hook Form + Zod · Radix · i18next · Orval · xUnit v3 + Testcontainers · Vitest + MSW · Playwright

## Prerequisites

- .NET SDK 10.0.1xx or newer (see `global.json`)
- Node.js 24 and npm
- Docker (or another Docker-compatible engine) for PostgreSQL, Keycloak and integration tests

## Run locally

```bash
npm --prefix src/Afterclass.Web ci
```

```bash
dotnet run --project src/Afterclass.AppHost
```

The Aspire dashboard opens with PostgreSQL (+ pgAdmin), Keycloak, the one-shot migrations, the API and
the web app. Open http://localhost:5173 and sign in with a seeded **development-only** account:

| User                     | Password       |
| ------------------------ | -------------- |
| `owner@afterclass.local` | `Afterclass1!` |
| `coach@afterclass.local` | `Afterclass1!` |

Keycloak's admin console is at http://localhost:8080 (credentials are shown on the Keycloak resource in
the Aspire dashboard). The OIDC client secret is generated on first run and stored in the AppHost's
user secrets.

### How the pieces talk

The browser only talks to Vite (`localhost:5173`). Vite proxies `/api`, `/signin-oidc` and
`/signout-callback-oidc` to the API, so the SPA and API share one origin. The API is a
backend-for-frontend: it runs the OIDC code flow with PKCE against Keycloak and gives the browser an
HTTP-only session cookie. No tokens reach JavaScript. Unsafe requests carry an antiforgery token that
is kept in memory only.

## Checks

```bash
dotnet build Afterclass.slnx
```

```bash
dotnet test --solution Afterclass.slnx
```

```bash
npm --prefix src/Afterclass.Web run check
```

```bash
npm --prefix src/Afterclass.Web run test:e2e
```

`ProfileTests` need Docker (Testcontainers PostgreSQL); the other backend tests run without it.

## Changing the API contract

1. Change the endpoint and its DTOs in `src/Afterclass.Api/Features/<Capability>`.
2. Regenerate the snapshot and review the diff:

   ```bash
   AFTERCLASS_UPDATE_OPENAPI_SNAPSHOT=1 dotnet test --project tests/Afterclass.Api.IntegrationTests --filter-class "*OpenApiSnapshotTests"
   ```

3. Regenerate the typed client and hooks:

   ```bash
   npm --prefix src/Afterclass.Web run api:generate
   ```

## Database migrations

```bash
dotnet tool restore
```

```bash
dotnet ef migrations add <Name> --project src/Afterclass.Persistence --output-dir Migrations
```

The AppHost's `migrations` resource applies them before the API starts.
