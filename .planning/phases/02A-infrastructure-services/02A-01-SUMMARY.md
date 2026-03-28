---
phase: 02A-infrastructure-services
plan: 01
subsystem: database
tags: [drizzle, postgres, feature-flags, metering, typescript-enums]

# Dependency graph
requires:
  - phase: 01-foundation
    provides: Drizzle ORM + Neon database connection, auth schema with user table FK target
provides:
  - Feature enum (10 values) and FEATURE_TIER_CONFIG — single source of truth for all feature gating
  - ActionType enum and ACTION_COST_ESTIMATES — metered action types with cost estimates
  - TIER_LIMITS per plan (free/pro) with beta=unlimited defaults
  - BETA_MODE flag for metering service beta enforcement bypass
  - GatingResponse type with overageAvailable field
  - feature_overrides Drizzle table (12 columns, 3 indexes) for hybrid GatingService overrides
  - Expanded usage_log table (5 new columns: actionType, costEstimateCents, apiProvider, metadata, planAtTimeOfAction)
  - Migration SQL 0001 with safe RENAME COLUMN (not DROP+ADD) for lookup_type->action_type
affects:
  - 02A-02 (PostHog): no direct dependency
  - 02A-03 (GatingService): imports Feature enum, FEATURE_TIER_CONFIG, TIER_LIMITS, GatingResponse from lib/config/feature-tiers.ts
  - 02A-04 (MeteringService): imports ActionType, ACTION_COST_ESTIMATES, BETA_MODE, TIER_LIMITS; uses expanded usageLog schema
  - 02A-05 (DataEnrichmentService): no direct dependency on this plan
  - 02A-06 (UI): no direct dependency

# Tech tracking
tech-stack:
  added: []
  patterns:
    - TypeScript string enum as database validation source of truth (Feature, ActionType)
    - TIER_LIMITS uses 'unlimited' string literal to signal no-enforcement (distinct from 0=blocked)
    - BETA_MODE constant checked by metering service to bypass all limit enforcement
    - Drizzle index() API using array syntax (Drizzle 0.45.x pattern — not object)
    - Custom migration (--custom flag) for column rename requiring RENAME COLUMN over DROP+ADD

key-files:
  created:
    - lib/config/feature-tiers.ts
    - lib/schema/feature-overrides.ts
    - tests/unit/feature-tiers.test.ts
    - tests/unit/schema-validation.test.ts
    - drizzle/0001_add_feature_overrides_expand_usage_log.sql
    - drizzle/meta/0001_snapshot.json
  modified:
    - lib/schema/usage-log.ts
    - lib/schema/index.ts
    - drizzle/meta/_journal.json

key-decisions:
  - "Used double-quote string enum values per TypeScript project conventions (consistent with existing codebase)"
  - "Used drizzle-kit --custom migration for column rename: interactive TTY prompts in non-TTY environments would generate DROP+ADD; manual SQL ensures safe RENAME COLUMN"
  - "Schema tests use getTableColumns() and getTableName() from drizzle-orm — the correct Drizzle API for runtime schema inspection (not ._ internal property)"
  - "TIER_LIMITS uses string keys matching Feature enum values (not the enum members) so service layer can do dynamic lookup by plan+featureValue string"

patterns-established:
  - "Pattern 1: Single source of truth for feature names — Feature enum in lib/config/feature-tiers.ts; never hardcode feature name strings outside this file"
  - "Pattern 2: 'unlimited' string literal in TIER_LIMITS means check still runs but never blocks — distinct from 0 (blocked) and missing (not metered)"
  - "Pattern 3: Schema tests use drizzle-orm getTableColumns()/getTableName() utility functions for type-safe column inspection"

requirements-completed: [TIER-01, TIER-02, TIER-03, TIER-05, TIER-06, TIER-07, METER-01, METER-09, METER-10]

# Metrics
duration: 12min
completed: 2026-03-27
---

# Phase 02A Plan 01: Feature Tier Config and Database Schemas Summary

