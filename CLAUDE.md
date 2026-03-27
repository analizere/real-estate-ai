@AGENTS.md

<!-- GSD:project-start source:PROJECT.md -->
## Project

**REvested — Real Estate Investment Analysis Platform**

A SaaS platform for real estate investors and wholesalers that eliminates the research legwork behind deal analysis. Enter any address and the platform automatically pulls public records, GIS, and zoning data, then runs BRRRR and DADU/ADU feasibility analysis with rent estimates — delivering a complete investment picture in under 60 seconds. Piloting in Pacific NW markets (OR/WA) where DADU/ADU activity is high and public data is accessible.

**Core Value:** Any address → complete investment analysis in under 60 seconds, without manual research.

### Constraints

- **API-first**: REST API must support web, mobile, and browser plugin from day one — do not build web-only shortcuts that break future clients
- **Two-tier pricing**: Free tier = BRRRR calculator only (acquisition funnel, no saving); Pro tier = $99/mo ($79/mo annual) with 50 lookups/month, $1.50 overage — free tier has zero API access
- **Variable data costs**: Live API calls (county records, Rentcast) metered per Pro user — 50 lookups/month included, $1.50 overage; skip trace credits TBD pending API cost evaluation
- **DADU data maintainability**: Zoning rules DB must be easy to update per market as rules change — do not hardcode zoning logic into app code
- **Market scoping**: Launch with 4 Pacific NW county-level markets (King, Snohomish, Pierce, Multnomah); data pipeline architecture must support adding new markets without code changes
- **Founder bandwidth**: Part-time build — phases should deliver working, testable features early so peer feedback can happen at each step
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.x - Entire application codebase (`app/`, `lib/`)
- JSX/TSX - React component syntax throughout
- JavaScript - Module scripts (`eslint.config.mjs`, `postcss.config.mjs`)
- CSS - Tailwind utilities and custom styles
## Runtime
- Node.js (version managed via npm)
- Browser runtime (Client and Server components)
- npm
- Lockfile: `package-lock.json` (present)
## Frameworks
- Next.js 16.2.1 - Full-stack React framework with server/client components
- React 19.2.4 - Component library
- React DOM 19.2.4 - React rendering
- Tailwind CSS 4 - Utility-first CSS framework
- Tailwind PostCSS 4 - CSS processing via PostCSS
- Geist (via `next/font/google`) - System font family from Vercel
- Geist Mono - Monospace variant
- TypeScript 5.x - Language and type checking
- ESLint 9 - Code linting
- ESLint Config Next 16.2.1 - Next.js specific rules
- PostCSS - CSS transformation pipeline
- Tailwind CSS PostCSS plugin - Processes Tailwind directives
## Key Dependencies
- next@16.2.1 - Framework (rendering, routing, SSR/SSG)
- react@19.2.4 - Core UI library
- react-dom@19.2.4 - React DOM bindings
- tailwindcss@4 - CSS framework (required for all styling)
- @tailwindcss/postcss@4 - Tailwind PostCSS plugin
- typescript@5 - Type checking
- @types/node@20 - Node.js type definitions
- @types/react@19 - React type definitions
- @types/react-dom@19 - React DOM type definitions
- eslint@9 - Linting
- eslint-config-next@16.2.1 - Next.js ESLint configuration
## Configuration
- `NEXT_PUBLIC_POSTHOG_KEY` — PostHog project API key
- `NEXT_PUBLIC_POSTHOG_HOST` — PostHog instance host URL
- `tsconfig.json` - TypeScript compiler options
- `next.config.ts` - Next.js configuration (minimal/empty)
- `eslint.config.mjs` - ESLint rules (Next.js core web vitals + TypeScript)
- `postcss.config.mjs` - PostCSS plugins (Tailwind CSS)
## Platform Requirements
- Node.js (version not pinned in package.json)
- npm (included with Node.js)
- Modern browser (ES2017 target)
- Node.js runtime (for Next.js server)
- Or: Static export via `npm run build` for static hosting (Vercel, Netlify, etc.)
- Modern browser support (ES2017)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Language & Runtime
- TypeScript with strict mode (`tsconfig.json`)
- React 19 with Next.js 16 App Router
- All component files use `.tsx` extension; data/utility files use `.ts`
## Naming Conventions
### Files
- React components: PascalCase (`DealAnalysis.tsx`, `BRRRRAnalysis.tsx`, `PropertyAnalysisClient.tsx`)
- Data/utility files: kebab-case (`mock-properties.ts`)
- Next.js route files: lowercase (`page.tsx`, `layout.tsx`)
### Variables & Functions
- camelCase for variables, functions, and hooks (`toNumber`, `currencyFmt`, `percentFmt`)
- PascalCase for types and interfaces (`DealAnalysisProps`, `SharedFinancialInputs`, `FieldDef`)
- SCREAMING_SNAKE_CASE: not observed
### Components
- Default exports for page-level and major components
- Named exports for shared types
## Code Style
### TypeScript
- Strict types with explicit prop types (`type DealAnalysisProps = {...}`)
- `type` keyword preferred over `interface`
- Form state typed as `string` fields (converted to numbers on use via `toNumber()`)
- `useMemo` for derived financial calculations
### React Patterns
- `"use client"` directive on interactive components
- Shared state lifted to parent (`PropertyAnalysisClient`) via prop drilling
- `useState` for local form inputs, `useMemo` for computed values
- No context API, no external state management
### Numeric Handling
- Inputs stored as strings in state, parsed on calculation
- `toNumber(value: string, fallback: number)` helper used across components
- `Intl.NumberFormat` for display formatting (currency and percent)
- Example:
### Imports
- React hooks imported explicitly from "react"
- Type imports use `import type` syntax
- No barrel files or index re-exports observed
## Styling
- Tailwind CSS v4 via PostCSS
- Utility-first class composition directly in JSX
- No CSS modules, no styled-components
- All shared UI components live in `/components/ui/` — never create one-off component files outside the library for reusable elements
## Error Handling
- No try/catch patterns observed in current codebase
- No error boundaries implemented
- Form inputs use fallback defaults (`toNumber(val, fallback)`)
## ESLint
- `eslint-config-next` v16.2.1
- Config in `eslint.config.mjs`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- React Server Components (RSC) for page layouts
- Client-side state management with React hooks (useState, useMemo)
- Financial calculator logic encapsulated in components
- Mock data layer with type-safe property objects
- Tailwind CSS for styling with custom color scheme
## Layers
- Purpose: UI components rendering property listings and analysis tools
- Location: `app/page.tsx`, `app/property/[id]/page.tsx`, analysis components
- Contains: React components (Server and Client), form inputs, result cards
- Depends on: Data layer (mock properties), utility formatters (Intl API)
- Used by: Next.js routing system
- Purpose: Mock property data and type definitions
- Location: `lib/mock-properties.ts`
- Contains: Property type definition, MOCK_PROPERTIES array, getPropertyById function
- Depends on: Nothing (pure data)
- Used by: All pages and analysis components
- Purpose: Financial calculations for real estate investment analysis
- Location: `app/property/[id]/DealAnalysis.tsx`, `app/property/[id]/BRRRRAnalysis.tsx`
- Contains: useMemo hooks for metric calculations, input validation via toNumber()
- Depends on: Shared financial state from PropertyAnalysisClient
- Used by: Property detail page
- Purpose: Shared financial inputs across multiple analysis tools
- Location: `app/property/[id]/PropertyAnalysisClient.tsx`
- Contains: SharedFinancialInputs type, SharedFinancialSetters type, central state holders
- Depends on: Nothing
- Used by: DealAnalysis and BRRRRAnalysis components
## Data Flow
- Purchase price, rehab cost, monthly rent: Managed centrally in PropertyAnalysisClient
- DealAnalysis-specific inputs: Down payment %, interest rate, loan term, tax, insurance, expenses, vacancy %
- BRRRRAnalysis-specific inputs: Carrying costs, ARV, refinance LTV %, refinance rate, original down payment %
- Both components receive and can update shared values through sharedSetters
## Key Abstractions
- Purpose: Represents a real estate listing with investment analysis metadata
- Location: `lib/mock-properties.ts` (lines 1-21)
- Pattern: TypeScript interface with nested daduOpportunity object
- Fields: price, address, location, beds, baths, sqft, description, daduOpportunity, imageClass
- Purpose: Central contract for financial parameters across analyses
- Location: `app/property/[id]/PropertyAnalysisClient.tsx` (lines 11-15)
- Pattern: Type definition passed as props to analysis components
- Contents: purchasePrice, rehabCost, monthlyRent (strings for input compatibility)
- Purpose: Format numbers as USD currency
- Location: Used in `DealAnalysis.tsx` (line 15), `BRRRRAnalysis.tsx` (line 28)
- Pattern: `new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })`
- Usage: Applied to loan amounts, payments, cash flow values
- Purpose: Safely parse string input to number with fallback
- Location: `DealAnalysis.tsx` (lines 43-46), `BRRRRAnalysis.tsx` (lines 34-37)
- Pattern: Pure function with isFinite check
- Why: Form inputs are strings; this prevents NaN propagation in calculations
- Purpose: Encapsulate financial formulas (mortgage, cap rate, cash-on-cash return)
- Location: useMemo blocks in DealAnalysis (lines 63-142) and BRRRRAnalysis (lines 104-172)
- Pattern: Memoized calculations dependent on input values
- Why: Prevents recalculation on every render; dependencies array ensures updates trigger recalc
## Entry Points
- Location: `app/page.tsx`
- Triggers: Client navigates to `/`
- Responsibilities: Render property grid, manage search filter, link to property details
- Location: `app/property/[id]/page.tsx`
- Triggers: Client navigates to `/property/[id]` or follows link from home
- Responsibilities: Fetch property data, render property details, mount analysis client
- Location: `app/layout.tsx`
- Triggers: On every page load (wraps all routes)
- Responsibilities: Set page metadata (title, description), inject global fonts (Geist), render HTML structure
## Error Handling
- `notFound()` called in PropertyDetailPage if property ID invalid (line 34)
- Type safety via TypeScript prevents null/undefined errors in data access
- No try-catch blocks; assumes mock data always valid
- Input validation via toNumber() fallbacks (prevents NaN, provides defaults)
- Form inputs validated implicitly (type="number" enforces numeric input)
## Cross-Cutting Concerns
- Input validation: HTML5 input type enforcement (type="number")
- Type validation: TypeScript compile-time checks
- Data validation: toNumber() fallbacks for string-to-number conversion
## Architectural Rules
- **Business logic separation (enforced every phase)**: All business logic must live in hooks, services, and API layers — never inside UI components directly. UI components receive data and callbacks via props only. This ensures the UI can be redesigned without touching business logic.
  - Hooks (`hooks/`): data fetching, form state, derived computations
  - Services (`lib/services/`): API calls, external integrations, data transformation
  - API layer (`app/api/`): server-side route handlers, auth guards, metering
  - UI components (`components/ui/`, `app/`): rendering and user interaction only — no fetch calls, no business rules, no direct data manipulation
