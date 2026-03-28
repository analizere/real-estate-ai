---
phase: 02A-infrastructure-services
plan: 04
subsystem: data-enrichment
tags: [enrichment, stub, data-pipeline, cache-ttl, tdd, typescript]

# Dependency graph
requires:
  - phase: 02A-infrastructure-services
    plan: 01
    provides: Feature enum and tier config — no direct import but establishes service layer conventions
provides:
  - DataEnrichmentService class with permanent stage1Enrich/stage2Enrich interface contract
  - CacheSource union type: county_api | gis_api | openstreetmap | rentcast | attom | internal
  - CacheTTL union type: 180 | 30 | 2 | 0
  - EnrichedField<T> generic wrapper with value, cache_source, TTL, stale_at, missing_reason
  - Stage1EnrichmentResult with all static, semi-static, GIS, and GIS extension fields
  - Stage2EnrichmentResult with rent_estimate, comparable_sales, dadu_rules, skip_trace features
  - EnrichmentError type with ADDRESS_NOT_FOUND, COUNTY_NOT_SUPPORTED, API_TIMEOUT, PARSE_ERROR, PARTIAL codes
  - CACHE_TTL constants: STATIC 180d, SEMI_STATIC 30d, DYNAMIC 2d, NEVER 0d
  - COUNTY_QUALITY_TIERS: 4 counties with quality ratings
  - normalizeAddress() helper with title-case, abbreviation normalization, whitespace collapsing
  - MOCK_KING_COUNTY_PROFILES: 5 varied King County WA property profiles (SF5000/RSL/LR1/NR3/SF7200)
affects:
  - 02A-06 (UI): if UI tests require mock enrichment data, can import DataEnrichmentService stub
  - Phase 2B: imports DataEnrichmentService for calculator pre-population with stub data
  - Phase 5: replaces stub implementation with real API adapters against this permanent interface

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TDD with failing test commit (RED) followed by implementation (GREEN)
    - Java-style hash (shift-subtract) for deterministic but well-distributed address-to-profile mapping
    - EnrichedField<T> generic wrapper encapsulates all cache metadata per field — consistent across all data sources
    - makeField() factory function reduces boilerplate for EnrichedField construction
    - Error routing: explicit out-of-market check before street-pattern check — ensures correct error code semantics

key-files:
  created:
    - lib/services/enrichment.ts
    - lib/services/enrichment-stubs.ts
    - tests/unit/enrichment.test.ts
  modified: []

key-decisions:
  - Interface is PERMANENT (D-40) — only implementations change when Phase 5 replaces stubs with real APIs
  - Hash function changed from djb2 to Java shift-subtract for better distribution across test addresses
  - Error check order: PARTIAL trigger first, then out-of-market state check, then street pattern check — each error code has clean semantics
  - GIS extension fields (planned_expansion_zone etc.) present on stub with null values — Phase 5 populates from utility CIP documents

metrics:
  duration: ~10 minutes
  completed_date: "2026-03-28"
  tasks_completed: 1
  files_created: 3
  files_modified: 0
---

# Phase 02A Plan 04: DataEnrichmentService Summary

**One-liner:** DataEnrichmentService stub with permanent stage1/stage2 interface contract — 5 varied King County WA mock profiles, field-level cache TTL and cache_source tracking, explicit error paths, and GIS extension fields for utility expansion timeline data.

## What Was Built

Two files implement the permanent interface contract for property data enrichment:

**`lib/services/enrichment.ts`** — The core service and all exported types:
- `DataEnrichmentService` class with `stage1Enrich(address)` (free-tier boundary) and `stage2Enrich(propertyId, features[])` (paid-tier boundary)
- Full type system: `CacheSource`, `CacheTTL`, `EnrichedField<T>`, `Stage1EnrichmentResult`, `Stage2EnrichmentResult`, `Stage2Feature`, `EnrichmentError`, `CountyQualityTier`
- `CACHE_TTL` constants (180/30/2/0 days)
- `COUNTY_QUALITY_TIERS` for all 4 pilot markets
- `normalizeAddress()` helper
- Error paths: `ADDRESS_NOT_FOUND`, `COUNTY_NOT_SUPPORTED`, `PARTIAL` with `partial_data` flag

