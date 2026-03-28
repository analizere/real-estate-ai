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

/**
 * React Query hook for fetching the authenticated user's usage summary.
 * Per CLAUDE.md mandate: no raw fetch() calls in components — use this hook.
 *
 * Fetches from /api/v1/usage which returns per-action-type summary with
 * used/limit/percentage/isWarning/isExhausted for each metered action.
 *
 * Used by: UsageMeterCard (Account Settings), UsageIndicator (inline contextual warnings)
 */
export function useUsage() {
  return useQuery<UsageResponse>({
    queryKey: ['usage'],
    queryFn: async () => {
      const res = await fetch('/api/v1/usage')
      if (!res.ok) throw new Error('Failed to fetch usage')
      return res.json()
    },
    staleTime: 60 * 1000, // 1 minute — usage data is not real-time critical
    refetchInterval: 5 * 60 * 1000, // background refresh every 5 minutes
  })
}