- **Component library (enforced every phase)**: All UI is built from the shared component library in `/components/ui/`. No one-off hardcoded styles anywhere in the codebase. Every feature in every phase consumes from this library.
- **GIS/mapping data architecture (enforced from day one)**: The data schema and architecture must support the full post-MVP GIS layer without migration. Specifically:
  - Property records must include fields for utility expansion timeline data from day one: `plannedExpansionZone`, `projectedTimeline`, `fundingStatus`, `sourceDocument`, `confidenceLevel` — not just current utility status
  - Building footprint and parcel geometry must be stored and versioned so changes over time can be tracked
  - Frontage calculations (street and alley) must be computed from parcel geometry and stored as derived fields on the property record
  - The map component (when built) must use a pluggable layer system — new GIS overlays added without rearchitecting the component
  - All GIS data must feed into the DADU feasibility scoring engine, not just display on a map
  - Do not model property data as a flat record of current state — the schema must support temporal and spatial dimensions from phase 1
- **Analytics (PostHog — enforced from Phase 2)**: PostHog is the product analytics, session recording, cohort analysis, and feature flagging layer. All user-facing features must emit events following the event taxonomy defined in REQUIREMENTS.md (ANLYT-01 through ANLYT-11, ADMIN-01 through ADMIN-04, COHRT-01 through COHRT-05, CHURN-01 through CHURN-07, SESS-01 through SESS-07). Implementation rules:
  - PostHog provider wraps the entire app layout — do not initialize per-page; implement in Phase 2 before any feature UI
  - No PII in event properties — identify users by user ID not email, property_id not address, never log raw addresses
  - Use `posthog.capture()` for events, `posthog.identify()` for user identification
  - Session recording: all sessions for first 90 days of beta; after 90 days, all free tier sessions + first 5 sessions of every new paid user; flag rage clicks and paywall-without-upgrade sessions for priority review
  - Every new feature must include analytics events in its implementation — not as a follow-up task
  - Data pull events (`stage1_data_pull_started`, `stage2_data_pull_started`, etc.) fire server-side to prevent ad blocker suppression of cost-critical events; all user interaction events fire client-side
  - PostHog person properties must be updated server-side on plan changes to ensure accuracy
  - Mirror all metered actions from `usage_log` to PostHog — dual logging for cost visibility and product analytics
  - Use PostHog feature flags for A/B testing paywall placement and upgrade prompt copy
  - PostHog heatmaps configured on: Property Intelligence page, Portfolio page, pricing/upgrade modal
  - Cohort analysis configured from day one: retention cohorts (week 1, month 1), feature adoption cohorts, acquisition source cohorts, market cohorts, deal score cohorts
