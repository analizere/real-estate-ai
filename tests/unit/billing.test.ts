import { describe, it } from "vitest";

describe("BILL-01: Free-tier unlimited calculations", () => {
  it.todo("free-tier user can access calculation endpoints");
});

describe("BILL-02: Paid feature gating", () => {
  it.todo("free-tier user receives 402 on paid endpoints");
  it.todo("pro-tier user can access paid endpoints");
});

describe("BILL-03: Stripe subscription", () => {
  it.todo("creates checkout session for monthly plan");
  it.todo("creates checkout session for annual plan");
});

describe("BILL-04: Subscription status", () => {
  it.todo("returns free tier for user with no subscription");
  it.todo("returns pro tier for user with active subscription");
  it.todo("returns cancelled tier with period end date");
});

describe("BILL-05: Usage metering", () => {
  it.todo("logs usage entry before paid operation");
  it.todo("updates usage status after operation completes");
});

describe("BILL-06: Upgrade prompt", () => {
  it.todo("402 response includes upgrade_required error and upgradeUrl");
});
