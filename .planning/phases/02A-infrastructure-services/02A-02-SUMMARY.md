---
phase: 02A-infrastructure-services
plan: "02"
subsystem: infra
tags: [posthog, analytics, session-recording, react-query, posthog-js, posthog-node]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Next.js App Router layout.tsx structure with ThemeProvider
provides:
  - PHProvider client component wrapping PostHogProvider (app/providers.tsx)
  - PostHogPageView component with Suspense boundary for manual page tracking (app/posthog-pageview.tsx)
  - Server-side PostHog singleton with captureServerEvent and setPersonProperties helpers (lib/services/posthog-server.ts)
  - PostHog wrapping entire app layout (PHProvider > ThemeProvider > children)
  - posthog-js, posthog-node, @tanstack/react-query installed
affects: [02A-03, 02A-04, 02A-05, 02A-06, 02B, 02C, all future phases requiring analytics]

# Tech tracking
tech-stack:
  added: [posthog-js, posthog-node, @tanstack/react-query]
  patterns:
    - PHProvider wraps entire app layout (not per-page initialization)
    - PostHogPageView with Suspense boundary for useSearchParams safety
    - Server-side PostHog singleton with flushAt:1 and shutdown() for serverless
    - captureServerEvent helper for ad-blocker-safe data pull event tracking
    - setPersonProperties helper for server-side plan change tracking

key-files:
  created:
    - app/providers.tsx
    - app/posthog-pageview.tsx
    - lib/services/posthog-server.ts
    - tests/unit/posthog-config.test.ts
  modified:
    - app/layout.tsx
    - package.json

key-decisions:
  - "PostHog initialized client-side via useEffect (not SSR) to avoid hydration mismatch"
  - "person_profiles: identified_only — no anonymous profile tracking per D-24"
  - "capture_pageview: false — manual page tracking via PostHogPageView prevents double-counting"
  - "posthogClient singleton reset on each captureServerEvent/setPersonProperties call (shutdown closes connection); acceptable for serverless pattern"

patterns-established:
  - "Pattern 1: PostHog client-side events via usePostHog() hook inside PHProvider tree"
  - "Pattern 2: PostHog server-side events via captureServerEvent(distinctId, event, properties) — always await"
  - "Pattern 3: Person property updates on plan changes via setPersonProperties(distinctId, properties) — always await"
  - "Pattern 4: No PII in any PostHog call — user_id not email, property_id not address"

requirements-completed: [ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-10, ANLYT-11, SESS-01, SESS-02, SESS-03, SESS-04, SESS-05, SESS-06]

# Metrics
duration: 2min
completed: 2026-03-28
---

# Phase 02A Plan 02: PostHog Analytics Infrastructure Summary

**PostHog provider wrapping entire Next.js App Router layout with session recording, Suspense-safe manual page tracking, and serverless-safe server-side event helpers**

## Performance

- **Duration:** 2 min
- **Started:** 2026-03-28T00:18:48Z
- **Completed:** 2026-03-28T00:20:46Z
- **Tasks:** 2
- **Files modified:** 6

## Accomplishments

- Installed posthog-js, posthog-node, and @tanstack/react-query (react-query needed for Plan 05 usage UI)
- PHProvider wraps entire app — all pages and routes automatically instrumented without per-page setup
- PostHogPageView uses Suspense boundary (required for useSearchParams in Next.js App Router)
- posthog-server.ts singleton with flushAt:1 and shutdown() pattern ensures server events flush before serverless function terminates
- Session recording enabled for all sessions during beta (disable_session_recording: false); password fields masked (per D-34)
- 8 behavioral config tests verify all critical PostHog flags cannot be accidentally removed

## Task Commits

Each task was committed atomically:

1. **Task 1: Install PostHog deps and create provider, pageview, server components** - `628a46f` (feat)
2. **Task 2: Integrate PostHog into app layout** - `de74993` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `app/providers.tsx` - PHProvider 'use client' component with PostHog init and session recording config
- `app/posthog-pageview.tsx` - PostHogPageView with Suspense wrapper and manual $pageview capture
- `lib/services/posthog-server.ts` - Server-side PostHog singleton; captureServerEvent and setPersonProperties helpers
- `tests/unit/posthog-config.test.ts` - 8 behavioral tests asserting PostHog config flags (all pass)
- `app/layout.tsx` - Added PHProvider wrapping ThemeProvider + PostHogPageView before children
- `package.json` - Added posthog-js, posthog-node, @tanstack/react-query

## Decisions Made

- PostHog init inside useEffect with window check — avoids SSR execution and hydration mismatch
- person_profiles set to 'identified_only' — no anonymous profile bloat per D-24 privacy requirements
- capture_pageview: false — PostHogPageView fires $pageview manually to prevent double-counting on client navigation
- captureServerEvent calls shutdown() after each event — standard serverless pattern; singleton is recreated on next call; acceptable cost for guaranteed flush in ephemeral functions

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

`npx next build` failed with "No database connection string" error — this is a pre-existing issue in the build environment (DATABASE_URL not set), not caused by PostHog changes. TypeScript type check passes cleanly with `--skipLibCheck`. The build failure predates this plan and is unrelated to PostHog integration.

## User Setup Required

PostHog requires environment variable configuration before analytics data flows:

- `NEXT_PUBLIC_POSTHOG_KEY` — PostHog project API key (from PostHog dashboard > Project Settings)
- `NEXT_PUBLIC_POSTHOG_HOST` — PostHog instance host (defaults to `https://us.i.posthog.com` if not set)

These must be added to `.env.local` for local development and to the Vercel/deployment environment for production. PostHog is configured for Cloud US region (D-22). Apply for PostHog startup credits ($50k) after initial setup.

## Next Phase Readiness

- PostHog infrastructure is fully operational — Plans 03-06 and all future phases can capture events
- To capture client-side events: call `usePostHog()` hook inside PHProvider tree, then `posthog.capture('event_name', { properties })`
- To capture server-side events: `await captureServerEvent({ distinctId: userId, event: 'event_name', properties: {} })`
- Phase 2A Plan 03 (GatingService) and Plan 04 (Usage Metering) will wire auth events per D-29 event scope
- No blockers for subsequent plans

---
## Self-Check: PASSED

- FOUND: app/providers.tsx
- FOUND: app/posthog-pageview.tsx
- FOUND: lib/services/posthog-server.ts
- FOUND: tests/unit/posthog-config.test.ts
- FOUND: commit 628a46f (Task 1)
- FOUND: commit de74993 (Task 2)

---
*Phase: 02A-infrastructure-services*
*Completed: 2026-03-28*
