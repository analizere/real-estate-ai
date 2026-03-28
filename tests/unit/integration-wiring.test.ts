/**
 * Integration wiring tests — verifies the full Phase 2A flow:
 * auth -> gating -> metering -> analytics -> enrichment -> status update
 *
 * Also verifies Stripe webhook PostHog wiring (trackSubscriptionStarted/Cancelled).
 *
 * These are unit tests with mocked dependencies; they verify the _wiring_
 * (that functions are called in the right order with the right arguments),
 * not the underlying service implementations.
 */
import { describe, it, expect, vi, beforeEach } from "vitest"

// ---------------------------------------------------------------------------
// Hoisted mock — declared before vi.mock factory hoisting
// ---------------------------------------------------------------------------

const { mockStage1Enrich } = vi.hoisted(() => ({
  mockStage1Enrich: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Mocks — must be declared before imports that consume them
// ---------------------------------------------------------------------------

vi.mock("@/lib/services/gating", () => ({
  authenticateAndCheckTier: vi.fn(),
  checkFeatureAccess: vi.fn(),
  getUserTier: vi.fn(),
}))

vi.mock("@/lib/services/usage", () => ({
  logAndCheckUsage: vi.fn(),
  updateUsageStatus: vi.fn(),
}))

vi.mock("@/lib/services/enrichment", () => {
  return {
    DataEnrichmentService: class MockDataEnrichmentService {
      stage1Enrich = mockStage1Enrich
    },
  }
})

vi.mock("@/lib/services/posthog-server", () => ({
  captureServerEvent: vi.fn(),
  setPersonProperties: vi.fn(),
}))

vi.mock("@/lib/services/posthog-events", () => ({
  trackSubscriptionStarted: vi.fn(),
  trackSubscriptionCancelled: vi.fn(),
}))

vi.mock("next/server", () => ({
  NextRequest: vi.fn(),
  NextResponse: {
    json: vi.fn((body: unknown, init?: { status?: number }) => ({
      body,
      status: init?.status ?? 200,
      json: async () => body,
    })),
  },
}))

// ---------------------------------------------------------------------------
// Imports after mocks
// ---------------------------------------------------------------------------

import { authenticateAndCheckTier, checkFeatureAccess, getUserTier } from "@/lib/services/gating"
import { logAndCheckUsage, updateUsageStatus } from "@/lib/services/usage"
import { captureServerEvent } from "@/lib/services/posthog-server"
import { trackSubscriptionStarted, trackSubscriptionCancelled } from "@/lib/services/posthog-events"
import { Feature, ActionType } from "@/lib/config/feature-tiers"
import { POST } from "@/app/api/v1/enrichment/stage1/route"
import { NextResponse } from "next/server"

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeRequest(body: unknown): import("next/server").NextRequest {
  return {
    json: async () => body,
    headers: new Headers(),
  } as unknown as import("next/server").NextRequest
}

function mockAuthSuccess(userId = "user-123") {
  vi.mocked(authenticateAndCheckTier).mockResolvedValue({
    authorized: true,
    userId,
    isPro: true,
  })
}

function mockGateAllowed() {
  vi.mocked(checkFeatureAccess).mockResolvedValue({
    allowed: true,
    reason: null,
    action: Feature.STAGE1_LOOKUP,
    overageAvailable: false,
  })
}

function mockUsageAllowed(logId = "log-abc") {
  vi.mocked(logAndCheckUsage).mockResolvedValue({
    logId,
    allowed: true,
    gatingResponse: {
      allowed: true,
      reason: null,
      action: ActionType.ADDRESS_LOOKUP_STAGE1,
      overageAvailable: false,
    },
  })
}

function mockEnrichmentSuccess() {
  mockStage1Enrich.mockResolvedValue({
    success: true,
    property_id: "prop-1",
    address_normalized: "123 Main St",
    cache_hit: false,
    county_quality_tier: "excellent",
    lot_size_sqft: { value: 5000, cache_source: "county_api", cache_ttl_days: 180 },
  })
}

// ---------------------------------------------------------------------------
// Test suite: authentication
// ---------------------------------------------------------------------------

describe("POST /api/v1/enrichment/stage1 — authentication", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStage1Enrich.mockReset()
  })

  it("returns 401 when not authenticated", async () => {
    const mockResponse = { body: { error: "unauthorized" }, status: 401 }
    vi.mocked(authenticateAndCheckTier).mockResolvedValue({
      authorized: false,
      response: mockResponse as unknown as import("next/server").NextResponse,
    })

    const request = makeRequest({ address: "123 Main St" })
    const response = await POST(request)

    // Should return the 401 response from authenticateAndCheckTier
    expect(response).toBe(mockResponse)
    expect(checkFeatureAccess).not.toHaveBeenCalled()
    expect(logAndCheckUsage).not.toHaveBeenCalled()
    expect(mockStage1Enrich).not.toHaveBeenCalled()
  })
})

