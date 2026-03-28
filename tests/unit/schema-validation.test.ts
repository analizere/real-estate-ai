import { describe, it, expect } from "vitest";
import { getTableColumns, getTableName } from "drizzle-orm";
import { featureOverrides } from "../../lib/schema/feature-overrides";
import { usageLog } from "../../lib/schema/usage-log";

describe("featureOverrides schema", () => {
  it("exports the featureOverrides table correctly", () => {
    expect(featureOverrides).toBeDefined();
    expect(typeof featureOverrides).toBe("object");
  });

  it("has all 12 required columns", () => {
    const columns = getTableColumns(featureOverrides);
    expect(columns).toHaveProperty("id");
    expect(columns).toHaveProperty("scope");
    expect(columns).toHaveProperty("userId");
    expect(columns).toHaveProperty("cohortId");
    expect(columns).toHaveProperty("feature");
    expect(columns).toHaveProperty("tierOverride");
    expect(columns).toHaveProperty("isActive");
    expect(columns).toHaveProperty("expiresAt");
    expect(columns).toHaveProperty("grantedBy");
    expect(columns).toHaveProperty("reason");
    expect(columns).toHaveProperty("metadata");
    expect(columns).toHaveProperty("createdAt");
    expect(columns).toHaveProperty("updatedAt");
  });

  it("has isActive column with default true", () => {
    const columns = getTableColumns(featureOverrides);
    expect(columns.isActive.default).toBe(true);
  });

  it("table name is feature_overrides", () => {
    expect(getTableName(featureOverrides)).toBe("feature_overrides");
  });
});

describe("usageLog schema", () => {
  it("exports the usageLog table correctly", () => {
    expect(usageLog).toBeDefined();
    expect(typeof usageLog).toBe("object");
  });

  it("has actionType column (not lookupType)", () => {
    const columns = getTableColumns(usageLog);
    expect(columns).toHaveProperty("actionType");
    expect(columns).not.toHaveProperty("lookupType");
  });

  it("has costEstimateCents column", () => {
    const columns = getTableColumns(usageLog);
    expect(columns).toHaveProperty("costEstimateCents");
  });

  it("has apiProvider column", () => {
    const columns = getTableColumns(usageLog);
    expect(columns).toHaveProperty("apiProvider");
  });

  it("has metadata column", () => {
    const columns = getTableColumns(usageLog);
    expect(columns).toHaveProperty("metadata");
  });

  it("has planAtTimeOfAction column", () => {
    const columns = getTableColumns(usageLog);
    expect(columns).toHaveProperty("planAtTimeOfAction");
  });

  it("has propertyId column", () => {
    const columns = getTableColumns(usageLog);
    expect(columns).toHaveProperty("propertyId");
  });

  it("costEstimateCents has default 0", () => {
    const columns = getTableColumns(usageLog);
    expect(columns.costEstimateCents.default).toBe(0);
  });

  it("planAtTimeOfAction has default 'free'", () => {
    const columns = getTableColumns(usageLog);
    expect(columns.planAtTimeOfAction.default).toBe("free");
  });

  it("apiProvider has default 'internal'", () => {
    const columns = getTableColumns(usageLog);
    expect(columns.apiProvider.default).toBe("internal");
  });

  it("table name is usage_log", () => {
    expect(getTableName(usageLog)).toBe("usage_log");
  });
});
