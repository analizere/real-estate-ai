// Tests that verify PostHog provider config by reading the source file
// and asserting key configuration values are present.
// This catches regressions where someone removes critical config flags.
import { describe, test, expect } from 'vitest'
import fs from 'fs'
import path from 'path'

describe('PostHog Provider Config', () => {
  const providerSource = fs.readFileSync(
    path.resolve('app/providers.tsx'), 'utf-8'
  )

  test('disables automatic pageview capture (manual tracking via PostHogPageView)', () => {
    expect(providerSource).toContain('capture_pageview: false')
  })

  test('enables session recording for beta (D-32)', () => {
    expect(providerSource).toContain('disable_session_recording: false')
  })

  test('masks password inputs (D-34/ANLYT-03)', () => {
    expect(providerSource).toContain('password: true')
  })

  test('enables autocapture for rage click detection (SESS-04)', () => {
    expect(providerSource).toContain('autocapture: true')
  })

  test('uses identified_only person profiles (no anonymous tracking)', () => {
    expect(providerSource).toContain("person_profiles: 'identified_only'")
  })
})

describe('PostHogPageView Component', () => {
  const pageviewSource = fs.readFileSync(
    path.resolve('app/posthog-pageview.tsx'), 'utf-8'
  )

  test('wraps useSearchParams in Suspense boundary (Pitfall 1)', () => {
    expect(pageviewSource).toContain('<Suspense')
    expect(pageviewSource).toContain('useSearchParams')
  })
})

describe('PostHog Server Client', () => {
  const serverSource = fs.readFileSync(
    path.resolve('lib/services/posthog-server.ts'), 'utf-8'
  )

  test('uses flushAt: 1 for serverless safety', () => {
    expect(serverSource).toContain('flushAt: 1')
  })

  test('calls shutdown for immediate flush', () => {
    expect(serverSource).toContain('await client.shutdown()')
  })
})