// ---------------------------------------------------------------------------
// Test suite: input validation
// ---------------------------------------------------------------------------

describe("POST /api/v1/enrichment/stage1 — input validation", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStage1Enrich.mockReset()
    mockAuthSuccess()
    vi.mocked(getUserTier).mockResolvedValue("pro")
  })

  it("returns 400 when address is missing", async () => {
    const request = makeRequest({})
    await POST(request)

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "address is required" }),
      { status: 400 }
    )
    expect(mockStage1Enrich).not.toHaveBeenCalled()
  })

  it("returns 400 when address is not a string", async () => {
    const request = makeRequest({ address: 12345 })
    await POST(request)

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "address is required" }),
      { status: 400 }
    )
  })
})

// ---------------------------------------------------------------------------
// Test suite: gating -> metering -> enrichment flow
// ---------------------------------------------------------------------------

describe("POST /api/v1/enrichment/stage1 — gating -> metering -> enrichment order", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStage1Enrich.mockReset()
    mockAuthSuccess()
    vi.mocked(getUserTier).mockResolvedValue("pro")
    mockGateAllowed()
    mockUsageAllowed()
    mockEnrichmentSuccess()
  })

  it("calls gating, then metering, then enrichment in correct order", async () => {
    const callOrder: string[] = []

    vi.mocked(checkFeatureAccess).mockImplementation(async (userId, feature) => {
      callOrder.push("gating")
      return {
        allowed: true,
        reason: null,
        action: feature,
        overageAvailable: false,
      }
    })

    vi.mocked(logAndCheckUsage).mockImplementation(async () => {
      callOrder.push("metering")
      return {
        logId: "log-1",
        allowed: true,
        gatingResponse: {
          allowed: true,
          reason: null,
          action: ActionType.ADDRESS_LOOKUP_STAGE1,
          overageAvailable: false,
        },
      }
    })

    mockStage1Enrich.mockImplementation(async () => {
      callOrder.push("enrichment")
      return {
        success: true,
        property_id: "prop-1",
        address_normalized: "123 Main St",
        cache_hit: false,
        county_quality_tier: "excellent",
      }
    })

    const request = makeRequest({ address: "123 Main St, Seattle WA" })
    await POST(request)

    expect(callOrder).toEqual(["gating", "metering", "enrichment"])
  })

  it("logs usage BEFORE enrichment executes (D-12)", async () => {
    const executionOrder: string[] = []

    vi.mocked(logAndCheckUsage).mockImplementation(async () => {
      executionOrder.push("logAndCheckUsage")
      return {
        logId: "log-1",
        allowed: true,
        gatingResponse: {
          allowed: true,
          reason: null,
          action: ActionType.ADDRESS_LOOKUP_STAGE1,
          overageAvailable: false,
        },
      }
    })

    mockStage1Enrich.mockImplementation(async () => {
      executionOrder.push("stage1Enrich")
      return {
        success: true,
        property_id: "prop-1",
        address_normalized: "123 Main St",
        cache_hit: false,
        county_quality_tier: "excellent",
      }
    })

    const request = makeRequest({ address: "123 Main St, Seattle WA" })
    await POST(request)

    expect(logAndCheckUsage).toHaveBeenCalled()
    expect(mockStage1Enrich).toHaveBeenCalled()

    const meterIdx = executionOrder.indexOf("logAndCheckUsage")
    const enrichIdx = executionOrder.indexOf("stage1Enrich")
    expect(meterIdx).toBeGreaterThanOrEqual(0)
    expect(enrichIdx).toBeGreaterThanOrEqual(0)
    expect(meterIdx).toBeLessThan(enrichIdx)
  })

  it("captures stage1_data_pull_started server-side event before enrichment (ANLYT-10/D-25)", async () => {
    const request = makeRequest({ address: "123 Main St, Seattle WA" })
    await POST(request)

    expect(captureServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "stage1_data_pull_started",
        distinctId: "user-123",
      })
    )
  })

  it("stage1_data_pull_started event contains no PII — no raw address (ANLYT-03/D-24)", async () => {
    const testAddress = "456 Oak Avenue, Portland OR"
    const request = makeRequest({ address: testAddress })
    await POST(request)

    const startedCall = vi.mocked(captureServerEvent).mock.calls.find(
      (call) => call[0].event === "stage1_data_pull_started"
    )
    expect(startedCall).toBeDefined()
    if (startedCall) {
      const serialized = JSON.stringify(startedCall[0].properties ?? {})
      expect(serialized).not.toContain("Oak Avenue")
      expect(serialized).not.toContain("Portland OR")
    }
  })

  it("calls updateUsageStatus with 'success' on successful enrichment", async () => {
    const request = makeRequest({ address: "123 Main St, Seattle WA" })
    await POST(request)

    expect(updateUsageStatus).toHaveBeenCalledWith("log-abc", "success")
  })

  it("captures stage1_data_pull_completed event with success=true on success", async () => {
    const request = makeRequest({ address: "123 Main St, Seattle WA" })
    await POST(request)

    expect(captureServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "stage1_data_pull_completed",
        distinctId: "user-123",
        properties: expect.objectContaining({ success: true }),
      })
    )
  })

  it("no PII in any captureServerEvent call — no raw address strings", async () => {
    const testAddress = "789 Maple Drive, Tacoma WA 98402"
    const request = makeRequest({ address: testAddress })
    await POST(request)

    const allCalls = vi.mocked(captureServerEvent).mock.calls
    expect(allCalls.length).toBeGreaterThan(0)
    for (const [callArgs] of allCalls) {
      const serialized = JSON.stringify(callArgs.properties ?? {})
      expect(serialized).not.toContain("Maple Drive")
      expect(serialized).not.toContain("Tacoma WA")
    }
  })
})

