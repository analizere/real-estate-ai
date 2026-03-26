---
phase: 01-foundation
plan: 04
subsystem: payments
tags: [stripe, billing, freemium, gating, usage-metering, better-auth]

# Dependency graph
requires:
  - phase: 01-foundation-01
    provides: Better Auth with Stripe plugin, Drizzle DB, usage_log schema
provides:
  - Reusable freemium gating helper (authenticateAndCheckTier, requirePro)
  - Usage logging service with pre-insert pattern (logUsage, updateUsageStatus)
  - Billing service (cancelSubscription, getSubscriptionStatus)
  - Billing API endpoints (checkout, portal, status)
  - Usage API endpoint (GET /api/v1/usage)
affects: [phase-02, phase-04, phase-05, phase-06]

# Tech tracking
tech-stack:
  added: []
  patterns: [freemium-gating, usage-pre-insert, service-layer-delegation]

key-files:
  created:
    - lib/services/gating.ts
    - lib/services/usage.ts
    - lib/services/billing.ts
    - app/api/v1/billing/checkout/route.ts
    - app/api/v1/billing/portal/route.ts
    - app/api/v1/billing/status/route.ts
    - app/api/v1/usage/route.ts
  modified: []

key-decisions:
  - "Used auth.api.upgradeSubscription (not createSubscription) matching Better Auth Stripe plugin 1.5.6 API"
  - "Portal route uses auth.api.createBillingPortal instead of direct Stripe SDK -- keeps all subscription logic through Better Auth"
  - "Usage log ordered by descending createdAt for most-recent-first display"

patterns-established:
  - "Freemium gating pattern: authenticateAndCheckTier() returns discriminated union with authorized/isPro flags; requirePro() returns 402 with upgrade_required error"
  - "Usage pre-insert pattern: logUsage() inserts with status=pending BEFORE paid operation; updateUsageStatus() marks success/failed after"
  - "Route handler delegation pattern: all business logic in lib/services/, route handlers only handle auth + request/response mapping"

requirements-completed: [BILL-01, BILL-02, BILL-03, BILL-04, BILL-05, BILL-06, API-01, API-03]

# Metrics
duration: 3min
completed: 2026-03-26
---

# Phase 01 Plan 04: Billing and Freemium Gating Summary

**Server-enforced freemium gating with 402 upgrade prompts, Stripe checkout/portal via Better Auth, and usage pre-insert metering pattern**

## Performance

- **Duration:** 3 min
- **Started:** 2026-03-26T02:20:01Z
- **Completed:** 2026-03-26T02:23:45Z
- **Tasks:** 2
- **Files modified:** 7

## Accomplishments
- Reusable freemium gating service with authenticateAndCheckTier/requirePro that returns 402 with structured upgrade_required error for free-tier users
- Usage logging service with pre-insert pattern (status: pending before operation, updated after) per STATE.md metering requirement
- Four versioned API endpoints under /api/v1/ for checkout, portal, status, and usage -- all server-auth via auth.api.getSession
- All business logic encapsulated in lib/services/ per architectural rules -- route handlers are thin auth + delegation wrappers

## Task Commits

Each task was committed atomically:

1. **Task 1: Build gating and usage logging service functions** - `75d07ad` (feat)
2. **Task 2: Build billing and usage API route handlers** - `10e7f4f` (feat)

## Files Created/Modified
- `lib/services/gating.ts` - Freemium gating: authenticateAndCheckTier, requirePro (402), getSubscriptionStatus
- `lib/services/usage.ts` - Usage logging: logUsage (pre-insert), updateUsageStatus, getUserUsage
- `lib/services/billing.ts` - Billing: cancelSubscription, re-exports getSubscriptionStatus
- `app/api/v1/billing/checkout/route.ts` - POST: Stripe checkout via auth.api.upgradeSubscription
- `app/api/v1/billing/portal/route.ts` - POST: Stripe billing portal via auth.api.createBillingPortal
- `app/api/v1/billing/status/route.ts` - GET: subscription tier/periodEnd/cancelAtPeriodEnd
- `app/api/v1/usage/route.ts` - GET: user usage log entries

## Decisions Made
- Used `auth.api.upgradeSubscription` (not createSubscription) to match Better Auth Stripe plugin 1.5.6 API surface
- Portal route delegates to `auth.api.createBillingPortal` instead of direct Stripe SDK to keep all subscription management through Better Auth
- Usage log query ordered by descending createdAt for most-recent-first display in dashboards

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed Better Auth API method names**
- **Found during:** Task 2 (Route handlers)
- **Issue:** Plan specified `auth.api.createSubscription` but Better Auth Stripe plugin 1.5.6 uses `auth.api.upgradeSubscription`
- **Fix:** Used correct method `upgradeSubscription` for checkout and `createBillingPortal` for portal
- **Files modified:** app/api/v1/billing/checkout/route.ts, app/api/v1/billing/portal/route.ts
- **Verification:** npx tsc --noEmit passes
- **Committed in:** 10e7f4f (Task 2 commit)

**2. [Rule 1 - Bug] Fixed cancelSubscription API call signature**
- **Found during:** Task 1 (Service functions)
- **Issue:** Plan passed `{ body: { id } }` but Better Auth expects `{ body: { returnUrl }, query: { subscriptionId } }`
- **Fix:** Updated to match the type signature from Better Auth Stripe plugin
- **Files modified:** lib/services/billing.ts
- **Verification:** npx tsc --noEmit passes
- **Committed in:** 75d07ad (Task 1 commit)

---

**Total deviations:** 2 auto-fixed (2 bugs -- incorrect API method names/signatures from plan)
**Impact on plan:** Both fixes necessary for TypeScript compilation and runtime correctness. No scope creep.

## Issues Encountered
- Pre-existing TypeScript error in app/layout.tsx (missing @/components/ui/sonner module) -- out of scope, belongs to another plan

## Known Stubs
None -- all services are fully wired to Better Auth and Drizzle. No placeholder data or mock implementations.

## User Setup Required
None - no additional external service configuration required beyond what Plan 01 already set up (Stripe keys, database).

## Next Phase Readiness
- Gating pattern ready for every future paid Route Handler to use requirePro()
- Usage metering ready for Phase 4-6 paid data lookups (logUsage before operation, updateUsageStatus after)
- Billing endpoints ready for Phase 2 account settings UI integration

## Self-Check: PASSED

All 7 created files verified present. Both task commits (75d07ad, 10e7f4f) verified in git log.

---
*Phase: 01-foundation*
*Completed: 2026-03-26*
