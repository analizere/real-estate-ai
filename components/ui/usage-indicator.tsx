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
 *   - Shows yellow warning badge at 80–99%: "{used}/{limit} used"
 *   - Shows red exhausted badge at 100%: "Limit reached" / "Limit reached — upgrade for more"
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

  const item = data.usage.find((u) => u.actionType === actionType)
  if (!item) return null

  // During beta (all unlimited), show nothing
  if (item.limit === 'unlimited') return null

  // Below 80%, show nothing (no visual noise per D-21 interaction contract)
  if (!item.isWarning && !item.isExhausted) return null

  // 100%: red exhausted badge
  if (item.isExhausted) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 ${compact ? '' : 'ml-2'}`}
      >
        {compact ? 'Limit reached' : 'Limit reached — upgrade for more'}
      </span>
    )
  }

  // 80–99%: yellow warning badge (isWarning && !isExhausted)
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 ${compact ? '' : 'ml-2'}`}
    >
      {compact ? `${item.used}/${item.limit}` : `${item.used}/${item.limit} used`}
    </span>
  )
}
