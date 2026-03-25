# Architecture Research

**Domain:** Real estate investment analysis SaaS
**Researched:** 2026-03-25
**Confidence:** MEDIUM — Core patterns from domain knowledge and project requirements; Next.js v16 specifics flagged where docs were not available (node_modules not installed)

---

## Standard Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Web App     │  │  Mobile App  │  │  Browser Plugin      │   │
│  │ (Next.js 16) │  │ (post-MVP)   │  │ (post-MVP)           │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
└─────────┼─────────────────┼──────────────────────┼──────────────┘
          │                 │                      │
          └─────────────────┴──────────────────────┘
                            │  REST API (versioned: /api/v1/)
┌───────────────────────────▼──────────────────────────────────────┐
│                         API LAYER                                │
│  ┌──────────────────┐  ┌──────────────┐  ┌────────────────────┐  │
│  │  Auth Middleware  │  │  Rate Limit  │  │  Feature Gates     │  │
│  │  (session/JWT)   │  │  (per-user)  │  │  (free vs. paid)   │  │
│  └──────────────────┘  └──────────────┘  └────────────────────┘  │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  /property   │  │  /analysis   │  │  /user + /billing    │   │
│  │  (lookup)    │  │  (BRRRR/DADU)│  │  (Stripe webhooks)   │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
└─────────┼─────────────────┼──────────────────────┼──────────────┘
          │                 │                      │
┌─────────▼─────────────────▼──────────────────────▼──────────────┐
│                       SERVICE LAYER                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  Property    │  │  Analysis    │  │  Subscription        │   │
│  │  Service     │  │  Engine      │  │  Service             │   │
│  └──────┬───────┘  └──────┬───────┘  └──────────┬───────────┘   │
│         │                 │                      │               │
│  ┌──────▼───────┐  ┌──────▼───────┐              │               │
│  │  Data        │  │  Calculator  │              │               │
│  │  Aggregator  │  │  (BRRRR/DADU)│              │               │
│  └──────┬───────┘  └──────────────┘              │               │
└─────────┼────────────────────────────────────────┼──────────────┘
          │                                        │
┌─────────▼────────────────────────────────────────▼──────────────┐
│                       DATA LAYER                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │  PostgreSQL  │  │  Market      │  │  External API        │   │
│  │  (core DB)   │  │  Pipeline    │  │  Adapters            │   │
│  │              │  │  Registry    │  │  (county/GIS/Rentcast)│   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└──────────────────────────────────────────────────────────────────┘
```

### Component Responsibilities

| Component | Responsibility | Typical Implementation |
|-----------|----------------|------------------------|
| Next.js App Router | Web UI + API routes in one process | `app/` directory with `api/` subdirectory |
| Auth Middleware | Validate session/JWT, attach user to request context | Next.js middleware.ts at root |
| Feature Gate | Check user tier (free/paid) before allowing expensive operations | Middleware or service-level check |
| Property Service | Orchestrate data fetch — delegates to Market Pipeline per market | TypeScript class/module in `lib/services/` |
| Market Pipeline | Per-market adapter for county assessor + GIS APIs | Adapter pattern, one file per market |
| Analysis Engine | Execute BRRRR and DADU feasibility calculations | Pure functions, no I/O |
| Zoning Rules DB | Source-of-truth for DADU rules per municipality | PostgreSQL tables, admin-editable |
| Data Aggregator | Merge data from multiple sources (assessor + GIS + cached) | Result-merge logic per field |
| Subscription Service | Validate plan, enforce metering, handle Stripe events | Stripe SDK integration |
| External API Adapters | Isolated wrappers for each 3rd-party API | One module per external service |

---

## Recommended Project Structure

```
app/
├── api/
│   └── v1/
│       ├── property/
│       │   └── [address]/route.ts     # GET — property lookup (paid)
│       ├── analysis/
│       │   ├── brrrr/route.ts         # POST — BRRRR calculation
│       │   └── dadu/route.ts          # POST — DADU feasibility (paid)
│       ├── user/
│       │   └── route.ts               # GET/PATCH user profile
│       └── billing/
│           ├── route.ts               # POST — create checkout session
│           └── webhook/route.ts       # POST — Stripe webhook handler
├── (auth)/
│   ├── login/page.tsx
│   └── signup/page.tsx
├── dashboard/page.tsx                 # Protected — user's saved analyses
├── property/
│   └── [address]/page.tsx             # Property detail + analysis UI
└── layout.tsx

