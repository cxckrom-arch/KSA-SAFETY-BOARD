# KSA SAFETY BOARD

Architecture-first foundation for an enterprise HSE command center.

## Stack

- Next.js App Router + TypeScript
- Supabase Auth/Postgres/RLS
- TanStack Query for client data fetching/invalidation
- Vercel deployment target
- Arabic RTL initial locale with English LTR switch

## Local setup

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Required values:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or legacy `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

The app does not provide a demo/fake login when these values are absent. It renders an explicit configuration state instead.

## Database

Apply `supabase/migrations/202610010001_architecture_foundation.sql` and `supabase/migrations/20261001150800_security_hardening.sql` to the intended Supabase project using the Supabase CLI or dashboard migration workflow. The KSA SAFETY BOARD Supabase project is already connected in the current environment and both migrations are applied. Do not run destructive migrations against production without a backup and rollback plan.

## Checks

```bash
pnpm lint
pnpm typecheck
pnpm build
pnpm test
```

## Routes

The canonical page route manifest is `public/manus-routes.json`. Route traceability is defined in `lib/route-registry.ts`.

## Current release status

**PARTIALLY CONNECTED:** Supabase project `vlrlmlwioccfbupsyymm` is connected and the foundation/RLS migrations are applied. Initial organization/member provisioning, live account/MFA verification, Vercel deployment, and production recovery checks remain pending.
