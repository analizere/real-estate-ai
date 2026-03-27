---
phase: 02A-infrastructure-services
plan: 05
type: execute
wave: 3
depends_on: [02A-02, 02A-03]
files_modified:
  - lib/services/posthog-events.ts
  - app/api/v1/usage/route.ts
  - app/api/v1/webhooks/stripe/route.ts
  - components/ui/usage-meter.tsx
  - components/ui/usage-indicator.tsx
  - hooks/use-usage.ts
  - app/account/settings/page.tsx
  - app/query-provider.tsx
autonomous: true
requirements: [ANLYT-04, ANLYT-08, ANLYT-11, SESS-07, METER-02, METER-05, METER-08, METER-09]
user_setup:
  - service: posthog
    why: "Product analytics, session recording, feature flags"
    env_vars:
      - name: NEXT_PUBLIC_POSTHOG_KEY
        source: "PostHog Dashboard -> Settings -> Project API Key"
      - name: NEXT_PUBLIC_POSTHOG_HOST
        source: "PostHog Dashboard -> Settings -> Instance URL (e.g., https://us.i.posthog.com)"
    dashboard_config:
      - task: "Create PostHog Cloud project (US region)"
        location: "posthog.com -> New Project -> US Cloud"

must_haves:
  truths:
    - "User lifecycle events (signed_up, signed_in, signed_out, subscription_started, subscription_cancelled, upgrade_clicked) fire to PostHog"
    - "PostHog person properties are updated server-side on subscription changes"
    - "Usage API endpoint returns per-action-type summary with used/limit/percentage"
    - "UsageMeter component renders in Account Settings with progress bars per action type"
    - "UsageIndicator skeleton component exists for inline 80% warning on features (D-18/D-21)"
    - "React Query fetches usage data (no raw fetch in components per CLAUDE.md)"
  artifacts:
    - path: "lib/services/posthog-events.ts"
      provides: "Type-safe event capture functions for Phase 2A lifecycle events"
      exports: ["trackSignedUp", "trackSignedIn", "trackSignedOut", "trackSubscriptionStarted", "trackSubscriptionCancelled", "trackUpgradeClicked"]
    - path: "app/api/v1/usage/route.ts"
      provides: "GET endpoint returning per-action usage summary"
      exports: ["GET"]
    - path: "components/ui/usage-meter.tsx"
      provides: "UsageMeter component with progress bars, warning, exhausted states"
      exports: ["UsageMeter"]
    - path: "components/ui/usage-indicator.tsx"
      provides: "UsageIndicator inline component skeleton for contextual 80% warnings (D-18/D-21)"
      exports: ["UsageIndicator"]
    - path: "hooks/use-usage.ts"
      provides: "React Query hook for usage data"
      exports: ["useUsage"]
    - path: "app/query-provider.tsx"
      provides: "React Query provider wrapping app"
      exports: ["QueryProvider"]
  key_links:
    - from: "components/ui/usage-meter.tsx"
      to: "hooks/use-usage.ts"
      via: "useUsage hook for data fetching"
      pattern: "import.*useUsage.*from.*use-usage"
    - from: "hooks/use-usage.ts"
      to: "app/api/v1/usage/route.ts"
      via: "fetch /api/v1/usage"
      pattern: "fetch.*api/v1/usage"
    - from: "app/account/settings/page.tsx"
      to: "components/ui/usage-meter.tsx"
      via: "UsageMeter component import"
      pattern: "import.*UsageMeter.*from.*usage-meter"
    - from: "components/ui/usage-indicator.tsx"
      to: "hooks/use-usage.ts"
      via: "useUsage hook for data fetching"
      pattern: "import.*useUsage.*from.*use-usage"
---

<objective>
Wire PostHog lifecycle events, create the usage API endpoint, build the UsageMeter UI component, create the UsageIndicator inline skeleton for contextual 80% warnings, and integrate into Account Settings. This plan connects the services from Plans 02-03 to the user-facing layer.