- **Property data caching (enforced from Phase 2)**: Field-level lazy invalidation architecture. Implementation rules:
  - Every property field has a cache TTL: static (180 days), semi-static (30 days), dynamic (24–48 hours), never-cache (skip trace)
  - Lazy invalidation only — stale fields are never refreshed proactively; only when a user accesses a view requiring those fields
  - Views declare which fields they need — list views never trigger refreshes for fields only needed on detail views
  - Cascade invalidation via dependency map — source field refresh invalidates computed fields that depend on it
  - Request deduplication — never fire duplicate API calls for the same field on the same property
  - `has_stale_fields` boolean on property records — page load checks this only, not per-field
- **Performance and code quality (enforced every phase)**:
  - **N+1 query prevention**: Zero N+1 queries anywhere in the codebase. All list views use batch or JOIN queries — never per-row queries in a loop. Any loop containing a database query is a bug.
  - **React Query (TanStack Query)**: Use for all client-side data fetching without exception. No raw `fetch()` calls in React components. Enables stale-while-revalidate, background refetching, request deduplication, and optimistic updates.
  - **Optimistic UI**: All user-initiated mutations (tag, list add/remove, save) must update UI instantly. Database writes happen in background. On failure: roll back UI change and show error toast.
  - **Background jobs**: Use Inngest or Trigger.dev for all async operations (export generation, zone invalidation sweeps, skip trace calls, email sending). No long-running synchronous operations in API route handlers. API routes must respond in under 500ms — offload anything slower.
  - **Edge caching**: Publicly shareable deal report pages cached at Vercel edge. Cache TTL: 5 minutes. Invalidate on analysis update.
  - **Soft deletes everywhere**: All user-created content (lists, tags, saved analyses, properties) use soft deletes (`deleted_at` timestamp). Never permanently delete user data without explicit multi-step confirmation.
