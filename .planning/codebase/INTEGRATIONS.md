# External Integrations

**Analysis Date:** 2026-03-25

## APIs & External Services

**Status:**
- None detected - Application is fully self-contained

**Note:**
- No third-party API calls in codebase
- No SDK imports or API clients
- All data is mock/static

## Data Storage

**Databases:**
- None - Application uses only in-memory mock data

**Current Data Source:**
- `lib/mock-properties.ts` - Static TypeScript array of 8 mock property objects
  - Contains property listings for Oregon homes (Springfield, Portland, Newport, Eugene, Bend, Lake Oswego, Salem, Astoria)
  - Types: `Property` interface with pricing, location, specs, and DADU opportunity data

**File Storage:**
- Local filesystem only - `public/` directory for static assets
- No cloud storage integration

**Caching:**
- None - Application uses browser cache implicitly via React state and memoization

## Authentication & Identity

**Auth Provider:**
- None - No authentication required
- Application is public/unauthenticated

## Monitoring & Observability

**Error Tracking:**
- None detected

**Logs:**
- Browser console only (implicit via React/Next.js dev warnings)
- No structured logging

## CI/CD & Deployment

**Hosting:**
- Not specified in codebase
- Deployable to Vercel (Next.js creator platform)
- Deployable to any Node.js server
- Exportable as static HTML/CSS/JS

**CI Pipeline:**
- None detected

## Environment Configuration

**Required env vars:**
- None - Application has no environment variable dependencies

**Secrets location:**
- No secrets in codebase
- No `.env` file required

## Webhooks & Callbacks

**Incoming:**
- None

**Outgoing:**
- None

## Future Integration Points

**Potential Integrations (not yet implemented):**
- Real estate data API (MLS, Zillow, Redfin, etc.) to replace mock data
- Authentication provider (Auth0, Firebase Auth, NextAuth.js) if user accounts needed
- Database (PostgreSQL, MongoDB, Supabase, Firebase) to persist user analysis/saved properties
- Payment processor (Stripe, Square) if monetization added
- Real estate valuation API (Zillow API, PropertyShark, etc.) for property estimates
- AI/ML service for property recommendation engine

---

*Integration audit: 2026-03-25*