lib/
├── services/
│   ├── property.ts                    # Property lookup orchestration
│   ├── analysis/
│   │   ├── brrrr.ts                   # BRRRR calculation engine (pure)
│   │   └── dadu.ts                    # DADU feasibility engine (pure)
│   ├── billing.ts                     # Stripe interactions
│   └── subscription.ts               # Plan/tier checks
├── pipelines/
│   ├── registry.ts                    # Market registry — maps market slug to pipeline
│   ├── portland-or/
│   │   ├── index.ts                   # Portland pipeline entry point
│   │   ├── assessor.ts                # Multnomah/Washington County assessor adapter
│   │   └── gis.ts                     # Portland GIS adapter
│   └── seattle-wa/
│       ├── index.ts
│       ├── assessor.ts                # King County assessor adapter
│       └── gis.ts                     # Seattle GIS adapter
├── adapters/
│   └── rentcast.ts                    # Rentcast API wrapper
├── db/
│   ├── client.ts                      # DB connection (Prisma or pg)
│   ├── schema/
│   │   ├── users.ts
│   │   ├── analyses.ts
│   │   └── zoning-rules.ts
│   └── queries/
│       ├── zoning.ts                  # Zoning rules queries
│       └── analyses.ts               # Saved analysis queries
├── auth/
│   └── session.ts                     # Auth helpers
└── middleware.ts                      # Next.js middleware (auth + tier gates)

types/
├── property.ts                        # Property and address types
├── analysis.ts                        # BRRRR/DADU input/output types
├── market.ts                          # Market/pipeline contract types
└── user.ts                            # User and subscription types
```

### Structure Rationale

- **`app/api/v1/`:** Version prefix in URL from day one. Changing API contracts later without breaking mobile clients is expensive; versioning costs nothing up front.
- **`lib/pipelines/`:** Market-scoped directories. Adding a new market (e.g., Eugene OR) means adding a new directory with its own adapters — no changes to existing pipeline code.
- **`lib/pipelines/registry.ts`:** Central map from market slug to pipeline. The property service resolves the correct pipeline at runtime by looking up the market — no switch statements scattered across the codebase.
- **`lib/adapters/`:** One file per external API (Rentcast, future Zillow, etc.). Isolation ensures that when an API changes, the blast radius is one file.
- **`lib/services/analysis/`:** Pure functions (no I/O). Calculators receive typed inputs and return typed outputs. This makes them testable without a DB or API call.
- **`types/`:** Shared TypeScript types separate from implementation, avoiding circular imports between services and DB layers.

---

## Architectural Patterns

### Pattern 1: Adapter Pattern for Market Pipelines

**What:** Each market (Portland, Seattle) implements a common `MarketPipeline` interface. The property service calls the interface — not the market-specific implementation.

**When to use:** Any time you have multiple implementations of the same operation (county assessor in Multnomah County vs. King County have different APIs, different field names, different auth).

**Trade-offs:** Extra indirection, but adding market #3 requires zero changes to any calling code. Without this pattern, adding Seattle after Portland means editing the property service directly.

**Example:**
```typescript
// types/market.ts
export interface MarketPipeline {
  readonly marketSlug: string
  fetchPropertyData(address: NormalizedAddress): Promise<PropertyData>
  fetchZoningData(parcelId: string): Promise<ZoningData>
}

