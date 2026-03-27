---
phase: 02A-infrastructure-services
plan: 01
type: execute
wave: 1
depends_on: []
files_modified:
  - lib/config/feature-tiers.ts
  - lib/schema/feature-overrides.ts
  - lib/schema/usage-log.ts
  - lib/schema/index.ts
  - tests/unit/feature-tiers.test.ts
  - tests/unit/schema-validation.test.ts
autonomous: true
requirements: [TIER-01, TIER-02, TIER-03, TIER-05, TIER-06, TIER-07, METER-01, METER-09, METER-10]

must_haves:
  truths:
    - "A single TypeScript config file defines all feature-to-tier assignments (Tier 1, 2, 3)"
    - "Feature names are a TypeScript enum that is the single source of truth"
    - "Per-tier action limits are defined in config with beta=unlimited defaults"
    - "Feature overrides schema exists with all D-04 columns and D-05 indexes"
    - "Expanded usage_log schema has cost_estimate_cents, api_provider, metadata, plan_at_time_of_action columns"
  artifacts:
    - path: "lib/config/feature-tiers.ts"
      provides: "Feature enum, FEATURE_TIER_CONFIG, TIER_LIMITS, ACTION_TYPES enum, ACTION_COST_ESTIMATES"
      exports: ["Feature", "FEATURE_TIER_CONFIG", "TIER_LIMITS", "ActionType", "ACTION_COST_ESTIMATES", "GatingResponse"]
    - path: "lib/schema/feature-overrides.ts"
      provides: "feature_overrides Drizzle table with indexes"
      exports: ["featureOverrides"]
    - path: "lib/schema/usage-log.ts"
      provides: "Expanded usage_log table with new columns"
      exports: ["usageLog"]
  key_links:
    - from: "lib/config/feature-tiers.ts"
      to: "lib/services/gating.ts"
      via: "Feature enum import"
      pattern: "import.*Feature.*from.*feature-tiers"
    - from: "lib/schema/feature-overrides.ts"
      to: "lib/schema/index.ts"
      via: "re-export"
      pattern: 'export.*from.*feature-overrides'
---

<objective>
Create the foundational configuration and database schemas that all other Phase 2A plans depend on: the Feature enum and tier config (single source of truth for gating), the feature_overrides Drizzle table, and the expanded usage_log schema.

Purpose: Every subsequent plan in this phase imports from these files. Without the Feature enum, tier config, and schemas, the gating service, metering service, and DataEnrichmentService cannot be built.
Output: `lib/config/feature-tiers.ts`, `lib/schema/feature-overrides.ts`, evolved `lib/schema/usage-log.ts`, updated `lib/schema/index.ts`, unit tests.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02A-infrastructure-services/02A-CONTEXT.md
@.planning/phases/02A-infrastructure-services/02A-RESEARCH.md

<interfaces>
<!-- Existing schema patterns to follow -->

