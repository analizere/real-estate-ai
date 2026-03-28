---
phase: 02A-infrastructure-services
plan: "05"
subsystem: analytics-ui
tags: [posthog, analytics, react-query, usage-meter, usage-indicator, account-settings]

# Dependency graph
requires:
  - phase: 02A-02
    provides: "posthog-server.ts captureServerEvent/setPersonProperties, posthog-js installed, PHProvider in layout"
  - phase: 02A-03
    provides: "getUserUsageSummary, getUserTier, authenticateAndCheckTier, logAndCheckUsage"
provides:
  - "6 PostHog lifecycle event functions scoped to Phase 2A (D-29): signed_up, signed_in, signed_out, subscription_started, subscription_cancelled, upgrade_clicked"
  - "Server-side subscription events update PostHog person properties (ANLYT-11)"
  - "GET /api/v1/usage endpoint returning per-action summary with daysUntilReset"
  - "React Query QueryProvider wrapping app layout (CLAUDE.md mandate)"
  - "useUsage hook — React Query wrapper for /api/v1/usage"
  - "UsageMeterCard component in Account Settings with progress bars per action type"
  - "UsageIndicator inline skeleton for Phase 2B consumers (D-18/D-21)"
affects:
  - 02A-06
  - 02B (UsageIndicator embeddable inline on address bar and skip trace)
  - All future phases requiring usage UI

# Tech tracking
tech-stack:
  added: []
  patterns:
    - "posthog-events.ts: client-side events via dynamic import (avoids SSR); server-side events via captureServerEvent"
    - "QueryProvider: useState-stable QueryClient with 1min staleTime and no refetchOnWindowFocus"
    - "useUsage: React Query with 1min staleTime + 5min refetchInterval for background sync"
    - "UsageMeterCard: deduplicates stage1_lookup/stage2_lookup rows (both map to 'Property Lookups')"
    - "UsageIndicator: renders nothing below 80% or during beta (all unlimited) — zero visual noise"

key-files:
  created:
    - lib/services/posthog-events.ts
    - app/query-provider.tsx
    - hooks/use-usage.ts
    - components/ui/usage-meter.tsx
    - components/ui/usage-indicator.tsx
  modified:
    - app/api/v1/usage/route.ts
    - app/layout.tsx
    - app/account/settings/page.tsx

key-decisions:
  - "posthog-events.ts uses dynamic import for posthog-js client-side events — avoids SSR execution and hydration issues in server components that may call these helpers"
  - "UsageMeterCard deduplicates stage1_lookup and stage2_lookup rows — both map to 'Property Lookups' so only first occurrence renders"
  - "enrichment.ts pre-existing build failure (Plan 04 stub types) deferred to deferred-items.md — out of scope for this plan"

requirements-completed: [ANLYT-04, ANLYT-08, ANLYT-11, SESS-07, METER-02, METER-05, METER-08, METER-09]

# Metrics
duration: 5min
completed: 2026-03-28
---

# Phase 02A Plan 05: PostHog Lifecycle Events and Usage Meter UI Summary

**6 PostHog lifecycle event helpers (D-29 scope), React Query provider, usage API evolved to per-action summary with reset date, UsageMeterCard in Account Settings, and UsageIndicator skeleton for Phase 2B inline contextual warnings**

## Performance

- **Duration:** ~5 min
- **Started:** 2026-03-28T00:33:35Z
- **Completed:** 2026-03-28T00:37:50Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments

- Created `lib/services/posthog-events.ts` with 6 type-safe lifecycle event functions scoped to Phase 2A only (D-29). Server-side subscription events (`trackSubscriptionStarted`, `trackSubscriptionCancelled`) call `captureServerEvent` + `setPersonProperties` for ad-blocker-safe billing analytics (ANLYT-11). Client-side events use dynamic import of posthog-js to avoid SSR execution.
- Created `app/query-provider.tsx` — React Query `QueryProvider` wrapping the full app inside `PHProvider`, satisfying CLAUDE.md mandate for React Query on all client-side data fetching.
- Evolved `app/api/v1/usage/route.ts` from raw history endpoint to structured summary endpoint calling `getUserUsageSummary()` + `getUserTier()`, returning `{ usage, plan, daysUntilReset, resetsAt }`.
- Created `hooks/use-usage.ts` — React Query hook with 1-minute staleTime and 5-minute background refetch interval. No raw fetch in components.
- Created `components/ui/usage-meter.tsx` — `UsageMeterCard` with loading (Skeleton), error, empty, beta (all unlimited), and normal states. Progress bar colors per UI-SPEC: accent (0–79%), yellow-600 (80–99%), destructive (100%). All 10 UI-SPEC copy strings present verbatim.
- Created `components/ui/usage-indicator.tsx` — `UsageIndicator` inline skeleton for Phase 2B consumers. Renders nothing below 80% (no visual noise). Yellow badge at 80–99%, red badge at 100%. Renders nothing during beta (unlimited). Ready to embed at `<UsageIndicator actionType="stage2_lookup" />`.
- Wired `UsageMeterCard` into `app/account/settings/page.tsx` below `SubscriptionStatusCard`, above the Profile section Separator, per UI-SPEC placement.

