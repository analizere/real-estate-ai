---
phase: 1
slug: foundation
status: draft
nyquist_compliant: false
wave_0_complete: false
created: 2026-03-25
---

# Phase 1 — Validation Strategy

> Per-phase validation contract for feedback sampling during execution.

---

## Test Infrastructure

| Property | Value |
|----------|-------|
| **Framework** | vitest |
| **Config file** | vitest.config.ts (Wave 0 installs) |
| **Quick run command** | `npm run test:unit` |
| **Full suite command** | `npm run test` |
| **Estimated runtime** | ~30 seconds |

---

## Sampling Rate

- **After every task commit:** Run `npm run test:unit`
- **After every plan wave:** Run `npm run test`
- **Before `/gsd:verify-work`:** Full suite must be green
- **Max feedback latency:** 30 seconds

---

## Per-Task Verification Map

| Task ID | Plan | Wave | Requirement | Test Type | Automated Command | File Exists | Status |
|---------|------|------|-------------|-----------|-------------------|-------------|--------|
| 1-01-01 | 01 | 0 | AUTH-01 | unit | `npm run test:unit` | ❌ W0 | ⬜ pending |
| 1-01-02 | 01 | 0 | AUTH-02 | unit | `npm run test:unit` | ❌ W0 | ⬜ pending |
| 1-01-03 | 01 | 0 | AUTH-03 | unit | `npm run test:unit` | ❌ W0 | ⬜ pending |
| 1-01-04 | 01 | 0 | AUTH-04 | unit | `npm run test:unit` | ❌ W0 | ⬜ pending |
| 1-01-05 | 01 | 0 | AUTH-05 | unit | `npm run test:unit` | ❌ W0 | ⬜ pending |
| 1-02-01 | 02 | 0 | BILL-01 | unit | `npm run test:unit` | ❌ W0 | ⬜ pending |
| 1-02-02 | 02 | 0 | BILL-02 | unit | `npm run test:unit` | ❌ W0 | ⬜ pending |
| 1-02-03 | 02 | 0 | BILL-03 | unit | `npm run test:unit` | ❌ W0 | ⬜ pending |
| 1-02-04 | 02 | 0 | BILL-04 | unit | `npm run test:unit` | ❌ W0 | ⬜ pending |
| 1-02-05 | 02 | 0 | BILL-05 | unit | `npm run test:unit` | ❌ W0 | ⬜ pending |
| 1-02-06 | 02 | 0 | BILL-06 | unit | `npm run test:unit` | ❌ W0 | ⬜ pending |
| 1-03-01 | 03 | 0 | API-01 | unit | `npm run test:unit` | ❌ W0 | ⬜ pending |
| 1-03-02 | 03 | 0 | API-02 | unit | `npm run test:unit` | ❌ W0 | ⬜ pending |
| 1-03-03 | 03 | 0 | API-03 | unit | `npm run test:unit` | ❌ W0 | ⬜ pending |

*Status: ⬜ pending · ✅ green · ❌ red · ⚠️ flaky*

---

## Wave 0 Requirements

- [ ] `vitest.config.ts` — test framework configuration
- [ ] `tests/unit/auth.test.ts` — stubs for AUTH-01 through AUTH-05
- [ ] `tests/unit/billing.test.ts` — stubs for BILL-01 through BILL-06
- [ ] `tests/unit/api.test.ts` — stubs for API-01 through API-03
- [ ] `tests/fixtures/index.ts` — shared test fixtures

---

## Manual-Only Verifications

| Behavior | Requirement | Why Manual | Test Instructions |
|----------|-------------|------------|-------------------|
| Google OAuth sign-in flow | AUTH-01 | Requires browser + real OAuth redirect | Click "Sign in with Google", complete OAuth flow, verify session created |
| Stripe checkout redirect | BILL-01 | Requires browser + Stripe test mode | Click subscribe, complete Stripe checkout, verify subscription record created |
| Email delivery (verification + reset) | AUTH-02, AUTH-03 | Requires email provider + inbox access | Trigger email, check Resend dashboard for delivery, verify link works |
| Stripe webhook delivery | BILL-03, BILL-04 | Requires ngrok or deployed URL | Use Stripe CLI to forward webhooks locally, verify subscription state transitions |

---

## Validation Sign-Off

- [ ] All tasks have `<automated>` verify or Wave 0 dependencies
- [ ] Sampling continuity: no 3 consecutive tasks without automated verify
- [ ] Wave 0 covers all MISSING references
- [ ] No watch-mode flags
- [ ] Feedback latency < 30s
- [ ] `nyquist_compliant: true` set in frontmatter

**Approval:** pending