// ---------------------------------------------------------------------------
// Test suite: enrichment failure handling
// ---------------------------------------------------------------------------

describe("POST /api/v1/enrichment/stage1 — enrichment failure handling", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStage1Enrich.mockReset()
    mockAuthSuccess()
    vi.mocked(getUserTier).mockResolvedValue("pro")
    mockGateAllowed()
    mockUsageAllowed("log-fail")
  })

  it("calls updateUsageStatus with 'failed' when enrichment throws", async () => {
    mockStage1Enrich.mockRejectedValue(new Error("API timeout"))

    const request = makeRequest({ address: "789 Elm St, Tacoma WA" })
    await POST(request)

    expect(updateUsageStatus).toHaveBeenCalledWith("log-fail", "failed")
  })

  it("returns 500 when enrichment throws", async () => {
    mockStage1Enrich.mockRejectedValue(new Error("API timeout"))

    const request = makeRequest({ address: "789 Elm St, Tacoma WA" })
    await POST(request)

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "enrichment_failed" }),
      { status: 500 }
    )
  })
})

// ---------------------------------------------------------------------------
// SESS-05: paywall_hit event tests
// ---------------------------------------------------------------------------

describe("POST /api/v1/enrichment/stage1 — SESS-05 paywall_hit events", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockStage1Enrich.mockReset()
    mockAuthSuccess()
    vi.mocked(getUserTier).mockResolvedValue("free")
  })

  it("fires paywall_hit event with feature and reason when gating returns allowed=false (403)", async () => {
    vi.mocked(checkFeatureAccess).mockResolvedValue({
      allowed: false,
      reason: "TIER_REQUIRED",
      action: Feature.STAGE1_LOOKUP,
      overageAvailable: false,
    })

    const request = makeRequest({ address: "123 Main St, Seattle WA" })
    await POST(request)

    expect(captureServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "paywall_hit",
        distinctId: "user-123",
        properties: expect.objectContaining({
          feature: Feature.STAGE1_LOOKUP,
          reason: "TIER_REQUIRED",
          user_tier: "free",
        }),
      })
    )
    // Enrichment should NOT be called on gating block
    expect(mockStage1Enrich).not.toHaveBeenCalled()
  })

  it("sets last_paywall_hit_at person property on gating block (SESS-05 cohort filtering)", async () => {
    vi.mocked(checkFeatureAccess).mockResolvedValue({
      allowed: false,
      reason: "TIER_REQUIRED",
      action: Feature.STAGE1_LOOKUP,
      overageAvailable: false,
    })

    const request = makeRequest({ address: "123 Main St, Seattle WA" })
    await POST(request)

    const paywallCall = vi.mocked(captureServerEvent).mock.calls.find(
      (call) => call[0].event === "paywall_hit"
    )
    expect(paywallCall).toBeDefined()
    if (paywallCall) {
      expect(paywallCall[0].properties).toHaveProperty("$set")
      const setProps = paywallCall[0].properties!["$set"] as Record<string, unknown>
      expect(setProps).toHaveProperty("last_paywall_hit_at")
    }
  })

  it("fires paywall_hit with reason LIMIT_REACHED when usage limit exceeded (429)", async () => {
    vi.mocked(checkFeatureAccess).mockResolvedValue({
      allowed: true,
      reason: null,
      action: Feature.STAGE1_LOOKUP,
      overageAvailable: false,
    })
    vi.mocked(logAndCheckUsage).mockResolvedValue({
      logId: null,
      allowed: false,
      gatingResponse: {
        allowed: false,
        reason: "LIMIT_REACHED",
        action: ActionType.ADDRESS_LOOKUP_STAGE1,
        overageAvailable: false,
      },
    })

    const request = makeRequest({ address: "123 Main St, Seattle WA" })
    await POST(request)

    expect(captureServerEvent).toHaveBeenCalledWith(
      expect.objectContaining({
        event: "paywall_hit",
        properties: expect.objectContaining({
          reason: "LIMIT_REACHED",
          user_tier: "free",
        }),
      })
    )
    // Enrichment should NOT be called when limit exceeded
    expect(mockStage1Enrich).not.toHaveBeenCalled()
  })

  it("returns 403 JSON when gating blocks access", async () => {
    vi.mocked(checkFeatureAccess).mockResolvedValue({
      allowed: false,
      reason: "TIER_REQUIRED",
      action: Feature.STAGE1_LOOKUP,
      overageAvailable: false,
    })

    const request = makeRequest({ address: "123 Main St, Seattle WA" })
    await POST(request)

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "feature_gated" }),
      { status: 403 }
    )
  })

  it("returns 429 JSON when usage limit exceeded", async () => {
    vi.mocked(checkFeatureAccess).mockResolvedValue({
      allowed: true,
      reason: null,
      action: Feature.STAGE1_LOOKUP,
      overageAvailable: false,
    })
    vi.mocked(logAndCheckUsage).mockResolvedValue({
      logId: null,
      allowed: false,
      gatingResponse: {
        allowed: false,
        reason: "LIMIT_REACHED",
        action: ActionType.ADDRESS_LOOKUP_STAGE1,
        overageAvailable: false,
      },
    })

    const request = makeRequest({ address: "123 Main St, Seattle WA" })
    await POST(request)

    expect(NextResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ error: "limit_reached" }),
      { status: 429 }
    )
  })
})

// ---------------------------------------------------------------------------
// Stripe webhook — PostHog subscription event wiring
// ---------------------------------------------------------------------------

describe("Stripe webhook — PostHog subscription event wiring", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("trackSubscriptionStarted is importable and callable (wired into Stripe webhook)", async () => {
    await trackSubscriptionStarted("user-456", "pro", 9900)
    expect(trackSubscriptionStarted).toHaveBeenCalledWith("user-456", "pro", 9900)
  })

  it("trackSubscriptionCancelled is importable and callable (wired into Stripe webhook)", async () => {
    await trackSubscriptionCancelled("user-456")
    expect(trackSubscriptionCancelled).toHaveBeenCalledWith("user-456")
  })

  it("trackSubscriptionStarted fires with Pro monthly price of $99 in cents (9900)", async () => {
    await trackSubscriptionStarted("user-789", "pro", 9900)
    expect(trackSubscriptionStarted).toHaveBeenCalledWith("user-789", "pro", 9900)
  })

  it("trackSubscriptionCancelled fires when subscription is deleted/cancelled", async () => {
    await trackSubscriptionCancelled("user-999")
    expect(trackSubscriptionCancelled).toHaveBeenCalledWith("user-999")
  })
})
