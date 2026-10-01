# Architecture Report — KSA SAFETY BOARD

## 1. Goal, users, scope, and non-goals

**Goal:** establish the cross-cutting safety platform shell before operational modules.

**Primary actors:** platform owner, organization administrator, safety manager, safety officer, supervisor, employee/reporter, and read-only viewer.

**In scope:** application shell; route traceability; locale and direction; theme; auth entry and protected boundary; permission vocabulary; shared UI states; global navigation search; print canvas; shared Supabase schema/RLS foundation; API error conventions; health endpoint.

**Out of scope:** incident/NCR/risk/CAPA/PTW/inspection/training/fire/visitor business records, production email/SMS delivery, file binary storage provider setup, and final legal/compliance interpretation.

## 2. Deployment and trust boundaries

```text
Browser
  ├─ public landing and admin UI
  ├─ Supabase browser client (publishable/anon key only)
  └─ HTTPS cookie/session boundary
       │
Vercel
  ├─ Next.js server components and route handlers
  ├─ Supabase SSR session refresh
  └─ server-only environment variables
       │
Supabase
  ├─ Auth (password + MFA capability)
  ├─ Postgres (RLS is authoritative)
  └─ Storage adapter to be added with protected object policies
```

The browser never receives a service-role key. Server route handlers validate the user session and rely on Postgres RLS for organization scope.

## 3. Module map and cross-module flows

| Foundation | Responsibility | Downstream consumers |
|---|---|---|
| Identity & organizations | user profile, organization membership, site scope | every module |
| Permissions | role/permission vocabulary and route visibility | every module |
| Actions | central corrective/preventive action lifecycle | incidents, inspections, audits, NCR/CAPA, drills |
| Audit | consequential events and value changes | every mutable record |
| Notifications | recipient-scoped inbox | approvals, overdue actions, assignments |
| Attachments | protected metadata and evidence links | every evidence-bearing module |
| Print | A4/A3 white templates and official exports | all report modules |
| Search | navigation now; record index later | shell and modules |

Typical flow: a module creates a record → an action is generated transactionally → owner receives notification → evidence is attached → verifier closes/reopens → audit timeline records every transition → print template renders the official record.

## 4. Shared data model

- `profiles`: one-to-one with `auth.users`; display metadata and lock state.
- `organizations`: tenant boundary and board identity configuration.
- `organization_members`: scoped user membership with a constrained role.
- `audit_events`: append-only event metadata and JSON snapshots.
- `attachments`: metadata only; binary storage is an adapter and retrieval remains authorized.
- `actions`: central follow-up record with source, owner, priority, due date, status, verification, and closure.
- `action_events`: state transition history with actor and notes.
- `notifications`: recipient-scoped in-app notifications.

Stable UUID primary keys, foreign keys, unique membership constraints, check constraints for state/priority, indexes for scope and due dates, and timestamps are defined in the initial migration.

## 5. API conventions

- JSON errors use `{ "error": { "code": "...", "message": "...", "details": {} } }`.
- Authentication failures: 401; permission failures: 403; missing records: 404; validation: 422; configuration/dependency unavailable: 503.
- GET is read-only. Mutations will use POST/PATCH/DELETE and must be idempotent where retries are plausible.
- Large collections will use cursor or limit/offset pagination with server filtering; no client-only authorization.
- `/api/health` is unauthenticated and reveals no secret values.

## 6. UI route registry

| Route | Page | Permission | Resource |
|---|---|---|---|
| `/` | public landing | public | platform |
| `/admin/login` | authentication | public | auth |
| `/admin` | command center | `dashboard.view` | dashboard |
| `/admin/notifications` | notification inbox | `notifications.read` | notifications |
| `/admin/settings` | shell/settings | `settings.read` | settings |
| `/admin/print` | print preview harness | `reports.print` | print |

No sidebar item is declared outside this registry. Business routes will be added only with a route entry, page component, permission, and API/resource trace.

## 7. RBAC and workflow baseline

**Roles:** `platform_owner`, `org_admin`, `safety_manager`, `safety_officer`, `supervisor`, `employee`, `viewer`.

**Permission families:** dashboard, notifications, settings, reports.print, actions.read/create/update/verify/close, audit.read, attachments.read/create.

**Action lifecycle:** Open → Assigned → In Progress → Pending Verification → Closed; Closed → Reopened. Overdue is derived from `due_at` and non-closed status. Transition guards belong in server functions/RLS-backed API logic; the UI never accepts arbitrary status strings.

## 8. Print framework

The shared print canvas renders organization/board identity, report number, generated date/by, content, and footer. CSS forces `color-scheme: light`, white background, readable contrast, A4 sizing, and page-break rules. Interactive controls are hidden in print. A3 can be introduced as a template size modifier without forking shell logic.

## 9. Security and operational risks

| Risk | Status | Mitigation |
|---|---|---|
| Supabase project not connected | BLOCKED | Keep env example and migration; do not ship fake auth/data. |
| Vercel project not connected | BLOCKED | Push source to Git; connect/deploy once team is available. |
| MFA UX not wired to a live factor | INCOMPLETE | Expose auth boundary now; finish challenge route against configured Supabase. |
| File binary protection | INCOMPLETE | Metadata table only; add Storage policies before evidence modules. |
| Legal compliance interpretation | OUT OF SCOPE | Require competent HSE owner and jurisdiction-specific review. |

## 10. Acceptance criteria

- Shell, routes, and manifest are consistent.
- Theme, locale, direction, mobile, and print behavior are implemented in shared components.
- No demo login or fake production metrics exist.
- Supabase schema is migration-based and RLS-scoped.
- Build/type checks and route smoke checks pass locally.
