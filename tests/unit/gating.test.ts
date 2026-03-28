/**
 * Tests for GatingService — hybrid 3-tier with database override support
 * Tests checkFeatureAccess, invalidateGatingCache, and getUserTier
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { Feature, FEATURE_TIER_CONFIG } from "@/lib/config/feature-tiers";

// Mock the db module before importing the service
vi.mock("@/lib/db", () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock better-auth
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
      listActiveSubscriptions: vi.fn(),
    },
  },
}));

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

// Mock next/server
vi.mock("next/server", () => ({
  NextResponse: {
    json: vi.fn((body, init) => ({ body, init })),
  },
}));

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
  checkFeatureAccess,
  invalidateGatingCache,
  getUserTier,
  getSubscriptionStatus,
} from "@/lib/services/gating";

// Helper to build a fluent query chain mock
function buildQueryChain(result: unknown[]) {
  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(result),
  };
  return chain;
}

describe("checkFeatureAccess — Tier 1 features (always free)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Clear the internal cache by running invalidate with a test userId
    invalidateGatingCache("user-free");
    invalidateGatingCache("user-pro");
  });

  it("returns allowed=true for Tier 1 features regardless of user tier (free)", async () => {
    vi.mocked(db.select).mockReturnValue(buildQueryChain([]) as never);
    const result = await checkFeatureAccess("user-free", Feature.STAGE1_LOOKUP, "free");
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.action).toBe(Feature.STAGE1_LOOKUP);
    expect(result.overageAvailable).toBe(false);
  });

  it("returns allowed=true for Tier 1 features regardless of user tier (pro)", async () => {
    vi.mocked(db.select).mockReturnValue(buildQueryChain([]) as never);
    const result = await checkFeatureAccess("user-pro", Feature.STAGE1_LOOKUP, "pro");
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.overageAvailable).toBe(false);
  });
});

describe("checkFeatureAccess — Tier 2 features (preview free)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateGatingCache("user-free");
    invalidateGatingCache("user-pro");
  });

  it("returns allowed=true for Tier 2 features for free users (preview — data visible)", async () => {
    vi.mocked(db.select).mockReturnValue(buildQueryChain([]) as never);
    const result = await checkFeatureAccess("user-free", Feature.DADU_FEASIBILITY, "free");
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.overageAvailable).toBe(false);
  });

  it("returns allowed=true for Tier 2 features for pro users", async () => {
    vi.mocked(db.select).mockReturnValue(buildQueryChain([]) as never);
    const result = await checkFeatureAccess("user-pro", Feature.RENT_ESTIMATE, "pro");
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.overageAvailable).toBe(false);
  });
});

describe("checkFeatureAccess — Tier 3 features (Pro only)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateGatingCache("user-free");
    invalidateGatingCache("user-pro");
  });

  it("returns allowed=false with TIER_REQUIRED for Tier 3 features when user is free tier", async () => {
    vi.mocked(db.select).mockReturnValue(buildQueryChain([]) as never);
    const result = await checkFeatureAccess("user-free", Feature.STAGE2_LOOKUP, "free");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("TIER_REQUIRED");
    expect(result.action).toBe(Feature.STAGE2_LOOKUP);
    expect(result.overageAvailable).toBe(false);
  });

  it("returns allowed=true for Tier 3 features when user is pro tier", async () => {
    vi.mocked(db.select).mockReturnValue(buildQueryChain([]) as never);
    const result = await checkFeatureAccess("user-pro", Feature.STAGE2_LOOKUP, "pro");
    expect(result.allowed).toBe(true);
    expect(result.reason).toBeNull();
    expect(result.overageAvailable).toBe(false);
  });

  it("blocks EXPORT_PDF for free user", async () => {
    vi.mocked(db.select).mockReturnValue(buildQueryChain([]) as never);
    const result = await checkFeatureAccess("user-free", Feature.EXPORT_PDF, "free");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("TIER_REQUIRED");
  });

  it("allows EXPORT_PDF for pro user", async () => {
    vi.mocked(db.select).mockReturnValue(buildQueryChain([]) as never);
    const result = await checkFeatureAccess("user-pro", Feature.EXPORT_PDF, "pro");
    expect(result.allowed).toBe(true);
  });
});

describe("checkFeatureAccess — User-level override", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateGatingCache("user-free");
    invalidateGatingCache("user-pro");
  });

  it("user-level override allows a free user access to Tier 3 feature", async () => {
    const fakeOverride = [{ id: "ov-1", scope: "user", userId: "user-free", feature: Feature.STAGE2_LOOKUP, tierOverride: 1, isActive: true, expiresAt: null }];
    // First call (user override) returns data, second call (global) won't be reached
    vi.mocked(db.select)
      .mockReturnValueOnce(buildQueryChain(fakeOverride) as never);

    const result = await checkFeatureAccess("user-free", Feature.STAGE2_LOOKUP, "free");
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe("OVERRIDE");
    expect(result.overageAvailable).toBe(false);
  });

  it("expired user-level override is ignored (falls through to tier check)", async () => {
    // DB returns empty for expired override (filtered by query)
    vi.mocked(db.select).mockReturnValue(buildQueryChain([]) as never);

    const result = await checkFeatureAccess("user-free", Feature.STAGE2_LOOKUP, "free");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("TIER_REQUIRED");
  });

  it("inactive user-level override is ignored", async () => {
    // DB returns empty for inactive override (filtered by isActive=true query)
    vi.mocked(db.select).mockReturnValue(buildQueryChain([]) as never);

    const result = await checkFeatureAccess("user-free", Feature.SKIP_TRACE, "free");
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe("TIER_REQUIRED");
  });
});

describe("checkFeatureAccess — Global override", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateGatingCache("user-free");
    invalidateGatingCache("user-pro");
  });

  it("global override applies when no user override exists", async () => {
    const fakeGlobalOverride = [{ id: "ov-2", scope: "global", userId: null, feature: Feature.SKIP_TRACE, tierOverride: 1, isActive: true, expiresAt: null }];
    // First call (user override) returns empty, second call (global override) returns data
    vi.mocked(db.select)
      .mockReturnValueOnce(buildQueryChain([]) as never)
      .mockReturnValueOnce(buildQueryChain(fakeGlobalOverride) as never);

    const result = await checkFeatureAccess("user-free", Feature.SKIP_TRACE, "free");
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe("OVERRIDE");
  });

  it("user override takes precedence over global override (D-02)", async () => {
    const userOverride = [{ id: "ov-1", scope: "user", userId: "user-free", feature: Feature.SKIP_TRACE, tierOverride: 1, isActive: true, expiresAt: null }];
    const globalOverride = [{ id: "ov-2", scope: "global", userId: null, feature: Feature.SKIP_TRACE, tierOverride: 3, isActive: true, expiresAt: null }];

    vi.mocked(db.select)
      .mockReturnValueOnce(buildQueryChain(userOverride) as never)
      .mockReturnValueOnce(buildQueryChain(globalOverride) as never);

    const result = await checkFeatureAccess("user-free", Feature.SKIP_TRACE, "free");
    expect(result.allowed).toBe(true);
    expect(result.reason).toBe("OVERRIDE");
    // db.select should only be called ONCE because user override short-circuits
    expect(vi.mocked(db.select)).toHaveBeenCalledTimes(1);
  });
});

describe("checkFeatureAccess — overageAvailable always false (D-08)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateGatingCache("user-free");
    invalidateGatingCache("user-pro");
  });

  it("overageAvailable is false when allowed (Tier 1)", async () => {
    vi.mocked(db.select).mockReturnValue(buildQueryChain([]) as never);
    const result = await checkFeatureAccess("user-free", Feature.STAGE1_LOOKUP, "free");
    expect(result.overageAvailable).toBe(false);
  });

  it("overageAvailable is false when blocked (Tier 3 for free user)", async () => {
    vi.mocked(db.select).mockReturnValue(buildQueryChain([]) as never);
    const result = await checkFeatureAccess("user-free", Feature.EXPORT_PDF, "free");
    expect(result.overageAvailable).toBe(false);
  });

  it("overageAvailable is false on override", async () => {
    const fakeOverride = [{ id: "ov-1", scope: "user", userId: "user-free", feature: Feature.EXPORT_PDF, tierOverride: 1, isActive: true, expiresAt: null }];
    vi.mocked(db.select).mockReturnValueOnce(buildQueryChain(fakeOverride) as never);
    const result = await checkFeatureAccess("user-free", Feature.EXPORT_PDF, "free");
    expect(result.overageAvailable).toBe(false);
  });
});

describe("invalidateGatingCache", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateGatingCache("user-cache-test");
  });

  it("invalidates cached result so next call re-queries the database", async () => {
    vi.mocked(db.select).mockReturnValue(buildQueryChain([]) as never);
    // Populate cache
    await checkFeatureAccess("user-cache-test", Feature.STAGE1_LOOKUP, "free");
    const callCountAfterFirst = vi.mocked(db.select).mock.calls.length;

    // Second call hits cache — no new DB queries for Tier 1 (already in cache)
    await checkFeatureAccess("user-cache-test", Feature.STAGE1_LOOKUP, "free");
    const callCountAfterSecond = vi.mocked(db.select).mock.calls.length;
    expect(callCountAfterSecond).toBe(callCountAfterFirst); // cache hit

    // Invalidate and call again — should re-query
    invalidateGatingCache("user-cache-test");
    await checkFeatureAccess("user-cache-test", Feature.STAGE1_LOOKUP, "free");
    const callCountAfterThird = vi.mocked(db.select).mock.calls.length;
    expect(callCountAfterThird).toBeGreaterThan(callCountAfterSecond);
  });
});

describe("getUserTier", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 'pro' for a user with an active subscription", async () => {
    vi.mocked(auth.api.listActiveSubscriptions).mockResolvedValue([
      { status: "active", periodEnd: null, cancelAtPeriodEnd: false },
    ] as never);
    const tier = await getUserTier("user-pro");
    expect(tier).toBe("pro");
  });

  it("returns 'free' for a user with no active subscription", async () => {
    vi.mocked(auth.api.listActiveSubscriptions).mockResolvedValue([] as never);
    const tier = await getUserTier("user-free");
    expect(tier).toBe("free");
  });

  it("returns 'free' for a user with only a cancelled subscription", async () => {
    vi.mocked(auth.api.listActiveSubscriptions).mockResolvedValue([
      { status: "canceled", periodEnd: null, cancelAtPeriodEnd: true },
    ] as never);
    const tier = await getUserTier("user-cancelled");
    expect(tier).toBe("free");
  });
});
