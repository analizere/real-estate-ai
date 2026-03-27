# Phase 2A: Infrastructure Services - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 02A-infrastructure-services
**Areas discussed:** Gating configuration, PostHog setup, DataEnrichmentService scope, Metering & limit UX, Event scoping

---

## Gating Configuration

| Option | Description | Selected |
|--------|-------------|----------|
| TS config only | Single TypeScript config file defines all tier assignments | |
| Database table only | All gating rules in database for runtime changes | |
| Hybrid (TS config + DB overrides) | TS config as base, database override table for per-user/per-feature/per-cohort overrides | ✓ |

**User's choice:** Hybrid GatingService with precedence: user-level override > global override > config file

**Notes:** User provided complete override table schema including scope enum (user/global/cohort), expiration support, audit fields (granted_by, reason), and soft-delete for expired overrides. Feature names validated against TS enum as single source of truth. GatingService response must include `overageAvailable: boolean` from day one (always false in MVP). Cache gating results with 5-minute TTL per user session.

---

## PostHog Setup

| Option | Description | Selected |
|--------|-------------|----------|
| PostHog Cloud (US region) | Hosted by PostHog, US data residency | ✓ |
| Self-hosted | Full data control, added ops burden | |

**User's choice:** Cloud, US region. Apply for $50k startup credits.

**Notes:** All sessions recorded during first 90 days. No PII in any events. Server-side events for data pulls, client-side for user interactions. Person properties updated server-side on plan changes.

---

## PostHog Event Scoping

| Option | Description | Selected |
|--------|-------------|----------|
| Pre-instrument all events | Wire up all ANLYT events in 2A even for features not yet built | |
| Phase-scoped instrumentation | Only instrument events for features that exist in this phase | ✓ |

**User's choice:** Phase-scoped. 2A instruments only: signed_up, signed_in, signed_out, subscription_started, subscription_cancelled, upgrade_clicked. Calculator events in 2B, portfolio events in 2C, DADU events in Phase 4.

**Notes:** User emphasized this twice — do not pre-instrument events for features that don't exist yet.

---

## DataEnrichmentService Scope

| Option | Description | Selected |
|--------|-------------|----------|
| Interfaces/types only | Just the TypeScript contracts, no implementation | |
| Stub with static mock data | Returns same mock data for every address | |
| Stub with varied realistic mock data | Returns varied King County WA mock data based on address input | ✓ |

**User's choice:** Stub with varied realistic mock data, basic address normalization, and error handling patterns (not just happy path).

**Notes:** Interface contract (stage1Enrich/stage2Enrich) is permanent — Phase 5 swaps implementation only. Must include realistic field values: lot size, zoning code, beds/baths, sqft, year built, owner name, last sale date/price, tax assessed value, parcel boundaries.

---

## Metering & Limit UX

| Option | Description | Selected |
|--------|-------------|----------|
| Global account limit | Single limit across all action types | |
| Per-action-type independent limits | Each action type has its own limit, hitting one never blocks another | ✓ |

**User's choice:** Independent per-action-type limits with contextual UX.

**Notes:** 80% warning surfaces both inline on the relevant feature AND in Account Settings. 100% block is contextual (only on the exhausted action, never global lockout). Usage tracker in Account Settings shows all metered actions with current usage, limit, and "resets in X days." Inline indicators on specific features (e.g., address search bar shows lookup count).

---

## Claude's Discretion

- DataEnrichmentService internal architecture (class vs module)
- PostHog SDK version and init pattern
- Schema migration strategy for usage_log expansion
- File organization for new services
- Background job framework for expired-override cleanup

## Deferred Ideas

None.
