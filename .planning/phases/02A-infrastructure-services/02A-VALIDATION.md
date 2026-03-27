---
phase: 2A
slug: infrastructure-services
status: draft
nyquist_compliant: false
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
| Filled by planner | | | | | | | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

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
| PostHog cohorts configured in dashboard | COHRT-01–05 | PostHog UI configuration, not code | Log into PostHog → Cohorts → verify 5 cohorts exist with correct filters |
| PostHog funnels configured in dashboard | ANLYT-08 | PostHog UI configuration, not code | Log into PostHog → Funnels → verify 5 funnels exist |
| Session recording active | SESS-01 | Requires live PostHog project | Visit app → PostHog → Recordings → verify sessions appear |
| Heatmaps configured | SESS-06 | PostHog UI configuration | PostHog → Heatmaps → verify pages configured |
| PostHog startup credits | D-22 | External process | Apply at posthog.com/startups |

*If none: "All phase behaviors have automated verification."*

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 15s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