- **Staged data pull architecture (enforced from Phase 2)**: Property data enrichment follows a two-stage architecture controlling API costs and building a proprietary cached database. Implementation rules:
  - Stage 1 (free tier): county assessor APIs, county GIS APIs, OpenStreetMap, Census TIGER files — all cached in ReVested's property database on first lookup; subsequent lookups served from cache with zero repeat API calls
  - Stage 2 (paid tier only, on demand): Rentcast API (rent estimates), skip trace API (never cached), ATTOM (comparable sales), ReVested DADU zoning rules database (internal — no external API cost)
  - Implement as `DataEnrichmentService` with `stage1Enrich(address)` and `stage2Enrich(propertyId, features[])` as distinct methods — the free/paid boundary must be explicit in the codebase
  - Track `cache_source` per field: county_api | gis_api | openstreetmap | rentcast | attom | internal
  - Graceful degradation required: show available data clearly, flag missing fields explicitly rather than failing silently
  - Cache hit rate tracked as a key infrastructure metric — the compounding property database is a competitive data asset
- **Data tier architecture (enforced from Phase 2)**: Three access tiers controlled by a central gating service. Implementation rules:
  - Tier 1 (always free): Stage 1 public data, manual calculator, Deal Score from manual data only
  - Tier 2 (preview free): show data clearly and completely — never blur, hide, or obscure; gate the action (include in analysis, save, export), not the visibility; "see everything, do more with Pro"
  - Tier 3 (Pro only): full enrichment, full analysis, full export capabilities
  - Feature gating controlled by a single configuration layer — never scatter `if user.plan === 'free'` checks in individual components
  - A single config file or database table defines feature-to-tier assignments; all components call the central gating service
  - Supports tier changes, A/B testing, and new tiers without rearchitecting; limits configurable per tier without code deployments
  - Anti-pattern: hardcoded plan checks in UI components — always use the central gating service
- **Usage metering (enforced from Phase 2)**: Every action with a cost implication must be logged before it executes. Implementation rules:
  - Log: user_id, timestamp, action_type, cost_estimate_cents, api_provider, property_id (nullable), metadata JSON, plan_at_time_of_action
  - Soft limits: every metered action checks configurable limit before executing; limits defined in central config per plan tier (same config as gating service)
  - At 80% of any limit: show usage indicator in account settings; at 100%: show clear message with upgrade/overage option — never silently fail
  - Limits can be set to "unlimited" — the check still runs, it just never blocks
  - Beta strategy (first 90 days): set all limits to unlimited, log everything, enforce nothing; analyze actual usage data to set informed limits before public launch
  - Admin dashboard: users sorted by estimated API cost and action volume; email alert when any user's monthly cost exceeds $25
- **Zoning data research (Phase 4 instruction)**: When Phase 4 (DADU Feasibility Engine) begins, before writing any code, use web research to compile complete ADU/DADU zoning rules for all 4 pilot markets from official public zoning codes and municipal websites. For each county compile: minimum lot size, maximum ADU size, setback requirements (front/rear/side), lot coverage limits, owner-occupancy requirements, ADU types permitted (attached/detached/garage conversion/basement), height limits, parking requirements, and any special conditions or overlay zones. Structure output as JSON ready for database import. Counties: King County WA (including Seattle, Bellevue, Redmond, Renton), Snohomish County WA (including Everett), Pierce County WA (including Tacoma), Multnomah County OR (including Portland). AI compiles from public sources, human verifies accuracy before import.
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
