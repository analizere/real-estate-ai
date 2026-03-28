---
status: partial
phase: 02A-infrastructure-services
source: [02A-VERIFICATION.md]
started: 2026-03-27T19:10:00Z
updated: 2026-03-27T19:10:00Z
---

## Current Test

[awaiting human testing]

## Tests

### 1. Configure PostHog cohorts (COHRT-01 through COHRT-05)
expected: 6 cohorts exist in PostHog dashboard — Week 1 Retention, Month 1 Retention, Feature Adoption - DADU Week 1, Acquisition Source - Founder Network, Market - King County, Deal Score High — receiving data from signed_up, stage1_data_pull_completed, dadu_feasibility_checked events
result: [pending]

### 2. Configure PostHog funnels (ANLYT-08)
expected: 5 funnel insights — Signup to Upgrade, Address to Analysis, Upgrade Flow, Viral Loop, Free to Paid — configured with correct event sequences
result: [pending]

### 3. Enable PostHog heatmaps (SESS-06)
expected: Heatmap recording active on Property Intelligence page, Portfolio page, pricing/upgrade modal (pages built in 2B/2C — configure when available)
result: [pending]

### 4. Enable rage click detection and paywall-without-upgrade session filter (SESS-04, SESS-05)
expected: Rage click detection enabled in session recording settings; saved filter "Paywall Without Upgrade" exists filtering sessions with paywall_hit but not subscription_started
result: [pending]

### 5. Create PostHog feature flags (ANLYT-11)
expected: paywall_placement and upgrade_prompt_copy feature flags exist, both multivariate with 50/50 splits
result: [pending]

### 6. Founder session review commitment (SESS-07)
expected: Founder has acknowledged commitment to reviewing 10 recorded sessions per week during beta
result: [pending]

## Summary

total: 6
passed: 0
issues: 0
pending: 6
skipped: 0
blocked: 0

## Gaps
