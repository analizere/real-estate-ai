---
phase: 02A-infrastructure-services
plan: 02
type: execute
wave: 1
depends_on: []
files_modified:
  - app/providers.tsx
  - app/posthog-pageview.tsx
  - app/layout.tsx
  - lib/services/posthog-server.ts
  - tests/unit/posthog-config.test.ts
autonomous: true
requirements: [ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-10, ANLYT-11, SESS-01, SESS-02, SESS-03, SESS-04, SESS-05, SESS-06]

must_haves:
  truths:
    - "PostHog provider wraps the entire app layout alongside existing ThemeProvider"
    - "Page views are tracked manually via PostHogPageView component (not autocapture)"
    - "Session recording is enabled for all sessions during beta"
    - "Server-side PostHog client exists for route handler event capture"
    - "No PII is captured in any PostHog event"
  artifacts:
    - path: "app/providers.tsx"
      provides: "PHProvider client component wrapping PostHogProvider"
      exports: ["PHProvider"]
    - path: "app/posthog-pageview.tsx"
      provides: "PostHogPageView component with Suspense wrapper"
      exports: ["PostHogPageView"]
    - path: "lib/services/posthog-server.ts"
      provides: "Server-side PostHog singleton + captureServerEvent helper"
      exports: ["getPostHogServerClient", "captureServerEvent"]
    - path: "app/layout.tsx"
      provides: "Root layout with PHProvider wrapping ThemeProvider"
  key_links:
    - from: "app/layout.tsx"
      to: "app/providers.tsx"
      via: "import PHProvider"
      pattern: "import.*PHProvider.*from.*providers"
    - from: "app/layout.tsx"
      to: "app/posthog-pageview.tsx"
      via: "import PostHogPageView"
      pattern: "import.*PostHogPageView.*from.*posthog-pageview"
    - from: "lib/services/posthog-server.ts"
      to: "posthog-node"
      via: "PostHog import"
      pattern: "import.*PostHog.*from.*posthog-node"
---

<objective>
Install PostHog dependencies and integrate the PostHog provider into the Next.js App Router so that page views, session recording, and server-side event capture are operational from this point forward.

