# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-25
**Phase:** 01-foundation
**Areas discussed:** shadcn preset, Email transport, External services readiness, Deployment target

---

## shadcn Preset

| Option | Description | Selected |
|--------|-------------|----------|
| New York | Compact, data-dense feel; suits analytics/metrics tools | ✓ |
| Default | More spacious, conventional SaaS look | |

**Border radius:**

| Option | Description | Selected |
|--------|-------------|----------|
| 6px (0.375rem) | Matches UI-SPEC --radius value | ✓ |
| 4px | Sharper, more technical | |
| 8px | Softer, rounder | |

**User's choice:** New York style, 6px radius, zinc base color.
**Notes:** Init command: `npx shadcn@latest init --style new-york --base-color zinc`

---

## Email Transport

| Option | Description | Selected |
|--------|-------------|----------|
| Resend | Native Better Auth adapter, free tier 3k/month, API key in minutes | ✓ |
| Nodemailer + SMTP | Self-hosted SMTP or Gmail; free but rate-limited | |
| AWS SES | Cheapest at scale; overkill for MVP | |

**Resend setup status:**

| Option | Description | Selected |
|--------|-------------|----------|
| Already have it | Account and API key ready | |
| Need to set it up | Plan includes provisioning task | ✓ |

**User's choice:** Resend, needs account creation. Use resend.dev sandbox during development.
**Notes:** No custom domain for Phase 1. Production sender domain deferred.

---

## External Services Readiness

| Option | Description | Selected |
|--------|-------------|----------|
| Neon database | Have connection string ready | |
| Stripe account | Have Stripe test mode accessible | |
| Google OAuth credentials | Have client ID and secret | |
| None yet | Everything needs to be set up from scratch | ✓ |

**Stripe product setup:**

| Option | Description | Selected |
|--------|-------------|----------|
| Plan includes it | Create Product + Price in test mode as plan task | ✓ |
| Handle manually | User sets up Stripe products; plan only has integration code | |

**Domain:**

| Option | Description | Selected |
|--------|-------------|----------|
| No domain yet — use sandbox | Resend sandbox, Neon default string, localhost for dev | ✓ |
| Using a custom domain | Domain to verify with Resend + configure on Vercel | |

**Stripe webhooks:**

| Option | Description | Selected |
|--------|-------------|----------|
| Webhook endpoint + DB sync | /api/v1/webhooks/stripe receives events, syncs to Neon | ✓ |
| Polling only | Check Stripe API on account settings page load | |

**Google OAuth setup:**

| Option | Description | Selected |
|--------|-------------|----------|
| Plan includes setup instructions | Step-by-step task for Google Cloud project + OAuth client | ✓ |
| Handle manually | User creates credentials; plan only has auth config code | |

**User's choice:** All four services need provisioning. Plan includes full setup instructions for each. Stripe webhook via `/api/v1/webhooks/stripe`. Stripe CLI for local webhook development.
**Notes (user-supplied):** Provisioning tasks must include: complete `.env.example`, Neon connection pooling gotcha, Stripe CLI local webhook command, Google OAuth redirect URI configuration for both localhost and production, and other common setup gotchas.

---

## Deployment Target

| Option | Description | Selected |
|--------|-------------|----------|
| Vercel deployment as part of Phase 1 | Deploy to Vercel; peer investors get real URL | ✓ |
| Local dev only | Phase 1 complete when running locally; deployment later | |

**Vercel readiness:**

| Option | Description | Selected |
|--------|-------------|----------|
| Not yet — plan includes Vercel setup | Create Vercel project, link repo, add env vars, first deploy | ✓ |
| Already connected | Vercel already linked to repo | |

**User's choice:** Vercel deployment is part of Phase 1 definition of done. No Vercel account connected yet. Plan includes setup steps.
**Notes:** Use Vercel-assigned `.vercel.app` URL for Phase 1. No custom domain. Update `NEXT_PUBLIC_APP_URL` and Google OAuth redirect URI after first deploy.

---

## Claude's Discretion

- Database schema table names and column conventions
- Better Auth session configuration (expiry, cookie settings)
- API route organization under `/api/v1/`
- Middleware vs per-route guard pattern for freemium gating
- `next-themes` or `class` strategy for dark mode toggle

## Deferred Ideas

None surfaced during discussion.
