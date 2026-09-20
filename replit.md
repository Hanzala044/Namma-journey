# Namma Journey

One plan, one balance, and one pass for multimodal journeys across Bengaluru.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string
- Optional provider env is documented in `.env.example`; never commit `.env`.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/namma-journey/src/App.tsx` — frontend route order and shared providers
- `artifacts/namma-journey/src/components/shell.tsx` — responsive navigation and active-journey indicator
- `artifacts/namma-journey/src/pages/` — commuter flow in order: plan, options, journey review, active journey, wallet, history, account
- `artifacts/api-server/src/routes/` — API route groups in health, dashboard, journeys, and wallet order
- `artifacts/api-server/src/lib/transit-state.ts` — simulator state transitions and wallet ledger rules
- `lib/api-spec/openapi.yaml` — API contract source of truth
- `artifacts/namma-journey/src/index.css` — shared theme tokens and global styles

## Architecture decisions

- The current milestone uses an in-memory transit simulator; persistence and live provider feeds remain deferred.
- All fares and wallet values are stored as integer paise to avoid floating-point money errors.
- Route option IDs are scoped to the origin and destination so confirming a route cannot use stale data from another search.
- Walking legs are completed automatically because they do not require a validator scan; the active ticket always points to the next payable leg.
- A commuter cannot overwrite an in-progress journey; each validated leg creates its debit and releases its unused fare hold in the append-only ledger.

## Product

- Plan mixed bus, metro, cab, and walking trips.
- Compare full fares before confirming.
- Hold the fare ceiling, then debit only validated legs.
- Show an active rotating ticket and append-only wallet ledger.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Restart the managed API workflow after changing simulator or route code.
- Run API codegen after changing `lib/api-spec/openapi.yaml` before using new generated contracts.
- Vite configs use managed `PORT` and `BASE_PATH` values when present, with local build-safe defaults for `pnpm run build`.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
