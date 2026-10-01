# KSA SAFETY BOARD Operating Rules

## Specialist execution rule

For substantial KSA SAFETY BOARD work, coordinate the twelve required specialist skills before implementation:

1. `ksa-safety-board-engineering`
2. `ksa-safety-board-uiux-design`
3. `ksa-esp-vision-systems-engineer`
4. `ksa-vision-command-center-uiux`
5. `ksa-vision-reliability-security-auditor`
6. `ksa-safety-board-print-document-architect`
7. `ksa-safety-board-dashboard-analytics`
8. `ksa-safety-board-hse-automation-workflow`
9. `ksa-safety-board-orchestrator`
10. `enterprise-hse-platform-engineer`
11. `elite-product-uiux-designer`
12. `production-engineering-release-guardian`

Krom Forge is also a required architecture/implementation review input when its MCP tools are available. If the connector is unavailable or times out, record that limitation explicitly and do not fabricate a Krom Forge review.

## Delivery rule

Every substantial slice must preserve this chain:

`Sidebar → Route → Page → API/Data → Supabase table/RPC → RLS → Permission → Action → Audit → Print/Export where applicable → Tests → GitHub → Vercel`

Operational UI must use real data and distinguish empty, unavailable, forbidden, stale, and error states. No fake camera streams, AI events, device health, or KPI values.