Purpose: PostHog must wrap the app before any feature events can be tracked. This plan establishes the analytics infrastructure that Plans 03-06 and all future phases depend on.
Output: `app/providers.tsx`, `app/posthog-pageview.tsx`, evolved `app/layout.tsx`, `lib/services/posthog-server.ts`.
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
<!-- Current app/layout.tsx structure to evolve -->
From app/layout.tsx:
```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Install PostHog dependencies and create provider + pageview components</name>
  <files>app/providers.tsx, app/posthog-pageview.tsx, lib/services/posthog-server.ts, tests/unit/posthog-config.test.ts</files>
  <read_first>
    - app/layout.tsx (current layout structure to understand wrapping order)
    - .planning/phases/02A-infrastructure-services/02A-RESEARCH.md (Pattern 3: PostHog Provider, Pattern 4: Server-Side PostHog, Pitfall 1 and 2)
    - .planning/phases/02A-infrastructure-services/02A-CONTEXT.md (D-22 through D-27, D-32 through D-37)
    - node_modules/next/dist/docs/ (check for App Router breaking changes per AGENTS.md)
  </read_first>
  <action>
1. Install dependencies:
   ```bash
   npm install posthog-js posthog-node @tanstack/react-query
   ```
   Note: @tanstack/react-query installed here (needed in Plan 05 for usage UI, but install now to avoid duplication).

2. Create `app/providers.tsx` — 'use client' component:
   ```typescript
   'use client'
   import posthog from 'posthog-js'
   import { PostHogProvider } from 'posthog-js/react'
   import { useEffect } from 'react'

   export function PHProvider({ children }: { children: React.ReactNode }) {
     useEffect(() => {
       if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
         posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
           api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
           person_profiles: 'identified_only',
           capture_pageview: false, // manual pageview tracking via PostHogPageView
           capture_pageleave: true,
           disable_session_recording: false, // all sessions recorded during beta per D-32
           session_recording: {
             maskAllInputs: false, // we want to see form interactions
             maskInputOptions: {
               password: true, // always mask password fields per D-34/ANLYT-03
             },
           },
           autocapture: true, // captures clicks, form submissions — enables rage click detection per SESS-04
         })
       }
     }, [])
     return <PostHogProvider client={posthog}>{children}</PostHogProvider>
   }
   ```

3. Create `app/posthog-pageview.tsx` — page view tracker with MANDATORY Suspense wrapper (Pitfall 1):
   ```typescript
   'use client'
   import { usePathname, useSearchParams } from 'next/navigation'
   import { useEffect, Suspense } from 'react'
   import { usePostHog } from 'posthog-js/react'

   function PostHogPageViewInner() {
     const pathname = usePathname()
     const searchParams = useSearchParams() // requires Suspense boundary
     const posthog = usePostHog()
     useEffect(() => {
       if (pathname && posthog) {
         let url = window.origin + pathname
         const search = searchParams?.toString()
         if (search) url += `?${search}`
         posthog.capture('$pageview', { $current_url: url })
       }
     }, [pathname, searchParams, posthog])
     return null
   }

   export function PostHogPageView() {
     return (
       <Suspense fallback={null}>
         <PostHogPageViewInner />
       </Suspense>
     )
   }
   ```

4. Create `lib/services/posthog-server.ts` — server-side singleton for route handlers (Pitfall 2):
   ```typescript
   import { PostHog } from 'posthog-node'

   let posthogClient: PostHog | null = null

   export function getPostHogServerClient(): PostHog {
     if (!posthogClient) {
       posthogClient = new PostHog(
         process.env.NEXT_PUBLIC_POSTHOG_KEY!,
         {
           host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://us.i.posthog.com',
           flushAt: 1,       // flush immediately — serverless functions die fast
           flushInterval: 0, // no batching delay
         }
       )
     }
     return posthogClient
   }

   /**
    * Capture a server-side event and force immediate flush.
    * Always await this — serverless function may terminate before async flush.
    * Per D-25: server-side events for data pull actions prevent ad blocker suppression.
    * Per ANLYT-03/D-24: never include PII — use userId not email, propertyId not address.
    */
   export async function captureServerEvent(params: {
     distinctId: string
     event: string
     properties?: Record<string, unknown>
   }): Promise<void> {
     const client = getPostHogServerClient()
     client.capture({
       distinctId: params.distinctId,
       event: params.event,
       properties: params.properties,
     })
     await client.shutdown() // force immediate flush in serverless
   }

   /**
    * Update person properties server-side.
    * Per D-26/ANLYT-11: person properties updated server-side on plan changes.
    */
   export async function setPersonProperties(
     distinctId: string,
     properties: Record<string, unknown>
   ): Promise<void> {
     const client = getPostHogServerClient()
     client.identify({ distinctId, properties })
     await client.shutdown()
   }
   ```

5. Create `tests/unit/posthog-config.test.ts` — behavioral verification that PostHog config flags are correct:
   ```typescript
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
   ```
  </action>
  <verify>
    <automated>cd /Users/sticky_iqqy_iqqy/real-estate-ai && npx tsc --noEmit app/providers.tsx app/posthog-pageview.tsx lib/services/posthog-server.ts 2>&1 | head -20; echo "---"; node -e "require('posthog-js'); require('posthog-node'); console.log('PostHog deps OK')"; echo "---"; npx vitest run tests/unit/posthog-config.test.ts --reporter=verbose</automated>
  </verify>
  <acceptance_criteria>
    - app/providers.tsx contains `'use client'`
    - app/providers.tsx contains `export function PHProvider`
    - app/providers.tsx contains `posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY`
    - app/providers.tsx contains `capture_pageview: false`
    - app/providers.tsx contains `disable_session_recording: false`
    - app/providers.tsx contains `password: true`
    - app/posthog-pageview.tsx contains `'use client'`
    - app/posthog-pageview.tsx contains `export function PostHogPageView`
    - app/posthog-pageview.tsx contains `<Suspense fallback={null}>`
    - app/posthog-pageview.tsx contains `useSearchParams()`
    - lib/services/posthog-server.ts contains `export function getPostHogServerClient`
    - lib/services/posthog-server.ts contains `export async function captureServerEvent`
    - lib/services/posthog-server.ts contains `export async function setPersonProperties`
    - lib/services/posthog-server.ts contains `flushAt: 1`
    - lib/services/posthog-server.ts contains `await client.shutdown()`
    - package.json contains `posthog-js`
    - package.json contains `posthog-node`
    - package.json contains `@tanstack/react-query`
    - tests/unit/posthog-config.test.ts exits 0
  </acceptance_criteria>
  <done>PostHog client/server libraries installed. PHProvider, PostHogPageView, and posthog-server singleton all created and type-check clean. Behavioral config tests pass.</done>
</task>

<task type="auto">
  <name>Task 2: Integrate PostHog into app layout</name>
  <files>app/layout.tsx</files>
  <read_first>
    - app/layout.tsx (current layout — will be modified)
    - app/providers.tsx (just created — import target)
    - app/posthog-pageview.tsx (just created — import target)
    - .planning/phases/02A-infrastructure-services/02A-RESEARCH.md (PHProvider + Layout Integration code example)
    - .planning/phases/02A-infrastructure-services/02A-CONTEXT.md (D-23: provider wraps entire layout)
  </read_first>
  <action>
Evolve `app/layout.tsx` to wrap the entire app with PHProvider per D-23. The wrapping order must be: PHProvider (outermost client provider) > ThemeProvider > children + Toaster.

Add these imports:
```typescript
import { PHProvider } from './providers'
import { PostHogPageView } from './posthog-pageview'
```

Update the body JSX to:
```tsx
<body className="min-h-full flex flex-col">
  <PHProvider>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <PostHogPageView />
      {children}
      <Toaster />
    </ThemeProvider>
  </PHProvider>