Purpose: Users can see their usage in Account Settings. PostHog captures lifecycle events for analytics. React Query provides the data fetching layer per CLAUDE.md mandate. UsageIndicator skeleton is ready for Phase 2B consumers to embed inline on features (D-18/D-21).
Output: Event capture helpers, usage API route, UsageMeter component, UsageIndicator skeleton, Account Settings integration.
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
@.planning/phases/02A-infrastructure-services/02A-UI-SPEC.md
@.planning/phases/02A-infrastructure-services/02A-02-SUMMARY.md
@.planning/phases/02A-infrastructure-services/02A-03-SUMMARY.md

<interfaces>
<!-- From Plan 02 — PostHog server client -->
From lib/services/posthog-server.ts:
```typescript
export async function captureServerEvent(params: { distinctId: string; event: string; properties?: Record<string, unknown> }): Promise<void>;
export async function setPersonProperties(distinctId: string, properties: Record<string, unknown>): Promise<void>;
```

<!-- From Plan 03 — usage service -->
From lib/services/usage.ts:
```typescript
export async function getUserUsageSummary(userId: string, plan: 'free' | 'pro'): Promise<UsageSummaryItem[]>;
type UsageSummaryItem = {
  actionType: string; used: number; limit: number | 'unlimited';
  percentage: number; isWarning: boolean; isExhausted: boolean;
}
```

<!-- From Plan 03 — gating service -->
From lib/services/gating.ts:
```typescript
export async function authenticateAndCheckTier(): Promise<GatingResult>;
export async function getUserTier(userId: string): Promise<'free' | 'pro'>;
```

<!-- From UI-SPEC — exact copy for UsageMeter -->
Copywriting contract:
- Section heading: "Usage This Month"
- Lookup row: "Property Lookups"
- Skip trace row: "Skip Traces"
- Saved analyses row: "Saved Analyses"
- PDF exports row: "PDF Exports"
- Unlimited: "Unlimited"
- Resets label: "Resets in {N} days"
- Beta notice: "All limits are set to unlimited during beta."
- Empty state: "No activity this month yet."
- Error state: "Could not load usage data. Refresh to try again."
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create PostHog lifecycle events and usage API endpoint</name>
  <files>lib/services/posthog-events.ts, app/api/v1/usage/route.ts, app/query-provider.tsx</files>
  <read_first>
    - lib/services/posthog-server.ts (captureServerEvent, setPersonProperties — from Plan 02)
    - lib/services/usage.ts (getUserUsageSummary — from Plan 03)
    - lib/services/gating.ts (authenticateAndCheckTier, getUserTier — from Plan 03)
    - app/api/v1/usage/route.ts (existing usage route — may need to be evolved)
    - .planning/phases/02A-infrastructure-services/02A-CONTEXT.md (D-29 through D-31: event scoping)
    - .planning/phases/02A-infrastructure-services/02A-RESEARCH.md (ANLYT-04 requirements)
  </read_first>
  <action>
1. Create `lib/services/posthog-events.ts` — type-safe event capture functions per D-29 (Phase 2A only these events):

```typescript
import posthog from 'posthog-js'
import { captureServerEvent, setPersonProperties } from './posthog-server'

/**
 * Phase 2A lifecycle events ONLY (D-29):
 * - signed_up, signed_in, signed_out
 * - subscription_started, subscription_cancelled, upgrade_clicked
 *
 * DO NOT add calculator/portfolio/DADU events here — they wire up in their respective phases (D-30).
 */

// Client-side events (user interactions per D-25)
export function trackSignedUp(method: 'email' | 'google'): void {
  posthog.capture('signed_up', { method })
}

export function trackSignedIn(method: 'email' | 'google'): void {
  posthog.capture('signed_in', { method })
}

export function trackSignedOut(): void {
  posthog.capture('signed_out')
}

export function trackUpgradeClicked(source: string): void {
  posthog.capture('upgrade_clicked', { source })
}

// Server-side events (subscription changes per D-25/D-26)
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
```

2. Create `app/query-provider.tsx` — React Query provider ('use client'):

```typescript
'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }))
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

Then update `app/layout.tsx` to wrap with QueryProvider (inside PHProvider, alongside ThemeProvider):
```tsx
<PHProvider>
  <QueryProvider>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <PostHogPageView />
      {children}
      <Toaster />
    </ThemeProvider>
  </QueryProvider>