// lib/pipelines/registry.ts
import { portlandPipeline } from './portland-or'
import { seattlePipeline } from './seattle-wa'

const registry: Record<string, MarketPipeline> = {
  'portland-or': portlandPipeline,
  'seattle-wa': seattlePipeline,
}

export function getPipeline(marketSlug: string): MarketPipeline {
  const pipeline = registry[marketSlug]
  if (!pipeline) throw new Error(`No pipeline for market: ${marketSlug}`)
  return pipeline
}
```

### Pattern 2: Zoning Rules as Data, Not Code

**What:** DADU rules (setbacks, lot coverage limits, owner-occupancy requirements) are stored in the database as structured rows — not as if/else logic in code. The feasibility engine reads rules at runtime and applies them.

**When to use:** Any rules that change independently of deployments. Portland changed its ADU rules in 2021, 2023, and again in 2024. Encoding these in code means a deployment for every rule change.

**Trade-offs:** More complex DB schema; rules must be expressive enough to cover all edge cases. Pays off when rules change frequently (DADU markets).

**Example schema (conceptual):**
```
zoning_rules
  id
  market_slug         (e.g., "portland-or")
  municipality        (e.g., "city_of_portland", "beaverton")
  zone_code           (e.g., "R1", "R2", "R2.5")
  rule_type           (e.g., "max_lot_coverage_pct", "min_rear_setback_ft", "owner_occupancy_required")
  value               (numeric or boolean as text)
  effective_date
  source_url
  updated_at
  updated_by
```

The DADU engine then queries relevant rules for the property's zone and municipality, evaluates them against property attributes, and returns a structured feasibility result.

### Pattern 3: Tier Gate at the Service Layer, Not Route Layer

**What:** Feature gating (free vs. paid) is enforced in the service function, not in the API route handler. The route calls the service; the service checks the user's tier before making expensive external calls.

**When to use:** When the same service function might be called from multiple routes (web route, internal admin route, future mobile route). Gate once in the service, not once per route.

**Trade-offs:** Slightly less visible than middleware gating; must be disciplined to apply it consistently. But prevents the common mistake of adding a new route and forgetting to add the gate.

**Example:**
```typescript
// lib/services/property.ts
export async function lookupProperty(
  address: NormalizedAddress,
  user: AuthUser
): Promise<PropertyLookupResult> {
  if (!user.isPaidTier) {
    throw new TierGateError('Property lookup requires a paid subscription')
  }
  // proceed with external API calls
}
```

### Pattern 4: Idempotent Analysis Storage

**What:** When a paid user runs an analysis, store the result. If they run the same analysis again (same address, same inputs), return the cached result without re-calling external APIs.

**When to use:** Any time external API calls cost money or have rate limits (county assessor, Rentcast). Eliminates duplicate charges for the same lookup.

**Trade-offs:** Cache invalidation complexity. Decide on a staleness policy (e.g., property data stale after 7 days, rent estimates stale after 30 days).

---

## Data Flow

### Property Lookup Flow (Paid Tier)

```
User enters address
    ↓
POST /api/v1/property/lookup  { address: "..." }
    ↓
Auth Middleware validates session → attaches user to request
    ↓
Tier Gate: user.plan === 'paid'? → reject with 402 if not
    ↓
PropertyService.lookup(address, marketSlug)
    ↓
Check cache: analysis exists and fresh? → return cached
    ↓
getPipeline(marketSlug) → correct MarketPipeline
    ↓
pipeline.fetchPropertyData(address)  (county assessor API)
    ↓
pipeline.fetchZoningData(parcelId)   (GIS API)
    ↓
rentcastAdapter.getRentEstimate(address)  (Rentcast API)
    ↓
zoningRulesDB.query(municipality, zoneCode)  (local DB)
    ↓
DataAggregator.merge(assessorData, gisData, rentEstimate, zoningRules)
    ↓
Store result in analyses table
    ↓
