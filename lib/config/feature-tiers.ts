/**
 * Feature Tier Configuration — Single Source of Truth
 *
 * This file defines:
 * 1. Feature enum — all gatable features in the platform
 * 2. FEATURE_TIER_CONFIG — which tier each feature belongs to
 * 3. ActionType enum — all metered actions
 * 4. ACTION_COST_ESTIMATES — estimated API cost per action (cents)
 * 5. TIER_LIMITS — per-plan action limits (post-beta values)
 * 6. BETA_MODE — when true, metering service skips all limit enforcement
 * 7. GatingResponse — response type from GatingService
 *
 * Tier definitions (D-09):
 *   Tier 1 — always free: Stage 1 public data, manual calculator, Deal Score from manual data
 *   Tier 2 — preview free: show data clearly and completely; gate the action, not the visibility (D-10)
 *   Tier 3 — Pro only ($99/mo): full enrichment, full analysis, full export capabilities
 */

// ---------------------------------------------------------------------------
// Feature enum — single source of truth for all gatable features (D-03)
// ---------------------------------------------------------------------------

export enum Feature {
  STAGE1_LOOKUP = "stage1_lookup",
  STAGE2_LOOKUP = "stage2_lookup",
  RENT_ESTIMATE = "rent_estimate",
  DADU_FEASIBILITY = "dadu_feasibility",
  SAVE_ANALYSIS = "save_analysis",
  EXPORT_PDF = "export_pdf",
  SHARE_LINK = "share_link",
  SKIP_TRACE = "skip_trace",
  UNLIMITED_SAVES = "unlimited_saves",
  SENSITIVITY_ANALYSIS = "sensitivity_analysis",
}

// ---------------------------------------------------------------------------
// Feature tier assignments (D-09)
//   Tier 1 — always free
//   Tier 2 — preview free (show clearly, gate the action)
//   Tier 3 — Pro only
// ---------------------------------------------------------------------------

export const FEATURE_TIER_CONFIG: Record<Feature, 1 | 2 | 3> = {
  // Tier 1: always free — public data and manual calculator
  [Feature.STAGE1_LOOKUP]: 1,

  // Tier 2: preview free — show data, gate the action (D-10)
  [Feature.RENT_ESTIMATE]: 2,
  [Feature.DADU_FEASIBILITY]: 2,

  // Tier 3: Pro only — full enrichment, analysis, export
  [Feature.STAGE2_LOOKUP]: 3,
  [Feature.SAVE_ANALYSIS]: 3,
  [Feature.EXPORT_PDF]: 3,
  [Feature.SHARE_LINK]: 3,
  [Feature.SKIP_TRACE]: 3,
  [Feature.UNLIMITED_SAVES]: 3,
  [Feature.SENSITIVITY_ANALYSIS]: 3,
};

// ---------------------------------------------------------------------------
// ActionType enum — all metered actions (METER-02, METER-04, METER-05)
// ---------------------------------------------------------------------------

export enum ActionType {
  ADDRESS_LOOKUP_STAGE1 = "address_lookup_stage1",
  ADDRESS_LOOKUP_STAGE2 = "address_lookup_stage2",
  RENT_ESTIMATE_REQUESTED = "rent_estimate_requested",
  RENT_ESTIMATE_REQUESTED_ADU = "rent_estimate_requested_adu",
  DADU_FEASIBILITY_CHECKED = "dadu_feasibility_checked",
  COMPARABLE_SALES_PULLED = "comparable_sales_pulled",
  SKIP_TRACE_REQUESTED = "skip_trace_requested",
  ANALYSIS_SAVED = "analysis_saved",
  ANALYSIS_EXPORTED_PDF = "analysis_exported_pdf",
  ANALYSIS_SHARED_LINK = "analysis_shared_link",
  LIST_CREATED = "list_created",
  LIST_EXPORTED = "list_exported",
  DEAL_REPORT_GENERATED = "deal_report_generated",
  DEAL_REPORT_VIEWED = "deal_report_viewed",
}

// ---------------------------------------------------------------------------
// ACTION_COST_ESTIMATES — estimated cost per action in cents
// Used for usage_log.cost_estimate_cents and admin cost monitoring
// ---------------------------------------------------------------------------

