# KSA SAFETY BOARD — Architecture-First Foundation Plan

## Understanding

Build the shared platform foundation before business modules for a Saudi industrial safety command center. The first slice establishes the public landing page, admin authentication entry, protected admin shell, route traceability registry, responsive navigation, global search, notifications entry point, Arabic/English RTL/LTR support, dark/light application theme, reusable UI states, Supabase-backed auth/data boundaries, and a reusable print canvas. Business modules (NCR, SOR, incidents, risk, CAPA, fire, drills, licenses, training, assets, visitors, and reports) are intentionally not implemented in this slice.

## Confirmed constraints

- Source repository: `cxckrom-arch/KSA-SAFETY-BOARD`.
- Target hosting: Vercel.
- Target data/auth: Supabase.
- No Supabase project or Vercel team/project is currently visible to this session; credentials and project identifiers are not fabricated.
- Production-backed modules must not fall back to demo data.
- The application must support Arabic and English, RTL/LTR, dark/light app themes, mobile navigation, server-enforced authorization, and white print output.

## Design direction

- **Design movement:** Industrial editorial command center: a restrained Swiss information system adapted to field safety operations.
- **Core principles:** scan-first hierarchy, calm authority, explicit state, and auditability.
- **Color philosophy:** deep navy anchors trust and control; warm paper surfaces keep dense work readable; safety amber marks attention; red is reserved for material risk; green indicates confirmed completion. No gradients or neon treatment.
- **Layout paradigm:** a persistent command rail plus a single operational canvas. The desktop view keeps navigation and context stable while the content surface changes; mobile collapses the rail into a drawer and keeps the current task/action in reach.
- **Signature elements:** amber incident-marker line, compact uppercase route eyebrow, and a square board seal/monogram that survives monochrome printing.
- **Interaction philosophy:** every action states its resulting state; failure is actionable; empty states explain the missing source and the next safe step; primary operations remain keyboard reachable.
- **Animation:** short opacity/translate transitions for drawers and toasts only; respect `prefers-reduced-motion`; no decorative motion.
- **Typography system:** IBM Plex Sans Arabic for Arabic/Latin UI text with system fallbacks; 12–14px operational metadata, 16px body, 24–32px page hierarchy. Tabular numerals for counts.
- **Brand essence:** the Saudi safety board for turning field evidence into accountable action — disciplined, clear, and dependable.
- **Brand voice:** direct and operational. Example lines: “اعرف ما يحتاج قرارًا الآن” / “سجّل الدليل قبل إغلاق الإجراء”.
- **Wordmark/mark:** `KSA` monogram inside a square safety seal, paired with the fixed wordmark `KSA SAFETY BOARD`.
- **Signature brand color:** Safety Amber `#F0A51A`.

## System structure

- `app/`: Next.js App Router routes, API handlers, and global styles.
- `components/layout/`: public shell, protected admin shell, sidebar, top bar, mobile drawer, search.
- `components/ui/`: reusable operational primitives and explicit loading/empty/error states.
- `components/print/`: print-safe canvas, preview/print/share controls.
- `components/providers/`: theme, locale, and React Query providers.
- `lib/route-registry.ts`: the single route → page → permission → resource registry.
- `lib/auth/`: permission constants, auth guard boundaries, and role mapping.
- `lib/supabase/`: server/browser clients and middleware session refresh.
- `lib/api/`: response/error conventions for server handlers.
- `supabase/migrations/`: shared core schema, RLS, audit, actions, and notifications.
- `docs/`: architecture report and verification evidence.
- `public/manus-routes.json`: complete page route manifest.

## Implementation decisions

1. Use the Next.js App Router with server components for protected route boundaries and client components only for interactive shell behavior.
2. Use Supabase SSR clients for Auth and Postgres. If required environment variables are absent, the UI shows a configuration state and never authenticates against a fake account.
3. Define permissions and sidebar visibility in one registry. UI filtering is convenience only; RLS and server checks remain authoritative.
4. Keep business data absent until its source-of-truth tables and policies are implemented. Dashboard metrics are therefore explicit “not connected” states, not hardcoded KPIs.
5. Use a single print canvas with `@media print` rules that force white paper regardless of application theme.
6. Keep Vercel deployment configuration in the repository, but do not create or publish a Vercel project without an available connected account/team.

## Acceptance scope for this slice

- All declared shell routes exist and are represented in `public/manus-routes.json`.
- `/admin/*` is protected by middleware/session checks once Supabase is configured.
- Admin shell supports desktop sidebar, mobile drawer, top bar, quick actions, search, locale toggle, theme toggle, and sign out affordance.
- Arabic is the initial language and uses RTL; English can switch the document to LTR without duplicating layout code.
- UI primitives cover hero, card, badge, field, table, tabs, toast, skeleton, empty, error, and confirmation patterns.
- Print preview uses an always-white A4 canvas and excludes interactive chrome when printed.
- Migration defines shared identities, memberships/RBAC, audit events, attachments metadata, actions, action events, and notifications with RLS foundations.
