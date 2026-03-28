import { describe, it, expect } from "vitest";
import {
  Feature,
  FEATURE_TIER_CONFIG,
  TIER_LIMITS,
  ActionType,
  ACTION_COST_ESTIMATES,
  GatingResponse,
  BETA_MODE,
} from "../../lib/config/feature-tiers";

describe("Feature enum", () => {
  it("contains all 10 features", () => {
    const features = Object.values(Feature);
    expect(features).toContain("stage1_lookup");
    expect(features).toContain("stage2_lookup");
    expect(features).toContain("rent_estimate");
    expect(features).toContain("dadu_feasibility");
    expect(features).toContain("save_analysis");
    expect(features).toContain("export_pdf");
    expect(features).toContain("share_link");
    expect(features).toContain("skip_trace");
    expect(features).toContain("unlimited_saves");
    expect(features).toContain("sensitivity_analysis");
    expect(features).toHaveLength(10);
  });
});

describe("FEATURE_TIER_CONFIG", () => {
  it("maps every Feature enum value to tier 1, 2, or 3", () => {
    for (const feature of Object.values(Feature)) {
      const tier = FEATURE_TIER_CONFIG[feature as Feature];
      expect([1, 2, 3]).toContain(tier);
    }
  });

  it("assigns STAGE1_LOOKUP to tier 1 (always free)", () => {
    expect(FEATURE_TIER_CONFIG[Feature.STAGE1_LOOKUP]).toBe(1);
  });

  it("assigns RENT_ESTIMATE to tier 2 (preview free)", () => {
    expect(FEATURE_TIER_CONFIG[Feature.RENT_ESTIMATE]).toBe(2);
  });

  it("assigns STAGE2_LOOKUP to tier 3 (Pro only)", () => {
    expect(FEATURE_TIER_CONFIG[Feature.STAGE2_LOOKUP]).toBe(3);
  });

  it("has no orphaned Feature enum values (every Feature has a config entry)", () => {
    const configKeys = Object.keys(FEATURE_TIER_CONFIG);
    const enumValues = Object.values(Feature);
    for (const featureValue of enumValues) {
      expect(configKeys).toContain(featureValue);
    }
  });
});

describe("TIER_LIMITS", () => {
  it("has entries for both 'free' and 'pro' plans", () => {
    expect(TIER_LIMITS).toHaveProperty("free");
    expect(TIER_LIMITS).toHaveProperty("pro");
  });

  it("TIER_LIMITS.free[Feature.STAGE1_LOOKUP] is 'unlimited' (beta override per D-16)", () => {
    expect(TIER_LIMITS.free[Feature.STAGE1_LOOKUP]).toBe("unlimited");
  });

  it("TIER_LIMITS.pro[Feature.STAGE2_LOOKUP] is 50 (per METER-09)", () => {
    expect(TIER_LIMITS.pro[Feature.STAGE2_LOOKUP]).toBe(50);
  });

  it("TIER_LIMITS.pro[Feature.SKIP_TRACE] is 10 (per METER-09)", () => {
    expect(TIER_LIMITS.pro[Feature.SKIP_TRACE]).toBe(10);
  });
});

describe("ActionType enum", () => {
  it("includes all required action types", () => {
    const actions = Object.values(ActionType);
    expect(actions).toContain("address_lookup_stage1");
    expect(actions).toContain("address_lookup_stage2");
    expect(actions).toContain("rent_estimate_requested");
    expect(actions).toContain("dadu_feasibility_checked");
    expect(actions).toContain("skip_trace_requested");
    expect(actions).toContain("analysis_saved");
    expect(actions).toContain("analysis_exported_pdf");
    expect(actions).toContain("analysis_shared_link");
    expect(actions).toContain("list_created");
    expect(actions).toContain("list_exported");
    expect(actions).toContain("deal_report_generated");
  });
});

describe("ACTION_COST_ESTIMATES", () => {
  it("maps each ActionType to a number (cents)", () => {
    for (const action of Object.values(ActionType)) {
      const cost = ACTION_COST_ESTIMATES[action as ActionType];
      expect(typeof cost).toBe("number");
      expect(cost).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("GatingResponse type", () => {
  it("has fields: allowed, reason, action, overageAvailable", () => {
    const response: GatingResponse = {
      allowed: true,
      reason: null,
      action: "stage1_lookup",
      overageAvailable: false,
    };
    expect(response.allowed).toBe(true);
    expect(response.reason).toBeNull();
    expect(response.action).toBe("stage1_lookup");
    expect(response.overageAvailable).toBe(false);
  });

  it("reason can be LIMIT_REACHED, TIER_REQUIRED, OVERRIDE, or null", () => {
    const r1: GatingResponse = { allowed: false, reason: "LIMIT_REACHED", action: "test", overageAvailable: false };
    const r2: GatingResponse = { allowed: false, reason: "TIER_REQUIRED", action: "test", overageAvailable: false };
    const r3: GatingResponse = { allowed: true, reason: "OVERRIDE", action: "test", overageAvailable: false };
    const r4: GatingResponse = { allowed: true, reason: null, action: "test", overageAvailable: false };
    expect(r1.reason).toBe("LIMIT_REACHED");
    expect(r2.reason).toBe("TIER_REQUIRED");
    expect(r3.reason).toBe("OVERRIDE");
    expect(r4.reason).toBeNull();
  });
});

describe("BETA_MODE", () => {
  it("is a boolean", () => {
    expect(typeof BETA_MODE).toBe("boolean");
  });
});
