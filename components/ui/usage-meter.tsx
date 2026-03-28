'use client'
import { useUsage } from '@/hooks/use-usage'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

/**
 * Display name mapping per UI-SPEC copywriting contract.
 * Maps actionType keys from getUserUsageSummary to user-visible labels.
 */
const ACTION_DISPLAY_NAMES: Record<string, string> = {
  stage1_lookup: 'Property Lookups',
  stage2_lookup: 'Property Lookups',
  skip_trace: 'Skip Traces',
  save_analysis: 'Saved Analyses',
  export_pdf: 'PDF Exports',
}

type UsageRowProps = {
  actionType: string
  used: number
  limit: number | 'unlimited'
  percentage: number
  isWarning: boolean
  isExhausted: boolean
  daysUntilReset: number
}

/**
 * Single usage row — label, progress bar, counter, reset label.
 * Progress bar height h-2 (8px) per UI-SPEC spacing scale (sm = 8px).
 * Colors: accent (0–79%), text-yellow-600 (80–99%), text-destructive (100%).
 */
function UsageMeterRow({
  actionType,
  used,
  limit,
  percentage,
  isWarning,
  isExhausted,
  daysUntilReset,
}: UsageRowProps) {
  const label = ACTION_DISPLAY_NAMES[actionType] ?? actionType
  const isUnlimited = limit === 'unlimited'

  // Per UI-SPEC color contract:
  // 0–79%: accent (#006aff)
  // 80–99%: text-yellow-600 (warning)
  // 100%: text-destructive
  const fillColor = isExhausted
    ? 'bg-destructive text-destructive'
    : isWarning
      ? 'bg-yellow-500 text-yellow-600'
      : 'bg-[#006aff]'

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
        <span className="text-xs font-medium">
          {isUnlimited ? 'Unlimited' : `${used}/${limit}`}
        </span>
      </div>
      {!isUnlimited && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className={cn('h-2 rounded-full transition-all', fillColor)}
            style={{ width: `${Math.min(100, percentage)}%` }}
            aria-valuenow={percentage}
            aria-valuemin={0}
            aria-valuemax={100}
            role="progressbar"
          />
        </div>
      )}
      <p className="text-xs font-medium text-muted-foreground">
        Resets in {daysUntilReset} days
      </p>
    </div>
  )
}

/**
 * UsageMeterCard — full usage card for Account Settings.
 * Renders below SubscriptionStatusCard, above the Profile section.
 *
 * States:
 *   - Loading: Skeleton placeholder
 *   - Error: "Could not load usage data. Refresh to try again."
 *   - Empty: "No activity this month yet."
 *   - Beta (all unlimited): shows "All limits are set to unlimited during beta."
 *   - Normal: progress bars per action type with Separator between rows
 */
export function UsageMeterCard() {
  const { data, isLoading, isError } = useUsage()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4">
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (isError) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">
            Could not load usage data. Refresh to try again.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (!data || data.usage.length === 0) {
    return (
      <Card>
        <CardContent className="p-4">
          <p className="text-sm text-muted-foreground">No activity this month yet.</p>
        </CardContent>
      </Card>
    )
  }

  const allUnlimited = data.usage.every((item) => item.limit === 'unlimited')
  // Deduplicate rows: stage1_lookup and stage2_lookup both map to "Property Lookups"
  // Show stage2_lookup row (paid tier lookup) if it exists, otherwise stage1_lookup
  const deduplicatedUsage = (() => {
    const seen = new Set<string>()
    return data.usage.filter((item) => {
      const displayName = ACTION_DISPLAY_NAMES[item.actionType] ?? item.actionType
      if (seen.has(displayName)) return false
      seen.add(displayName)
      return true
    })
  })()

  return (
    <Card>
      <CardContent className="space-y-4 p-4">
        <h2 className="text-base font-medium leading-[1.2]">Usage This Month</h2>
        {allUnlimited && (
          <p className="text-xs text-muted-foreground">
            All limits are set to unlimited during beta.
          </p>
        )}
        <div className="space-y-4">
          {deduplicatedUsage.map((item, index) => (
            <div key={item.actionType}>
              {index > 0 && <Separator className="mb-4" />}
              <UsageMeterRow
                actionType={item.actionType}
                used={item.used}
                limit={item.limit}
                percentage={item.percentage}
                isWarning={item.isWarning}
                isExhausted={item.isExhausted}
                daysUntilReset={data.daysUntilReset}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