## Task Commits

Each task was committed atomically:

1. **Task 1: Create PostHog lifecycle events and usage API endpoint** — `67ed3e1` (feat)
2. **Task 2: Build UsageMeter, UsageIndicator skeleton, and integrate into Account Settings** — `68e7e8f` (feat)

## Files Created/Modified

- `lib/services/posthog-events.ts` — 6 lifecycle event helpers; client-side via posthog-js dynamic import; server-side via captureServerEvent + setPersonProperties
- `app/query-provider.tsx` — QueryProvider with stable QueryClient (useState initialization)
- `app/api/v1/usage/route.ts` — Evolved from raw history to structured summary with daysUntilReset
- `app/layout.tsx` — Added QueryProvider import + `<QueryProvider>` wrapping ThemeProvider inside PHProvider
- `hooks/use-usage.ts` — React Query hook for /api/v1/usage
- `components/ui/usage-meter.tsx` — UsageMeterCard with all states; exact UI-SPEC copy; h-2 progress bars
- `components/ui/usage-indicator.tsx` — UsageIndicator inline skeleton; zero noise below 80%; yellow/red badges above threshold
- `app/account/settings/page.tsx` — Added UsageMeterCard import and placement

## Decisions Made

- `posthog-events.ts` uses `import('posthog-js').then(...)` (dynamic import) for client-side events rather than top-level import — avoids SSR execution in any server component that might statically import this file
- `UsageMeterCard` deduplicates rows where multiple action types map to the same display name (stage1_lookup + stage2_lookup both render as "Property Lookups") — prevents duplicate rows confusing users
- Pre-existing `enrichment.ts` build failure from Plan 04 stub types is out of scope — deferred to `deferred-items.md`

## Deviations from Plan

### Pre-existing issue handled per Scope Boundary rule

**[Pre-existing - Out of Scope] enrichment.ts TypeScript strict mode errors**
- **Found during:** Task 2 build verification
- **Issue:** `npx next build` fails on `lib/services/enrichment.ts` lines 342–360 — stub implementation uses `makeField(null, ...)` which conflicts with non-nullable EnrichedProperty field types
- **Scope determination:** Pre-existing issue from Plan 04 (DataEnrichmentService stub). Present before Plan 05 execution. Not caused by Plan 05 changes (verified by git stash test).
- **Action taken:** Logged to `deferred-items.md` per scope boundary rules. `npx tsc --noEmit --skipLibCheck` passes cleanly — all Plan 05 files type-check correctly.
- **Deferred to:** Plan 05 deferred-items.md (resolution expected in Phase 05 enrichment implementation)

### Rebase required

**[Worktree Setup] git rebase main before execution**
- Worktree was based on an older commit lacking Plans 02, 03, 04 artifacts. Standard worktree setup step — not a plan deviation.

## Known Stubs

`UsageIndicator` is a complete implementation, not a stub. It is fully functional — it fetches usage data via `useUsage()` and renders the correct badge state. It is described as a "skeleton component" in the plan meaning it is ready to be embedded by Phase 2B feature components, not that it is incomplete.

No placeholders, hardcoded empty values, or TODO stubs exist in created/modified files.

---

## Self-Check: PASSED

- FOUND: lib/services/posthog-events.ts
- FOUND: app/query-provider.tsx
- FOUND: app/api/v1/usage/route.ts
- FOUND: app/layout.tsx
- FOUND: hooks/use-usage.ts
- FOUND: components/ui/usage-meter.tsx
- FOUND: components/ui/usage-indicator.tsx
- FOUND: app/account/settings/page.tsx

---
*Phase: 02A-infrastructure-services*
*Completed: 2026-03-28*