Return PropertyLookupResult to client
```

### DADU Feasibility Flow

```
PropertyLookupResult (has lot size, zoneCode, municipality)
    ↓
POST /api/v1/analysis/dadu  { propertyId, inputs }
    ↓
Auth + Tier Gate (paid only)
    ↓
zoningRulesDB.query(municipality, zoneCode) → RuleSet[]
    ↓
daduEngine.assess(propertyAttributes, ruleSet) → DADUFeasibilityResult
    ↓
Return: { feasible, constraintChecks, recommendations }
```

### BRRRR Calculation Flow (Free Tier Eligible)

```
User provides manual inputs (purchase, rehab, ARV, etc.)
    ↓
POST /api/v1/analysis/brrrr  { inputs }
    ↓
Auth Middleware (must be logged in, any tier)
    ↓
brrrrEngine.calculate(inputs) → BRRRRResult
    ↓
(Optional) Store result if user wants to save
    ↓
Return BRRRRResult
```

Note: BRRRR with automated property data (pre-filled inputs) requires the paid lookup first. BRRRR with manual inputs is free tier.

### Freemium Gate Summary

```
Free tier:
  POST /api/v1/analysis/brrrr  ← manual inputs only, no auto-fill

Paid tier adds:
  GET  /api/v1/property/lookup  ← auto-fills property data
  POST /api/v1/analysis/dadu    ← requires zoning data from lookup
  (BRRRR with auto-filled inputs via lookup)
```

---

## Zoning Rules Database Design

The zoning rules database is the most maintenance-sensitive component. Design it for human editability.

### Schema Principles

1. **Per-rule rows, not per-property rows.** A rule applies to a zone code in a municipality — not to a specific parcel. Store it once, apply it to thousands of parcels.

2. **Versioned via effective_date.** When Portland changes a rule on 2026-01-01, add a new row with that effective date rather than updating the old row. The engine uses the most recent rule effective on the date of analysis.

3. **Source URL required.** Every rule row must have a URL to the municipal code or ordinance that establishes it. This makes manual audits tractable.

4. **Separate `rule_type` from `value`.** Enables querying "what is the max lot coverage for R2 in Portland?" without parsing encoded strings.

5. **Admin UI from day one.** Rules will need to be updated without code deploys. Build a minimal admin page (or use a tool like Retool/Prisma Studio initially) that allows editing rules and adding new municipalities.

### Feasibility Engine Contract

The engine is a pure function: `assess(propertyAttributes, rules[]) → FeasibilityResult`. It does not query the database. The service layer fetches the rules and passes them in. This makes the engine fully unit-testable.

```typescript
// types/analysis.ts
interface PropertyAttributes {
  lotSizeSqft: number
  existingStructureSqft: number
  zoneCode: string
  municipality: string
  hasExistingADU: boolean
}

interface ZoningRule {
  ruleType: string
  value: string
  effectiveDate: Date
}

interface FeasibilityCheck {
  ruleName: string
  passed: boolean
  actual: string
  required: string
}

