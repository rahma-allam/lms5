# LMS Platform with Marketing AI

A multi-tenant Learning Management System (LMS) admin panel with an AI-powered Marketing Intelligence page that analyzes pixel tracking configuration and generates personalized recommendations via Claude AI.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (set as Replit secret)
- Required env: `SESSION_SECRET` — JWT signing secret (set as Replit secret)
- Anthropic AI: `AI_INTEGRATIONS_ANTHROPIC_BASE_URL` and `AI_INTEGRATIONS_ANTHROPIC_API_KEY` (set via Replit AI integrations)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 on port 8080 → proxied at `/api`
- Frontend: React + Vite (Tailwind CSS v4, Wouter routing, React Query) → proxied at `/`
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)
- AI: Anthropic Claude via `@workspace/integrations-anthropic-ai`

## Where things live

- `artifacts/api-server/src/routes/` — Express route files
- `artifacts/api-server/src/routes/marketing-ai.ts` — Marketing AI route (GET pixels-status, POST analyze with SSE streaming)
- `artifacts/lms-platform/src/pages/MarketingAI.tsx` — Marketing AI frontend page
- `artifacts/lms-platform/src/components/layout/Sidebar.tsx` — Admin sidebar (includes Marketing AI nav item)
- `lib/db/src/schema/` — Drizzle ORM schema (settings.ts has pixel fields)
- `lib/integrations-anthropic-ai/` — Anthropic AI client wrapper

## Architecture decisions

- Multi-tenant: every request carries a `?tenant=<slug>` query param; middleware resolves it to a `tenantId` stored on `req`
- Admin auth: JWT-based (`SESSION_SECRET`), signed on login, verified by `requireAdmin` middleware
- Marketing AI uses SSE streaming so Claude's response renders token-by-token in the browser
- Pixel tracking code snippets (Meta, Google Tag Manager, TikTok) are generated server-side and returned with the pixel status
- No refactoring of existing code — new feature added only as new files with minimal linking

## Product

- Multi-tenant LMS admin panel: courses, students, orders, coupons, settings
- **Marketing AI page**: reads Meta/Google/TikTok pixel config from DB, calls Claude AI for personalized marketing recommendations with SSE streaming output, shows tracking code snippets per platform

## Default credentials (dev seed)

- URL: `/?tenant=default` (or `/login?tenant=default`)
- Email: `admin@academy.com`
- Password: `admin123`

## User preferences

- Add only new files; minimally link into existing code without refactoring

## Gotchas

- Do NOT use `--env-file=../../.env` in the api-server dev script — Replit secrets are already injected as env vars
- The `lib/db/src/index.ts` must NOT call `dotenv.config()` — env vars come from Replit secrets
- `pnpm --filter @workspace/db run push` must be run after any schema changes to apply them to the DB
- The admin_users table column is `password` (not `password_hash`)

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