export const ACTION_COST_ESTIMATES: Record<ActionType, number> = {
  // Free data sources — no cost
  [ActionType.ADDRESS_LOOKUP_STAGE1]: 0,
  [ActionType.DADU_FEASIBILITY_CHECKED]: 0, // Internal rules DB — no external API
  [ActionType.ANALYSIS_SAVED]: 0,
  [ActionType.ANALYSIS_EXPORTED_PDF]: 0,
  [ActionType.ANALYSIS_SHARED_LINK]: 0,
  [ActionType.LIST_CREATED]: 0,
  [ActionType.LIST_EXPORTED]: 0,
  [ActionType.DEAL_REPORT_GENERATED]: 0,
  [ActionType.DEAL_REPORT_VIEWED]: 0,

  // Paid API calls
  [ActionType.ADDRESS_LOOKUP_STAGE2]: 50, // $0.50 per Stage 2 enrichment
  [ActionType.RENT_ESTIMATE_REQUESTED]: 25, // $0.25 per Rentcast call (primary unit)
  [ActionType.RENT_ESTIMATE_REQUESTED_ADU]: 25, // $0.25 per Rentcast call (ADU unit)
  [ActionType.COMPARABLE_SALES_PULLED]: 75, // $0.75 per ATTOM comps call
  [ActionType.SKIP_TRACE_REQUESTED]: 150, // $1.50 per skip trace — TBD pending API eval
};

// ---------------------------------------------------------------------------
// TIER_LIMITS — per-plan action limits
//
// NOTE: These are post-beta production values.
// During beta (BETA_MODE = true), the metering service overrides all limits
// to 'unlimited' — log everything, enforce nothing (D-16).
//
// 'unlimited' means the check still runs but never blocks (D-17).
// ---------------------------------------------------------------------------

export const TIER_LIMITS: Record<
  "free" | "pro",
  Record<string, number | "unlimited">
> = {
  free: {
    // Tier 1 — always free; unlimited stage1 lookups
    [Feature.STAGE1_LOOKUP]: "unlimited",
    // Tier 3 — zero access for free tier
    [Feature.STAGE2_LOOKUP]: 0,
    [Feature.RENT_ESTIMATE]: 0,
    [Feature.SKIP_TRACE]: 0,
    [Feature.SHARE_LINK]: 0,
    [Feature.UNLIMITED_SAVES]: 0,
    [Feature.SENSITIVITY_ANALYSIS]: 0,
    // Free tier gets limited saves/exports (acquisition funnel)
    [Feature.SAVE_ANALYSIS]: 3,
    [Feature.EXPORT_PDF]: 1,
    // DADU feasibility preview (tier 2 — data visible, action gated)
    [Feature.DADU_FEASIBILITY]: 0,
    // Lists
    list_created: 3,
  },
  pro: {
    // Unlimited stage1 for all users
    [Feature.STAGE1_LOOKUP]: "unlimited",
    // Pro plan allocations (METER-09)
    [Feature.STAGE2_LOOKUP]: 50,
    [Feature.SKIP_TRACE]: 10,
    // Unlimited for pro
    [Feature.SAVE_ANALYSIS]: "unlimited",
    [Feature.EXPORT_PDF]: "unlimited",
    [Feature.SHARE_LINK]: "unlimited",
    [Feature.RENT_ESTIMATE]: "unlimited",
    [Feature.DADU_FEASIBILITY]: "unlimited",
    [Feature.UNLIMITED_SAVES]: "unlimited",
    [Feature.SENSITIVITY_ANALYSIS]: "unlimited",
    // Lists
    list_created: "unlimited",
  },
};

// ---------------------------------------------------------------------------
// BETA_MODE — when true, metering service skips all limit enforcement (D-16)
// First 90 days of beta: set all limits to unlimited, log everything
// ---------------------------------------------------------------------------

export const BETA_MODE = true;

// ---------------------------------------------------------------------------
// GatingResponse — response type from GatingService (D-08)
// ---------------------------------------------------------------------------

export type GatingResponse = {
  /** Whether the action is allowed to proceed */
  allowed: boolean;
  /**
   * Reason for the gate decision:
   * - LIMIT_REACHED: user has hit their plan's action limit
   * - TIER_REQUIRED: feature requires a higher subscription tier
   * - OVERRIDE: allowed via database override (bypassing normal tier rules)
   * - null: allowed without any special condition
   */
  reason: "LIMIT_REACHED" | "TIER_REQUIRED" | "OVERRIDE" | null;
  /** The action being gated (ActionType string value) */
  action: string;
  /**
   * Whether overage billing is available for this action.
   * Always false in MVP — field exists to enable overage billing
   * in a future phase without structural changes (D-08).
   */
  overageAvailable: boolean;
};
