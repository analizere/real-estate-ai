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
