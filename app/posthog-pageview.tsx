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