interface DADUFeasibilityResult {
  overallFeasible: boolean
  checks: FeasibilityCheck[]
  warnings: string[]
}
```

---

## Integration Points

### External Services

| Service | Integration Pattern | Paid-Gate | Notes |
|---------|---------------------|-----------|-------|
| County Assessor APIs (OR/WA) | HTTP client in pipeline adapter, per-market | Yes | Different auth per county; Multnomah uses different format than King County |
| City GIS APIs (Portland, Seattle) | HTTP client in pipeline adapter | Yes | GIS often returns GeoJSON; normalize to internal schema |
| Rentcast | HTTP client in `lib/adapters/rentcast.ts` | Yes | Rate-limited; cache results 30 days |
| Stripe | Stripe SDK in `lib/services/billing.ts` | N/A | Webhook endpoint required for subscription lifecycle events |
| Auth provider | NextAuth.js or Clerk in `lib/auth/` | N/A | JWT or session cookie; must attach user to all API requests |

### Internal Boundaries

| Boundary | Communication | Notes |
|----------|---------------|-------|
| API routes ↔ Services | Direct function call (same process) | No HTTP overhead; keep services pure — no req/res objects |
| Services ↔ DB | Prisma ORM or `pg` | Services own queries; no raw SQL in route handlers |
| Services ↔ External Adapters | Async function call | Adapters throw typed errors; services handle and translate |
| Analysis Engine ↔ Services | Function call, typed I/O only | Engine has zero imports from DB or adapter modules |
| Pipeline ↔ Registry | Interface contract | Registry is the only place that imports concrete pipeline implementations |

---

## Scaling Considerations

| Scale | Architecture Adjustments |
|-------|--------------------------|
| 0-500 users | Single Next.js process handles API + UI. Vercel or Railway deployment. No queue needed. PostgreSQL on Supabase or Railway. |
| 500-5k users | Add Redis for caching property lookup results (avoid re-calling county APIs). Add a job queue (BullMQ or Inngest) for async property lookup if assessor APIs are slow. |
| 5k+ users | Consider separating the API into a standalone service if Next.js bundle size or cold start times become a bottleneck. Market pipelines can become dedicated workers. |

### Scaling Priorities

1. **First bottleneck: external API latency.** County assessor and GIS APIs can be slow (2-5s). Cache aggressively. Consider moving property lookup to an async flow (webhook callback or polling) rather than blocking HTTP.
2. **Second bottleneck: zoning rules query pattern.** As market coverage grows, the rules table grows. Index on (municipality, zone_code, effective_date). Queries should remain sub-10ms.
3. **Third bottleneck: Rentcast rate limits.** Rentcast has per-plan limits. Cache rent estimates per address for 30 days minimum.

---

## Anti-Patterns

### Anti-Pattern 1: Per-Market Conditionals in the Property Service

**What people do:** `if (market === 'portland') { ... } else if (market === 'seattle') { ... }` directly in the property service.

**Why it's wrong:** Adding market #3 requires editing the service. Branching logic grows without bound. Tests require mocking every market path.

**Do this instead:** Adapter pattern with a registry. `getPipeline(marketSlug)` resolves the correct adapter. The service has zero market-specific code.

### Anti-Pattern 2: Zoning Rules Hardcoded in Application Code

**What people do:** `const maxLotCoverage = zoneCode === 'R1' ? 0.35 : 0.45` as constants or functions in the analysis engine.

**Why it's wrong:** Rule changes require code deployments. Portland changed its DADU rules multiple times in 3 years — you will need to update rules without shipping code.

**Do this instead:** Rules live in the database. The engine is a rule interpreter, not a rule store.

### Anti-Pattern 3: Exposing External API Keys to the Client

**What people do:** Calling Rentcast or county APIs directly from the browser to avoid building a backend.

**Why it's wrong:** API keys are exposed in browser network requests. Anyone can scrape your key and run up your bill. Also bypasses the tier gate entirely.

**Do this instead:** All external API calls go through the Next.js API layer. API keys live in server-side environment variables only.

### Anti-Pattern 4: Unbounded Free Tier Lookups

**What people do:** Building the lookup feature first without the gate, planning to add billing later.

**Why it's wrong:** Variable costs (Rentcast, assessor APIs) run up before revenue exists. Retrofitting a gate after users expect free access creates churn.

**Do this instead:** Build the gate first. Free tier manual calculators can ship before any external API integration. The gate is already in place when paid features launch.

### Anti-Pattern 5: Analysis Engine with Database Imports

**What people do:** Having the BRRRR or DADU engine query the DB directly inside the calculation logic.

**Why it's wrong:** Makes the engine untestable without a database. Financial logic bugs are hard enough to catch — eliminating I/O from the engine is mandatory for reliable testing.

**Do this instead:** Pass all required data (zoning rules, property attributes) as arguments. The engine returns a result. Zero imports from `lib/db/`.

---

## Key Architectural Decisions (Make Early)

These decisions are expensive to reverse after features are built:

| Decision | Options | Recommendation | Why Early |
|----------|---------|----------------|-----------|
| API versioning strategy | Path prefix (`/api/v1/`) vs. header vs. none | Path prefix from day one | Mobile clients can't update as fast as web; need stable API contracts |
| Auth strategy | NextAuth.js vs. Clerk vs. Auth0 vs. custom | Clerk or NextAuth.js | Auth touches every route; retrofitting is a full rewrite |
| Database ORM | Prisma vs. Drizzle vs. raw pg | Prisma (better DX for solo dev) or Drizzle (lighter) | Schema migrations are hard to redo once data exists |
| Zoning rules schema | JSON blob vs. typed rows | Typed rows (separate rule per row) | JSON blobs make querying and auditing hard; typed rows enable admin UI |
| Pipeline interface contract | Defined before any pipeline is implemented | Define first | If Portland adapter is built without an interface, Seattle adapter will diverge |

---

## Suggested Build Order (Dependency Graph)

The following order minimizes rework. Each phase produces testable output.

```
1. Types + Interfaces (no implementation)
   └─ PropertyAttributes, MarketPipeline interface, ZoningRule, AnalysisResult types

