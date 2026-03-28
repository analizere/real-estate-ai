import { captureServerEvent, setPersonProperties } from './posthog-server'

/**
 * Phase 2A lifecycle events ONLY (D-29):
 * - signed_up, signed_in, signed_out
 * - subscription_started, subscription_cancelled, upgrade_clicked
 *
 * DO NOT add calculator/portfolio/DADU events here — they wire up in their
 * respective phases (D-30). This file stays scoped to auth + billing lifecycle.
 *
 * Client-side events (user interactions): use posthog.capture() via usePostHog()
 * inside PHProvider tree. These functions use posthog-js captured via dynamic import.
 *
 * Server-side events (subscription changes): use captureServerEvent per D-25/D-26.
 * These fire server-side to prevent ad blocker suppression of billing-critical events.
 */

// Client-side lifecycle events (user interactions per D-25)
// Called from auth form submit handlers, sign-out buttons, etc.

export function trackSignedUp(method: 'email' | 'google'): void {
  // Lazy import to avoid SSR issues — posthog-js is browser-only
  import('posthog-js').then(({ default: posthog }) => {
    posthog.capture('signed_up', { method })
  })
}

export function trackSignedIn(method: 'email' | 'google'): void {
  import('posthog-js').then(({ default: posthog }) => {
    posthog.capture('signed_in', { method })
  })
}

export function trackSignedOut(): void {
  import('posthog-js').then(({ default: posthog }) => {
    posthog.capture('signed_out')
  })
}

export function trackUpgradeClicked(source: string): void {
  import('posthog-js').then(({ default: posthog }) => {
    posthog.capture('upgrade_clicked', { source })
  })
}

// Server-side events (subscription changes per D-25/D-26)
// These fire from Stripe webhook handlers where ad blockers cannot suppress them.
// Person properties updated server-side to ensure accuracy per ANLYT-11.

export async function trackSubscriptionStarted(
  userId: string,
  plan: string,
  priceMonthly: number
): Promise<void> {
  await captureServerEvent({
    distinctId: userId,
    event: 'subscription_started',
    properties: { plan, price_monthly: priceMonthly },
  })
  // Update person properties server-side per D-26/ANLYT-11
  await setPersonProperties(userId, {
    plan,
    subscription_started_at: new Date().toISOString(),
  })
}

export async function trackSubscriptionCancelled(userId: string): Promise<void> {
  await captureServerEvent({
    distinctId: userId,
    event: 'subscription_cancelled',
  })
  await setPersonProperties(userId, {
    plan: 'free',
    subscription_cancelled_at: new Date().toISOString(),
  })
}

/**
 * PostHog Feature Flags (D-27/ANLYT-11):
 * Feature flags are configured in the PostHog dashboard, NOT in code.
 * Flags to create manually in the PostHog UI (Feature Flags section):
 *
 *   - paywall_placement: A/B test where upgrade prompts appear
 *     Type: Multivariate, 50/50 split
 *     Purpose: Optimize upgrade prompt placement for free-to-paid conversion
 *
 *   - upgrade_prompt_copy: A/B test upgrade prompt wording
 *     Type: Multivariate, 50/50 split
 *     Purpose: Optimize upgrade CTA copy for higher click-through rate
 *
 * Client-side evaluation (inside PHProvider/usePostHog components):
 *   import { useFeatureFlagEnabled } from 'posthog-js/react'
 *   const showVariantA = useFeatureFlagEnabled('paywall_placement')
 *
 * Server-side evaluation (in Route Handlers or Server Components):
 *   const client = getPostHogServerClient()
 *   const enabled = await client.isFeatureEnabled('paywall_placement', userId)
 *
 * Per D-27: all A/B test result analysis is done in PostHog, not in code.
 * Do not implement feature flag logic in components without consulting
 * the central feature tier config in lib/config/feature-tiers.ts first.
 *
 * See also: PostHog Cohorts and Funnels configuration checklist in
 * .planning/phases/02A-infrastructure-services/02A-06-PLAN.md Task 3.
 */
