---
phase: 2A
slug: infrastructure-services
status: draft
nyquist_compliant: true
wave_0_complete: false
created: 2026-03-27
---

# Phase 2A — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest (if not installed, Wave 0 adds it) |
| **Config file** | vitest.config.ts (Wave 0 creates if missing) |
| **Quick run command** | `npx vitest run --reporter=verbose` |
| **Full suite command** | `npx vitest run --reporter=verbose --coverage` |
| **Estimated runtime** | ~15 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npx vitest run --reporter=verbose`
- **After every plan wave:** Run `npx vitest run --reporter=verbose --coverage`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 15 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 01-T1 | 02A-01 | 1 | TIER-01,TIER-02,TIER-03,METER-09,METER-10 | unit (TDD) | `npx vitest run tests/unit/feature-tiers.test.ts --reporter=verbose` | tests/unit/feature-tiers.test.ts | pending |
| 01-T2 | 02A-01 | 1 | TIER-05,METER-01 | unit + migration review | `npx vitest run tests/unit/schema-validation.test.ts --reporter=verbose && npm run db:generate` | tests/unit/schema-validation.test.ts | pending |
| 02-T1 | 02A-02 | 1 | ANLYT-01,ANLYT-02,ANLYT-03,SESS-01,SESS-02,SESS-03,SESS-04 | unit (config) | `npx vitest run tests/unit/posthog-config.test.ts --reporter=verbose` | tests/unit/posthog-config.test.ts | pending |
| 02-T2 | 02A-02 | 1 | ANLYT-01 | build | `npx next build` | app/layout.tsx | pending |
| 03-T1 | 02A-03 | 2 | TIER-04,TIER-06 | unit (TDD) | `npx vitest run tests/unit/gating.test.ts --reporter=verbose` | tests/unit/gating.test.ts | pending |
| 03-T2 | 02A-03 | 2 | METER-01,METER-02,METER-04,METER-05,METER-08,METER-10 | unit (TDD) | `npx vitest run tests/unit/metering.test.ts --reporter=verbose` | tests/unit/metering.test.ts | pending |
| 04-T1 | 02A-04 | 2 | DATA-01,DATA-02,DATA-03,DATA-05,DATA-06,DATA-07,DATA-08,DATA-09,DATA-10 | unit (TDD) | `npx vitest run tests/unit/enrichment.test.ts --reporter=verbose` | tests/unit/enrichment.test.ts | pending |
| 05-T1 | 02A-05 | 3 | ANLYT-04,ANLYT-11 | typecheck | `npx tsc --noEmit lib/services/posthog-events.ts app/query-provider.tsx` | lib/services/posthog-events.ts | pending |
| 05-T2 | 02A-05 | 3 | METER-08,METER-09 | build | `npx next build` | components/ui/usage-meter.tsx, components/ui/usage-indicator.tsx | pending |
| 06-T1 | 02A-06 | 4 | TIER-04,TIER-06,ANLYT-10,SESS-05,METER-01,DATA-03,DATA-10 | unit (integration) | `npx vitest run tests/unit/integration-wiring.test.ts --reporter=verbose` | tests/unit/integration-wiring.test.ts | pending |
| 06-T2 | 02A-06 | 4 | ANLYT-08,ANLYT-11 | build | `npx next build` | app/api/v1/webhooks/stripe/route.ts | pending |
| 06-T3 | 02A-06 | 4 | COHRT-01-05,ANLYT-08,SESS-04,SESS-05,SESS-06,SESS-07 | manual | PostHog dashboard verification | N/A | pending |

*Status: pending -- green -- red -- flaky*

---

## Wave 0 Requirements

- [ ] Install vitest + @vitest/coverage-v8 if not present
- [ ] Create vitest.config.ts with path aliases matching tsconfig
- [ ] Create test fixtures for mock user sessions (free/pro tier)
- [ ] Create test fixtures for mock PostHog client

*If none: "Existing infrastructure covers all phase requirements."*

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| PostHog cohorts configured in dashboard | COHRT-01-05 | PostHog UI configuration, not code | Log into PostHog -> Cohorts -> verify 5 cohorts exist with correct filters |
| PostHog funnels configured in dashboard | ANLYT-08 | PostHog UI configuration, not code | Log into PostHog -> Funnels -> verify 5 funnels exist |
| Session recording active | SESS-01 | Requires live PostHog project | Visit app -> PostHog -> Recordings -> verify sessions appear |
| Heatmaps configured | SESS-06 | PostHog UI configuration | PostHog -> Heatmaps -> verify pages configured |
| Paywall-without-upgrade session filter | SESS-05 | PostHog UI configuration | PostHog -> Session Recording -> verify saved filter for paywall_hit events exists |
| PostHog startup credits | D-22 | External process | Apply at posthog.com/startups |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [x] All tasks have `<automated>` verify or Wave 0 dependencies
- [x] Sampling continuity: no 3 consecutive tasks without automated verify
- [x] Wave 0 covers all MISSING references
- [x] No watch-mode flags
- [x] Feedback latency < 15s
- [x] `nyquist_compliant: true` set in frontmatter

**Approval:** approved
