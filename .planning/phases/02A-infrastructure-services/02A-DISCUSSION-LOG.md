# Phase 2A: Infrastructure Services - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-27
**Phase:** 02A-infrastructure-services
**Areas discussed:** Gating configuration, PostHog setup, DataEnrichmentService scope, Metering & limit UX

---

## All Areas (Single Response)

| Option | Description | Selected |
|--------|-------------|----------|
| Discuss individual areas | Interactive deep-dive per gray area | |
| Use existing requirements as source of truth | REQUIREMENTS.md and CLAUDE.md already document all architectural decisions | ✓ |

**User's choice:** "Read the REQUIREMENTS.md and CLAUDE.md files to answer these questions — the architectural decisions are already documented there."

**Notes:** User provided specific mappings:
- Gating service → central config per TIER-01 through TIER-07
- PostHog → cloud-hosted, event taxonomy per ANLYT-01 through ANLYT-11
- DataEnrichmentService → stub implementations with correct interface per DATA-08
- Metering warnings → 80% banner in account settings, 100% blocking message per METER-08

All four gray areas resolved in a single answer by reference to existing documentation. No interactive discussion needed.

---

## Claude's Discretion

- DataEnrichmentService internal architecture pattern
- PostHog SDK version and init pattern
- Gating config storage format (TS/JSON/DB)
- Schema migration strategy for usage_log expansion
- File organization for new services

## Deferred Ideas

None.