</body>
```

Key points:
- PHProvider wraps everything (D-23: wraps entire app layout)
- PostHogPageView is inside ThemeProvider but before {children} — it renders null, just fires events
- Toaster stays inside ThemeProvider (unchanged)
- All existing metadata, fonts, className — unchanged
- DO NOT change the html tag, className, or suppressHydrationWarning
  </action>
  <verify>
    <automated>cd /Users/sticky_iqqy_iqqy/real-estate-ai && npx next build 2>&1 | tail -10</automated>
  </verify>
  <acceptance_criteria>
    - app/layout.tsx contains `import { PHProvider } from './providers'`
    - app/layout.tsx contains `import { PostHogPageView } from './posthog-pageview'`
    - app/layout.tsx contains `<PHProvider>`
    - app/layout.tsx contains `<PostHogPageView />`
    - app/layout.tsx contains `<ThemeProvider` (still present, nested inside PHProvider)
    - app/layout.tsx contains `<Toaster />` (still present)
    - `npx next build` completes without error
  </acceptance_criteria>
  <done>PostHog wraps entire app. Session recording active. Page views tracked. Build succeeds.</done>
</task>

</tasks>

<verification>
- `npx next build` — builds without errors (PostHog integrated, Suspense boundary correct)
- `npx vitest run tests/unit/posthog-config.test.ts --reporter=verbose` — config flag tests pass
- `grep -n "PHProvider" app/layout.tsx` — PHProvider wraps children
- `grep -n "Suspense" app/posthog-pageview.tsx` — Suspense boundary present
- `grep -n "flushAt: 1" lib/services/posthog-server.ts` — serverless-safe config
</verification>

<success_criteria>
- PostHog JS + Node installed and in package.json
- @tanstack/react-query installed
- PHProvider wraps entire app layout (PHProvider > ThemeProvider > children)
- PostHogPageView with Suspense boundary tracks page views
- Server-side PostHog singleton with flushAt:1 and shutdown pattern
- Session recording enabled (disable_session_recording: false)
- Password inputs masked (maskInputOptions.password: true)
- Build succeeds with no hydration or Suspense errors
- Behavioral config tests verify critical PostHog flags
</success_criteria>

<output>
After completion, create `.planning/phases/02A-infrastructure-services/02A-02-SUMMARY.md`
</output>
