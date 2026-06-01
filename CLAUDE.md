# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What is Kora

Kora is a padel club booking platform. It lets clubs manage courts and operating hours, and lets members create/join bookings (game sessions or day-use passes). Deployed on Fly.io (two environments: `koraplay-api` prod, `koraplay-api-dev` dev).

## Stack

- **Runtime**: .NET 10, ASP.NET Core Minimal API
- **Database**: PostgreSQL via EF Core + Npgsql
- **Auth**: Clerk (JWT bearer). Users are JIT-provisioned in the DB on first authenticated request.
- **Validation**: FluentValidation
- **Migration tool**: `dotnet-ef` (local tool, invoke via `dotnet tool run dotnet-ef`)

## Commands

```bash
make setup          # first-time: copies local config, starts postgres container, restores, builds, runs migrations
make run            # dotnet run with https launch profile
make build
make test
make migration name=MigrationName   # add EF migration
make db-update      # apply pending migrations
make deploy env=dev
make deploy env=prod   # prompts for confirmation
```

Docker (full stack via docker-compose):
```bash
make docker-up / docker-down / docker-logs / docker-rebuild / docker-clean
```

## Local config

Copy `src/Kora.Api/appsettings.Local.example.json` to `appsettings.Local.json` (or run `make init-local-config`). Fill in:
- `ConnectionStrings:Default` — Postgres connection string
- `Auth:Authority` — Clerk Frontend API URL (e.g. `https://your-app.clerk.accounts.dev`)
- `Auth:AdminEmails` — semicolon-separated list; matching emails get `Role=Admin` on JIT provision

Copy `.env.example` to `.env` for the REST Client `.http` files and docker-compose auth env vars.

In production, `DATABASE_URL` (Fly-style postgres URL) is parsed in `Program.cs` and takes precedence over `appsettings`.

## Architecture

### Feature slices (`Features/`)

Each feature lives in its own folder with a `Handler`, `Request`, `Response`, and `Validator`. Handlers implement the marker interface `IHandler` and are auto-registered as scoped services via reflection (`HandlerExtensions.AddHandlers`). Endpoints implement `IEndpointGroup` and are also auto-registered and mapped under `/api/v1/`.

**Pattern for a new feature:**
1. Create `Features/{Domain}/{Action}/` folder with `{Action}Handler.cs`, request/response records, and a FluentValidation validator.
2. Add a route in the domain's `{Domain}Routes.cs : IEndpointGroup`.
3. No manual DI registration needed — reflection picks up handlers and endpoint groups automatically.

### Strategy pattern for bookings

`CreateBookingHandler` resolves an `ICreateBookingStrategy` by keyed DI using `request.Type` (`BookingType` enum). Strategies are registered in `CreateBookingDependencyInjection`. Adding a new booking type = new strategy class + keyed registration.

`BookingPlanning.PrepareAsync` is a shared static helper that validates club hours, resolves UTC times, and finds free courts — call it from any strategy.

### Auth & user resolution

`ResolveUserMiddleware` runs after authentication and calls `IUserContext.GetCurrentUserAsync` for every authenticated request. `UserContext` JIT-creates a `User` row from the Clerk JWT `sub`/`email` claims if one doesn't exist yet, and promotes to `Admin` if the email matches `Auth:AdminEmails`. The current user ID is stored in the scoped `CurrentUserIdHolder` singleton, which `AppDbContext` reads to stamp `CreatedBy`/`UpdatedBy` on `IAuditable` entities.

### Email

Inject `IEmailSender` into any handler and call `SendAsync(message, ct)`. Each feature that sends an email has a `{Action}Email.cs` sibling with a static `Build(...)` method returning `EmailMessage`. Use `EmailTemplate.Wrap(title, bodyHtml)` to produce the full HTML from a snippet.

```csharp
// In a handler:
var message = BookingCreatedEmail.Build(user.Email, booking);
await _emailSender.SendAsync(message, ct);
```

Config: `Email:ApiKey` (Resend API key) and `Email:From` (e.g. `"Kora <noreply@koraplay.com>"`). Set as Fly secrets in prod: `fly secrets set Email__ApiKey=re_...`.

### Infrastructure

- `AppDbContext.SaveChangesAsync` auto-stamps audit fields (`CreatedBy`, `UpdatedBy`, `UpdatedAt`) for any entity implementing `IAuditable`.
- EF model configuration lives in `Infrastructure/Data/Configuration/` using `IEntityTypeConfiguration<T>`.
- Migrations run automatically on startup (`db.Database.MigrateAsync()`).
- Seed data is applied in Development only (`SeedExtensions`).
