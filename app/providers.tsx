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