**`lib/services/enrichment-stubs.ts`** — 5 varied King County WA mock property profiles:
- SF 5000 Seattle (1965 bungalow, Robert Chen, $425k last sale)
- RSL Seattle (2005 construction, alley access, Maria Santos, $595k last sale)
- LR1 Bellevue (1978, James Whitfield, $720k last sale)
- NR3 Renton (1928 pre-war, Patricia Nguyen, alley access, $280k last sale)
- SF 7200 Redmond (2015 newer build, David Kim, $850k last sale)

Address selection is deterministic via Java-style hash — same address always returns same profile.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed hash function yielding same profile for both test addresses**
- **Found during:** GREEN phase — 2 tests failed on first run
- **Issue:** djb2 hash (5381 seed, multiply-33-XOR) produced identical profile index 4 for both '123 Main St, Seattle, WA' and '999 Pine St, Bellevue, WA' test addresses
- **Fix:** Replaced with Java-style hash `((hash << 5) - hash) + charCode` — gives profile 0 vs 4 for those addresses
- **Files modified:** `lib/services/enrichment.ts`
- **Commit:** fa03778

**2. [Rule 1 - Bug] Fixed ADDRESS_NOT_FOUND erroneously returning COUNTY_NOT_SUPPORTED**
- **Found during:** GREEN phase — 1 test failed on first run
- **Issue:** 'unknown address 99999' (no WA/OR in string) hit the `county === null && !includes('wa') && !includes('or')` COUNTY_NOT_SUPPORTED branch before reaching the street-pattern check
- **Fix:** Reordered checks — explicit out-of-market state indicators checked first (Miami FL etc.), then street pattern check (ADDRESS_NOT_FOUND for gibberish), then county resolution for remaining WA/OR addresses
- **Files modified:** `lib/services/enrichment.ts`
- **Commit:** fa03778 (same commit — fixed together)

## Acceptance Criteria Verification

All acceptance criteria from PLAN.md confirmed met:

- `lib/services/enrichment.ts` contains `export class DataEnrichmentService` — YES
- `async stage1Enrich(address: string): Promise<Stage1EnrichmentResult>` — YES
- `async stage2Enrich(propertyId: string, features: Stage2Feature[]): Promise<Stage2EnrichmentResult>` — YES
- `export type CacheSource = 'county_api' | 'gis_api' | 'openstreetmap' | 'rentcast' | 'attom' | 'internal'` — YES
- `export type EnrichedField<T>` — YES
- `export const CACHE_TTL` — YES
- `STATIC: 180` and `NEVER: 0` — YES
- `export const COUNTY_QUALITY_TIERS` — YES
- `export function normalizeAddress` — YES
- `planned_expansion_zone` and `confidence_level` in Stage1EnrichmentResult — YES
- `ADDRESS_NOT_FOUND`, `COUNTY_NOT_SUPPORTED`, `PARTIAL` error codes — YES
- `lib/services/enrichment-stubs.ts` contains `export const MOCK_KING_COUNTY_PROFILES` with 5 profiles — YES
- `tests/unit/enrichment.test.ts` exits 0 (31/31 tests pass) — YES

## Test Results

```
Test Files  1 passed (1)
Tests       31 passed (31)
Duration    ~350ms
```

## Known Stubs

The following stubs exist intentionally — this entire plan IS the stub layer for Phase 5:

- `lib/services/enrichment.ts` `stage1Enrich()` — returns mock data from `MOCK_KING_COUNTY_PROFILES`, not live county API
- `lib/services/enrichment.ts` `stage2Enrich()` — returns hardcoded rent estimates ($2400/$1200), not live Rentcast data
- GIS extension fields (`planned_expansion_zone`, `projected_timeline`, `funding_status`, `source_document`, `confidence_level`) always return `null` — Phase 5 populates from utility district CIP documents

These are intentional and documented. Phase 5 replaces stub implementations against this permanent interface.

## Self-Check: PASSED