</PHProvider>
```

3. Evolve `app/api/v1/usage/route.ts` — GET endpoint returning per-action usage summary:

```typescript
import { authenticateAndCheckTier } from "@/lib/services/gating"
import { getUserUsageSummary } from "@/lib/services/usage"
import { getUserTier } from "@/lib/services/gating"
import { NextResponse } from "next/server"

export async function GET() {
  const auth = await authenticateAndCheckTier()
  if (!auth.authorized) return auth.response

  const tier = await getUserTier(auth.userId)
  const summary = await getUserUsageSummary(auth.userId, tier)

  // Calculate days until reset (first of next month)
  const now = new Date()
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1)
  const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

  return NextResponse.json({
    usage: summary,
    plan: tier,
    daysUntilReset,
    resetsAt: nextMonth.toISOString(),
  })
}
```
  </action>
  <verify>
    <automated>cd /Users/sticky_iqqy_iqqy/real-estate-ai && npx tsc --noEmit lib/services/posthog-events.ts app/query-provider.tsx 2>&1 | head -10</automated>
  </verify>
  <acceptance_criteria>
    - lib/services/posthog-events.ts contains `export function trackSignedUp(`
    - lib/services/posthog-events.ts contains `export function trackSignedIn(`
    - lib/services/posthog-events.ts contains `export function trackSignedOut(`
    - lib/services/posthog-events.ts contains `export function trackUpgradeClicked(`
    - lib/services/posthog-events.ts contains `export async function trackSubscriptionStarted(`
    - lib/services/posthog-events.ts contains `export async function trackSubscriptionCancelled(`
    - lib/services/posthog-events.ts contains `setPersonProperties`
    - lib/services/posthog-events.ts contains comment about D-29 and D-30
    - app/api/v1/usage/route.ts contains `export async function GET(`
    - app/api/v1/usage/route.ts contains `getUserUsageSummary`
    - app/api/v1/usage/route.ts contains `daysUntilReset`
    - app/query-provider.tsx contains `'use client'`
    - app/query-provider.tsx contains `export function QueryProvider`
    - app/query-provider.tsx contains `QueryClientProvider`
    - app/layout.tsx contains `import { QueryProvider }`
    - app/layout.tsx contains `<QueryProvider>`
  </acceptance_criteria>
  <done>PostHog lifecycle event capture functions created (6 events per D-29). Usage API endpoint returns per-action summary with reset date. React Query provider wraps app.</done>
</task>

<task type="auto">
  <name>Task 2: Build UsageMeter, UsageIndicator skeleton, and integrate into Account Settings</name>
  <files>components/ui/usage-meter.tsx, components/ui/usage-indicator.tsx, hooks/use-usage.ts, app/account/settings/page.tsx</files>
  <read_first>
    - .planning/phases/02A-infrastructure-services/02A-UI-SPEC.md (full component spec, copywriting contract, interaction contract, color/spacing rules)
    - app/account/settings/page.tsx (current Account Settings page — UsageMeter goes below SubscriptionStatusCard)
    - components/ui/card.tsx (Card, CardContent — UsageMeter wrapper)
    - components/ui/badge.tsx (Badge — inline counter)
    - components/ui/alert.tsx (Alert — 80% warning, 100% block)
    - components/ui/separator.tsx (Separator — divides rows)
    - components/ui/skeleton.tsx (Skeleton — loading state)
    - app/api/v1/usage/route.ts (just created — response shape for hook)
    - .planning/phases/02A-infrastructure-services/02A-CONTEXT.md (D-18, D-19, D-20, D-21: metering UX decisions)
  </read_first>
  <action>
1. Create `hooks/use-usage.ts` — React Query hook per CLAUDE.md mandate (no raw fetch):

```typescript
import { useQuery } from '@tanstack/react-query'

type UsageSummaryItem = {
  actionType: string
  used: number
  limit: number | 'unlimited'
  percentage: number
  isWarning: boolean
  isExhausted: boolean
}

type UsageResponse = {
  usage: UsageSummaryItem[]
  plan: 'free' | 'pro'
  daysUntilReset: number
  resetsAt: string
}

export function useUsage() {
  return useQuery<UsageResponse>({
    queryKey: ['usage'],
    queryFn: async () => {
      const res = await fetch('/api/v1/usage')
      if (!res.ok) throw new Error('Failed to fetch usage')
      return res.json()
    },
    staleTime: 60 * 1000, // 1 minute
    refetchInterval: 5 * 60 * 1000, // refresh every 5 minutes
  })
}
```

2. Create `components/ui/usage-meter.tsx` following UI-SPEC exactly:

Props: `actionType: string`, `used: number`, `limit: number | 'unlimited'`, `resetsAt: Date`

The component renders a single row in the usage card:
- Label (12px, weight 500, text-muted-foreground): action type display name
- Progress bar: `div` with `h-2` (8px per UI-SPEC spacing), rounded, width set by percentage
  - Fill color: accent (0-79%), warning/text-yellow-600 (80-99%), destructive/text-destructive (100%)
- Counter: "{used}/{limit}" or "Unlimited" (12px, weight 500)
- Reset label: "Resets in {N} days" (12px, weight 500, text-muted-foreground)

States:
- Normal (0-79%): accent fill, no banner
- Warning (80-99%): yellow fill, no banner (banner is separate Alert, not part of this component)
- Exhausted (100%): destructive fill
- Unlimited: show "Unlimited" label, no progress bar

Display name mapping:
```typescript
const ACTION_DISPLAY_NAMES: Record<string, string> = {
  stage1_lookup: 'Property Lookups',    // UI-SPEC exact copy
  stage2_lookup: 'Property Lookups',
  skip_trace: 'Skip Traces',
  save_analysis: 'Saved Analyses',
  export_pdf: 'PDF Exports',
}
```

Full UsageMeter card component (used in Account Settings):
```typescript
export function UsageMeterCard() {
  const { data, isLoading, isError } = useUsage()

  if (isLoading) return <Card><CardContent className="p-4"><Skeleton className="h-32 w-full" /></CardContent></Card>

  if (isError) return (
    <Card><CardContent className="p-4">
      <p className="text-sm text-muted-foreground">Could not load usage data. Refresh to try again.</p>
    </CardContent></Card>
  )

  if (!data || data.usage.length === 0) return (
    <Card><CardContent className="p-4">
      <p className="text-sm text-muted-foreground">No activity this month yet.</p>
    </CardContent></Card>
  )

  // Section heading: "Usage This Month" (16px, weight 500)
  // Beta notice: "All limits are set to unlimited during beta." (if all limits are unlimited)
  // For each metered action: UsageMeterRow with Separator between rows
  // Reset label at bottom
}
```

3. Create `components/ui/usage-indicator.tsx` — inline contextual usage indicator skeleton per D-18/D-21:

```typescript
'use client'
import { useUsage } from '@/hooks/use-usage'

/**
 * UsageIndicator — inline contextual usage indicator for specific features.
 * Per D-18: 80% warning surfaces BOTH inline on the relevant feature AND in Account Settings.
 * Per D-21: Contextual inline indicators on specific features (address search bar, skip trace, etc.)
 *
 * This is the SKELETON component. Phase 2B consumers embed this next to their features:
 *   <UsageIndicator actionType="stage2_lookup" />  — next to address search bar
 *   <UsageIndicator actionType="skip_trace" />     — next to skip trace button
 *
 * Props:
 *   actionType: string — the action type key to display usage for
 *   compact?: boolean — if true, show only "{used}/{limit}" without label (default: false)
 *
 * Behavior:
 *   - Hidden when usage < 80% (no visual noise)
 *   - Shows yellow warning badge at 80-99%: "8/10 used"
 *   - Shows red exhausted badge at 100%: "Limit reached"
 *   - Shows nothing during beta (all unlimited)
 */
export function UsageIndicator({
  actionType,
  compact = false,
}: {
  actionType: string
  compact?: boolean
}) {
  const { data } = useUsage()
  if (!data) return null

  const item = data.usage.find(u => u.actionType === actionType)
  if (!item) return null

  // During beta (all unlimited), show nothing
  if (item.limit === 'unlimited') return null

  // Below 80%, show nothing (no visual noise)
  if (!item.isWarning && !item.isExhausted) return null

  // 80-99%: yellow warning
  if (item.isWarning && !item.isExhausted) {
    return (
      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 ${compact ? '' : 'ml-2'}`}>
        {compact ? `${item.used}/${item.limit}` : `${item.used}/${item.limit} used`}
      </span>
    )
  }

  // 100%: red exhausted
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 ${compact ? '' : 'ml-2'}`}>
      {compact ? 'Limit reached' : 'Limit reached — upgrade for more'}
    </span>
  )
}
```

4. Update `app/account/settings/page.tsx`:
   - Import `UsageMeterCard` from `@/components/ui/usage-meter`
   - Add `<UsageMeterCard />` BELOW the `<SubscriptionStatusCard />` and ABOVE the `<Separator />` before Profile section
   - The placement per UI-SPEC: "Renders in Account Settings page below the SubscriptionStatusCard, above the Profile section"
  </action>
  <verify>
    <automated>cd /Users/sticky_iqqy_iqqy/real-estate-ai && npx next build 2>&1 | tail -10</automated>
  </verify>
  <acceptance_criteria>
    - components/ui/usage-meter.tsx contains `export function UsageMeterCard`
    - components/ui/usage-meter.tsx contains `"Usage This Month"`
    - components/ui/usage-meter.tsx contains `"Property Lookups"`
    - components/ui/usage-meter.tsx contains `"Skip Traces"`
    - components/ui/usage-meter.tsx contains `"Saved Analyses"`
    - components/ui/usage-meter.tsx contains `"PDF Exports"`
    - components/ui/usage-meter.tsx contains `"Unlimited"`
    - components/ui/usage-meter.tsx contains `"Resets in"`
    - components/ui/usage-meter.tsx contains `"All limits are set to unlimited during beta."`
    - components/ui/usage-meter.tsx contains `"No activity this month yet."`
    - components/ui/usage-meter.tsx contains `"Could not load usage data. Refresh to try again."`
    - components/ui/usage-meter.tsx contains `h-2` (8px progress bar height per UI-SPEC)
    - components/ui/usage-meter.tsx contains `text-yellow-600` (warning color per UI-SPEC)
    - components/ui/usage-meter.tsx contains `text-destructive` (exhausted color per UI-SPEC)
    - components/ui/usage-indicator.tsx contains `export function UsageIndicator`
    - components/ui/usage-indicator.tsx contains `isWarning`
    - components/ui/usage-indicator.tsx contains `isExhausted`
    - components/ui/usage-indicator.tsx contains `"Limit reached"`
    - hooks/use-usage.ts contains `useQuery`
    - hooks/use-usage.ts contains `/api/v1/usage`
    - app/account/settings/page.tsx contains `UsageMeterCard`
    - app/account/settings/page.tsx contains `import.*UsageMeterCard.*from.*usage-meter`
    - `npx next build` completes without error
  </acceptance_criteria>
  <done>UsageMeter component renders in Account Settings with progress bars per action type. UsageIndicator skeleton exists for Phase 2B inline contextual warnings (D-18/D-21). React Query hook fetches from usage API. All UI-SPEC copy strings match exactly. Build succeeds.</done>
</task>

</tasks>

<verification>
- `npx next build` — builds without errors
- `grep "signed_up\|signed_in\|signed_out\|subscription_started\|subscription_cancelled\|upgrade_clicked" lib/services/posthog-events.ts` — all 6 events present
- `grep "Usage This Month" components/ui/usage-meter.tsx` — exact copy from UI-SPEC
- `grep "useQuery" hooks/use-usage.ts` — React Query used (not raw fetch)
- `grep "UsageMeterCard" app/account/settings/page.tsx` — integrated in settings
- `grep "UsageIndicator" components/ui/usage-indicator.tsx` — inline indicator skeleton exists
</verification>

<success_criteria>
- 6 PostHog lifecycle event functions (D-29 scope only — no future feature events)
- Server-side subscription events update person properties (D-26/ANLYT-11)
- Usage API returns per-action summary with daysUntilReset
- React Query provider wraps app (CLAUDE.md mandate)
- UsageMeter renders in Account Settings with exact UI-SPEC copy
- UsageIndicator skeleton component exists for Phase 2B consumers to embed inline on features (D-18/D-21)
- Progress bar colors: accent (0-79%), yellow-600 (80-99%), destructive (100%)
- Loading (Skeleton), error, empty, beta states all handled
- Build succeeds
</success_criteria>

<output>
After completion, create `.planning/phases/02A-infrastructure-services/02A-05-SUMMARY.md`
</output>
