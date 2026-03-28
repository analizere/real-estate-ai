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