2. Database Schema + Migrations
   └─ Users, ZoningRules, Analyses tables
   └─ Seed: 2-3 Portland zone codes with DADU rules

3. Auth Layer
   └─ Sign up, log in, session validation
   └─ Auth middleware for API routes

4. Analysis Engines (pure functions, no I/O)
   └─ BRRRR calculator
   └─ DADU feasibility evaluator
   └─ Unit tests for each

5. API Routes — Calculation Endpoints (no external data yet)
   └─ POST /api/v1/analysis/brrrr
   └─ POST /api/v1/analysis/dadu (with manually-seeded zoning rules)

6. Billing + Tier Gates
   └─ Stripe checkout, subscription lifecycle
   └─ Tier gate middleware/service check

7. External API Adapters
   └─ Rentcast adapter
   └─ Portland OR pipeline (assessor + GIS)

8. Property Lookup Endpoint (paid)
   └─ GET /api/v1/property/lookup
   └─ Ties together: pipeline, Rentcast, zoning DB query, result cache

9. Web UI (consumes the API)
   └─ Property search → lookup → analysis display

10. Seattle WA Pipeline (second market)
    └─ Proves the adapter pattern generalizes
    └─ Zero changes to property service
```

This order means the DADU engine is working and tested before any GIS API is integrated. Billing is in place before paid features launch. The second market pipeline validates the architecture before it becomes load-bearing.

---

## Sources

- Project requirements: `.planning/PROJECT.md` (confidence: HIGH — primary source)
- Existing codebase analysis: `.planning/codebase/ARCHITECTURE.md`, `.planning/codebase/CONCERNS.md` (confidence: HIGH)
- Next.js App Router API routes pattern: Training knowledge on Next.js conventions; Next.js node_modules not available for verification — flag for confirmation against `node_modules/next/dist/docs/` when installed (confidence: MEDIUM)
- Adapter pattern for multi-source data: Standard software design pattern (confidence: HIGH)
- Rentcast API capabilities: `.planning/codebase/INTEGRATIONS.md` references + known public API (confidence: MEDIUM — verify rate limits and caching policy against Rentcast docs)
- Stripe webhook architecture: Standard Stripe integration pattern (confidence: HIGH)
- Zoning rules as data pattern: Derived from PROJECT.md requirement "DADU data maintainability: do not hardcode zoning logic into app code" (confidence: HIGH)

---

*Architecture research for: Real estate investment analysis SaaS (Pacific NW pilot)*
*Researched: 2026-03-25*
