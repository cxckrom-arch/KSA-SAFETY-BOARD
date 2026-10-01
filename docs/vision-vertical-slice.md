# Safety Vision — Vertical Slice Blueprint

## Scope

First production slice for the KSA SAFETY BOARD Safety Vision command center:

- Vision route and sidebar traceability
- Real Supabase tables for devices, cameras, alerts, recordings, restricted zones, and rules
- Organization-scoped RLS and role-aware write boundaries
- Truthful command-center UI with no fake counts, streams, thumbnails, or alerts
- White print boundary remains isolated from Vision monitoring surfaces

## Data chain

`Camera/Sensor → ESP/Edge Device → Network/Gateway → Vision Processing → Safety Alert → HSE Action`

Raw RTSP credentials and browser-incompatible stream URLs are not stored in or returned to the browser. The initial schema stores gateway references and health metadata only.

## Routes

- `/admin/vision` — Vision command center
- Permission: `vision.dashboard.view`
- Resource: `vision_dashboard`
- `/admin/vision/devices` — read-only ESP/Edge device directory (`vision.devices.view`)
- `/admin/vision/cameras` — read-only camera directory (`vision.cameras.view`)
- `/admin/vision/alerts` — read-only alert center (`vision.alerts.read`)

Future routes are planned but not exposed until implemented: facility map, rules, recordings, analytics, and audit log. The camera, device, and alert directories are now implemented as truthful read-only slices.

## UI direction

Industrial command-center surface: dark operational rail, calm paper canvas, amber attention marker, explicit Online/Offline/Warning/Degraded/Maintenance/Disabled/Unknown labels, and no decorative live-feed placeholders.

## Acceptance criteria

- Vision entities exist in Supabase with organization foreign keys, indexes, checks, and RLS.
- Every Vision sidebar entry maps to a real route and permission.
- The dashboard distinguishes `0 records` from `Data unavailable` and does not fabricate metrics.
- Camera health distinguishes network reachability, stream health, and analytics health.
- A camera tile never claims Live without a real browser-compatible stream capability.
- UI supports Arabic RTL and English LTR, dark application mode, and responsive single-camera priority on mobile.
- API/database implementation does not expose RTSP passwords, device tokens, or service-role credentials.
- Print routes remain independent and white.