**Feature enum with 10 tiers, hybrid GatingService config, feature_overrides table, and expanded usage_log schema as the infrastructure foundation for all Phase 2A gating and metering**

## Performance

- **Duration:** ~12 min
- **Started:** 2026-03-27T17:19:00Z
- **Completed:** 2026-03-27T17:22:00Z
- **Tasks:** 2
- **Files modified:** 8

## Accomplishments
- Created `lib/config/feature-tiers.ts` as the single source of truth for all feature gating — Feature enum, tier assignments, action types, cost estimates, plan limits, BETA_MODE flag, and GatingResponse type
- Created `lib/schema/feature-overrides.ts` with full 12-column Drizzle table and 3 Postgres indexes for hybrid GatingService override lookups
- Expanded `lib/schema/usage-log.ts` from 6 to 11 columns with actionType rename (safe RENAME COLUMN migration), costEstimateCents, apiProvider, metadata, propertyId, planAtTimeOfAction
- 30 unit tests across both tasks, all passing

## Task Commits

Each task was committed atomically:

1. **Task 1: Create feature tier configuration and types** - `26b5630` (feat) + test RED phase
2. **Task 2: Create feature_overrides schema and expand usage_log schema** - `fbc1e32` (feat)
3. **Drizzle snapshot metadata** - `bbcb918` (chore)

## Files Created/Modified
- `lib/config/feature-tiers.ts` - Feature enum, FEATURE_TIER_CONFIG, ActionType enum, ACTION_COST_ESTIMATES, TIER_LIMITS, BETA_MODE, GatingResponse type
- `lib/schema/feature-overrides.ts` - Drizzle table for per-user/global/cohort feature overrides with 3 indexes
- `lib/schema/usage-log.ts` - Expanded usage_log with 5 new columns, lookupType renamed to actionType
- `lib/schema/index.ts` - Added feature-overrides re-export
- `drizzle/0001_add_feature_overrides_expand_usage_log.sql` - Safe migration using RENAME COLUMN
- `drizzle/meta/0001_snapshot.json` - Drizzle state snapshot
- `tests/unit/feature-tiers.test.ts` - 15 tests for Feature enum, tier config, limits, GatingResponse
- `tests/unit/schema-validation.test.ts` - 15 tests for both schema exports and columns

## Decisions Made
- Used `drizzle-kit generate --custom` to bypass interactive TTY prompt for column rename — generated a custom migration manually with `ALTER TABLE usage_log RENAME COLUMN lookup_type TO action_type` instead of the default DROP+ADD pair that would destroy existing data
- Schema validation tests use `getTableColumns()` and `getTableName()` from `drizzle-orm` (not internal `._` property) — this is the correct public Drizzle API for runtime schema introspection

## Deviations from Plan

None — plan executed exactly as written.

The interactive TTY issue with `db:generate` was anticipated by the plan (which warned to review and manually edit destructive migration SQL). The custom migration approach is aligned with the plan's intent — RENAME COLUMN is confirmed present and DROP COLUMN is absent.

## Issues Encountered
- `drizzle-kit generate` attempted interactive TTY prompt in non-TTY environment when detecting column rename — resolved by using `--custom` flag to generate an empty migration file, then writing the SQL manually with the correct RENAME COLUMN approach

## Known Stubs

None — this plan creates configuration and schema files only (no data-fetching or UI components). All exports are fully functional TypeScript/Drizzle artifacts.

## Next Phase Readiness
- `lib/config/feature-tiers.ts` exports are ready for import by GatingService (02A-03) and MeteringService (02A-04)
- `lib/schema/feature-overrides.ts` table is ready for GatingService override queries in 02A-03
- `lib/schema/usage-log.ts` expanded schema is ready for full metering in 02A-04
- Migration SQL 0001 must be applied to production DB (`npm run db:migrate`) before any code using the new columns executes

---
*Phase: 02A-infrastructure-services*
*Completed: 2026-03-27*