From lib/schema/usage-log.ts (current):
```typescript
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth";

export const usageLog = pgTable("usage_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  lookupType: text("lookup_type").notNull(),
  propertyAddress: text("property_address"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

From lib/schema/index.ts (current):
```typescript
export * from "./auth";
export * from "./usage-log";
```

From lib/schema/auth.ts — imports `user` table used as FK reference.
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create feature tier configuration and types</name>
  <files>lib/config/feature-tiers.ts, tests/unit/feature-tiers.test.ts</files>
  <read_first>
    - lib/services/gating.ts (current binary gating — understand existing patterns)
    - lib/schema/usage-log.ts (current schema — see column naming conventions)
    - .planning/phases/02A-infrastructure-services/02A-CONTEXT.md (D-01 through D-17 decisions)
    - .planning/phases/02A-infrastructure-services/02A-RESEARCH.md (Pattern 1: Hybrid GatingService code examples)
  </read_first>
  <behavior>
    - Test: Feature enum contains all 10 features: STAGE1_LOOKUP, STAGE2_LOOKUP, RENT_ESTIMATE, DADU_FEASIBILITY, SAVE_ANALYSIS, EXPORT_PDF, SHARE_LINK, SKIP_TRACE, UNLIMITED_SAVES, SENSITIVITY_ANALYSIS
    - Test: FEATURE_TIER_CONFIG maps every Feature enum value to tier 1, 2, or 3
    - Test: FEATURE_TIER_CONFIG assigns STAGE1_LOOKUP to tier 1 (always free)
    - Test: FEATURE_TIER_CONFIG assigns RENT_ESTIMATE to tier 2 (preview free)
    - Test: FEATURE_TIER_CONFIG assigns STAGE2_LOOKUP to tier 3 (Pro only)
    - Test: TIER_LIMITS has entries for both 'free' and 'pro' plans
    - Test: TIER_LIMITS.free[Feature.STAGE1_LOOKUP] is 'unlimited' (beta override per D-16)
    - Test: TIER_LIMITS.pro[Feature.STAGE2_LOOKUP] is 50 (per METER-09)
    - Test: TIER_LIMITS.pro[Feature.SKIP_TRACE] is 10 (per METER-09)
    - Test: ActionType enum includes: address_lookup_stage1, address_lookup_stage2, rent_estimate_requested, dadu_feasibility_checked, skip_trace_requested, analysis_saved, analysis_exported_pdf, analysis_shared_link, list_created, list_exported, deal_report_generated
    - Test: ACTION_COST_ESTIMATES maps each ActionType to a number (cents)
    - Test: GatingResponse type has fields: allowed, reason, action, overageAvailable
    - Test: Every Feature enum value has a corresponding entry in FEATURE_TIER_CONFIG (no orphans)
  </behavior>
  <action>
Create `lib/config/feature-tiers.ts` with the following exact contents:

1. `Feature` enum (string enum) with 10 values per D-09:
   - STAGE1_LOOKUP = 'stage1_lookup'
   - STAGE2_LOOKUP = 'stage2_lookup'
   - RENT_ESTIMATE = 'rent_estimate'
   - DADU_FEASIBILITY = 'dadu_feasibility'
   - SAVE_ANALYSIS = 'save_analysis'
   - EXPORT_PDF = 'export_pdf'
   - SHARE_LINK = 'share_link'
   - SKIP_TRACE = 'skip_trace'
   - UNLIMITED_SAVES = 'unlimited_saves'
   - SENSITIVITY_ANALYSIS = 'sensitivity_analysis'

2. `FEATURE_TIER_CONFIG: Record<Feature, 1 | 2 | 3>` per D-09:
   - Tier 1 (always free): STAGE1_LOOKUP
   - Tier 2 (preview free — show data, gate action per D-10): RENT_ESTIMATE, DADU_FEASIBILITY
   - Tier 3 (Pro only): STAGE2_LOOKUP, SAVE_ANALYSIS, EXPORT_PDF, SHARE_LINK, SKIP_TRACE, UNLIMITED_SAVES, SENSITIVITY_ANALYSIS

3. `ActionType` enum (string enum) per METER-02/04/05:
   - address_lookup_stage1, address_lookup_stage2, rent_estimate_requested, rent_estimate_requested_adu, dadu_feasibility_checked, comparable_sales_pulled, skip_trace_requested, analysis_saved, analysis_exported_pdf, analysis_shared_link, list_created, list_exported, deal_report_generated, deal_report_viewed

4. `ACTION_COST_ESTIMATES: Record<ActionType, number>` (cents):
   - address_lookup_stage1: 0 (free data)
   - address_lookup_stage2: 50 ($0.50)
   - rent_estimate_requested: 25
   - rent_estimate_requested_adu: 25
   - dadu_feasibility_checked: 0 (internal)
   - comparable_sales_pulled: 75
   - skip_trace_requested: 150 ($1.50)
   - analysis_saved: 0
   - analysis_exported_pdf: 0
   - analysis_shared_link: 0
   - list_created: 0
   - list_exported: 0
   - deal_report_generated: 0
   - deal_report_viewed: 0

5. `TIER_LIMITS: Record<'free' | 'pro', Record<string, number | 'unlimited'>>` per METER-09 + D-16 beta:
   - free: { stage1_lookup: 'unlimited', stage2_lookup: 0, rent_estimate: 0, skip_trace: 0, save_analysis: 3, export_pdf: 1, share_link: 0, list_created: 0, ... }
   - pro: { stage1_lookup: 'unlimited', stage2_lookup: 50, skip_trace: 10, save_analysis: 'unlimited', export_pdf: 'unlimited', ... }
   Note: During beta (METER-10), the service layer overrides all limits to 'unlimited' — this config stores the post-beta values.

6. `BETA_MODE = true` — constant that metering service checks; when true, all limit checks pass (D-16)

7. `GatingResponse` type per D-08:
   ```typescript
   export type GatingResponse = {
     allowed: boolean;
     reason: 'LIMIT_REACHED' | 'TIER_REQUIRED' | 'OVERRIDE' | null;
     action: string;
     overageAvailable: boolean; // always false in MVP per D-08
   }
   ```

Create `tests/unit/feature-tiers.test.ts` with tests for all behaviors above. Run RED first (file does not exist), then create the config, then GREEN.
  </action>
  <verify>
    <automated>cd /Users/sticky_iqqy_iqqy/real-estate-ai && npx vitest run tests/unit/feature-tiers.test.ts --reporter=verbose</automated>
  </verify>
  <acceptance_criteria>
    - lib/config/feature-tiers.ts contains `export enum Feature {`
    - lib/config/feature-tiers.ts contains `STAGE1_LOOKUP = 'stage1_lookup'`
    - lib/config/feature-tiers.ts contains `export const FEATURE_TIER_CONFIG`
    - lib/config/feature-tiers.ts contains `export const TIER_LIMITS`
    - lib/config/feature-tiers.ts contains `export enum ActionType {`
    - lib/config/feature-tiers.ts contains `export const ACTION_COST_ESTIMATES`
    - lib/config/feature-tiers.ts contains `export type GatingResponse`
    - lib/config/feature-tiers.ts contains `overageAvailable: boolean`
    - lib/config/feature-tiers.ts contains `export const BETA_MODE`
    - tests/unit/feature-tiers.test.ts exits 0
  </acceptance_criteria>
  <done>Feature enum, tier config, action types, cost estimates, tier limits, beta mode flag, and GatingResponse type all exported from lib/config/feature-tiers.ts. All tests pass.</done>
</task>

<task type="auto">
  <name>Task 2: Create feature_overrides schema and expand usage_log schema</name>
  <files>lib/schema/feature-overrides.ts, lib/schema/usage-log.ts, lib/schema/index.ts, tests/unit/schema-validation.test.ts</files>
  <read_first>
    - lib/schema/usage-log.ts (current schema to evolve)
    - lib/schema/auth.ts (user table FK reference)
    - lib/schema/index.ts (current re-exports)
    - .planning/phases/02A-infrastructure-services/02A-RESEARCH.md (Expanded usage_log Schema and Feature Overrides Schema code examples)
    - .planning/phases/02A-infrastructure-services/02A-CONTEXT.md (D-04, D-05, D-12, D-13)
  </read_first>
  <action>
1. Create `lib/schema/feature-overrides.ts` with exact Drizzle schema per D-04:
   ```typescript
   import { pgTable, text, timestamp, uuid, boolean, integer, jsonb, index } from "drizzle-orm/pg-core"
   import { user } from "./auth"
   ```
   Table name: "feature_overrides"
   Columns:
   - id: uuid pk defaultRandom
   - scope: text notNull (values: 'user' | 'global' | 'cohort')
   - userId: text nullable, references user.id with onDelete "set null"
   - cohortId: uuid nullable
   - feature: text notNull (validated against Feature enum on insert, not at schema level)
   - tierOverride: integer notNull (1, 2, or 3)
   - isActive: boolean notNull default true
   - expiresAt: timestamp nullable (null = permanent)
   - grantedBy: text notNull (admin userId or 'system')
   - reason: text notNull (e.g., 'beta_access', 'trial', 'founder_grant')
   - metadata: jsonb nullable (no default — per Pitfall 7 in RESEARCH.md).$type<Record<string, unknown>>()
   - createdAt: timestamp defaultNow notNull
   - updatedAt: timestamp defaultNow notNull

   Indexes per D-05:
   - userFeatureActiveIdx: on (userId, feature, isActive)
   - scopeFeatureActiveIdx: on (scope, feature, isActive)
   - expiresAtIdx: on (expiresAt)

2. Evolve `lib/schema/usage-log.ts` per D-12/D-13 — RENAME `lookupType` to `actionType`, ADD new columns:
   ```typescript
   import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core"
   import { user } from "./auth"
   ```
   Keep existing columns (id, userId, status, createdAt) but:
   - Rename `lookupType` column to `actionType` (text "action_type" notNull)
   - Keep `propertyAddress` for backward compat
   - ADD: `costEstimateCents`: integer("cost_estimate_cents") notNull default(0)
   - ADD: `apiProvider`: text("api_provider") notNull default("internal")
   - ADD: `propertyId`: uuid("property_id") nullable
   - ADD: `metadata`: jsonb("metadata").$type<Record<string, unknown>>() nullable
   - ADD: `planAtTimeOfAction`: text("plan_at_time_of_action") notNull default("free")

3. Update `lib/schema/index.ts`:
   ```typescript
   export * from "./auth";
   export * from "./usage-log";
   export * from "./feature-overrides";
   ```

4. Run `npm run db:generate` to produce migration SQL. Review the output for destructive operations (the `lookupType` → `actionType` rename may need manual migration SQL adjustment).

5. Create `tests/unit/schema-validation.test.ts` that imports both schemas and validates:
   - featureOverrides table exports correctly
   - usageLog table has actionType column (not lookupType)
   - usageLog table has costEstimateCents column
   - featureOverrides has all 12 columns
  </action>
  <verify>
    <automated>cd /Users/sticky_iqqy_iqqy/real-estate-ai && npx vitest run tests/unit/schema-validation.test.ts --reporter=verbose && npm run db:generate</automated>
  </verify>
  <acceptance_criteria>
    - lib/schema/feature-overrides.ts contains `export const featureOverrides = pgTable("feature_overrides"`
    - lib/schema/feature-overrides.ts contains `scope: text("scope").notNull()`
    - lib/schema/feature-overrides.ts contains `tierOverride: integer("tier_override").notNull()`
    - lib/schema/feature-overrides.ts contains `isActive: boolean("is_active").notNull().default(true)`
    - lib/schema/feature-overrides.ts contains `userFeatureActiveIdx`
    - lib/schema/feature-overrides.ts contains `scopeFeatureActiveIdx`
    - lib/schema/feature-overrides.ts contains `expiresAtIdx`
    - lib/schema/usage-log.ts contains `actionType: text("action_type").notNull()`
    - lib/schema/usage-log.ts contains `costEstimateCents: integer("cost_estimate_cents")`
    - lib/schema/usage-log.ts contains `apiProvider: text("api_provider")`
    - lib/schema/usage-log.ts contains `planAtTimeOfAction: text("plan_at_time_of_action")`
    - lib/schema/usage-log.ts contains `metadata: jsonb("metadata")`
    - lib/schema/index.ts contains `export * from "./feature-overrides"`
    - npm run db:generate exits without error
  </acceptance_criteria>
  <done>Feature overrides table schema with 3 indexes created. Usage_log schema expanded with 5 new columns. Both re-exported from schema/index.ts. Migration SQL generated.</done>
</task>

</tasks>

<verification>
- `npx vitest run tests/unit/feature-tiers.test.ts tests/unit/schema-validation.test.ts --reporter=verbose` — all tests pass
- `npm run db:generate` — migration SQL generated without errors
- `grep -r "Feature\." lib/config/feature-tiers.ts | wc -l` — at least 10 enum values used in config
</verification>

<success_criteria>
- Feature enum with 10 values exported from lib/config/feature-tiers.ts
- FEATURE_TIER_CONFIG maps all 10 features to tiers 1/2/3
- TIER_LIMITS defines free and pro plan limits with beta=unlimited note
- GatingResponse type has overageAvailable field
- feature_overrides Drizzle table has 12 columns and 3 indexes
- usage_log table has 5 new columns (actionType replacing lookupType, costEstimateCents, apiProvider, metadata, planAtTimeOfAction)
- All schemas re-exported from lib/schema/index.ts
- Migration SQL generated
</success_criteria>

<output>
After completion, create `.planning/phases/02A-infrastructure-services/02A-01-SUMMARY.md`
</output>
