# Roadmap: Real Estate Investment Analysis Platform

## Overview

Eight phases that build the platform in strict dependency order: foundation first (auth, billing, API layer); then infrastructure services (gating, metering, analytics, DataEnrichmentService skeleton) so every paid feature ships already gated and tracked; then the free-tier BRRRR calculator with Deal Score so validation investors can evaluate deals; then portfolio management (lists, tags, saves) so users can organize their pipeline; then investor profiles, onboarding, and the full caching architecture; then the DADU feasibility engine built against the zoning rules database; then the King County WA paid data pipeline as the first proof of the adapter pattern; then the remaining three markets plus reports and UX polish. Each phase delivers a working, testable artifact that can go in front of peer investors.

## Phases

**Phase Numbering:**
- Letter sub-phases (2A, 2B, 2C): Planned splits of a major milestone
- Decimal phases (2A.1, 3.1): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding phases in order.

- [x] **Phase 1: Foundation** - Auth, database schema, billing/metering infrastructure, and versioned API layer
- [ ] **Phase 2A: Infrastructure Services** - Gating service, usage metering, PostHog analytics, session recording, DataEnrichmentService skeleton
- [ ] **Phase 2B: BRRRR Calculator & Deal Score** - BRRRR analyzer, supporting calculators, Deal Score, manual property entry, sensitivity analysis
- [ ] **Phase 2C: Portfolio Management** - Property lists, tags, saved analyses, deal history, quick actions
- [ ] **Phase 3: Investor Profile, Onboarding & Caching** - User configuration defaults, target markets, onboarding flow, field-level caching architecture, admin dashboard
- [ ] **Phase 4: DADU Feasibility Engine** - Zoning rules database seeded for all 4 markets, feasibility engine, DADU UI
- [ ] **Phase 5: King County Paid Data Pipeline** - King County WA assessor + GIS adapter, Rentcast integration, paid property lookup
- [ ] **Phase 6: Remaining Markets, Reports & UX** - Snohomish County WA, Pierce County WA, and Multnomah County OR pipelines, deal reports, PDF export, UX polish

## Phase Details

### Phase 1: Foundation
**Goal**: The platform has working user accounts, a schema that supports multi-market data from day one, server-enforced freemium gating, and a versioned REST API — so every subsequent feature ships already authenticated, metered, and gated.
**Depends on**: Nothing (first phase)
**Requirements**: AUTH-01, AUTH-02, AUTH-03, AUTH-04, AUTH-05, BILL-01, BILL-02, BILL-03, BILL-04, BILL-05, BILL-06, API-01, API-02, API-03
**Success Criteria** (what must be TRUE):
  1. User can create an account with email/password, receive a verification email, and sign in with Google OAuth
  2. User can reset a forgotten password via an emailed link and stay logged in across browser refresh without re-authenticating
  3. User can subscribe to the paid tier via Stripe, view their subscription status, and cancel from account settings
  4. Any attempt to call a paid-tier feature from a free-tier account is rejected at the Route Handler level, not just in the UI
  5. Every automated data lookup is recorded in a usage log tied to the user account before the lookup executes
**Plans**: 5 plans

Plans:
- [x] 01-01-PLAN.md — Infrastructure skeleton: deps, shadcn, DB schema, Better Auth config
- [x] 01-02-PLAN.md — Component library: 17 custom components (layout, nav, data display, states)
- [x] 01-03-PLAN.md — Auth UI pages: sign-up, sign-in, forgot/reset password, verify email
- [x] 01-04-PLAN.md — Billing backend: Stripe checkout, freemium gating, usage metering
- [x] 01-05-PLAN.md — Account settings, home page, end-to-end verification checkpoint

**UI hint**: yes

### Phase 2A: Infrastructure Services
**Goal**: The platform has a central gating service controlling feature access by tier, a usage metering pipeline that logs every cost-bearing action before it executes, PostHog analytics with session recording and cohort analysis configured, and a DataEnrichmentService skeleton defining the Stage 1/Stage 2 boundary — so every feature built in 2B and 2C ships already gated, metered, and instrumented.
**Depends on**: Phase 1
**Requirements**: TIER-01, TIER-02, TIER-03, TIER-04, TIER-05, TIER-06, TIER-07, METER-01, METER-02, METER-04, METER-05, METER-08, METER-09, METER-10, ANLYT-01, ANLYT-02, ANLYT-03, ANLYT-04, ANLYT-08, ANLYT-10, ANLYT-11, SESS-01, SESS-02, SESS-03, SESS-04, SESS-05, SESS-06, SESS-07, COHRT-01, COHRT-02, COHRT-03, COHRT-04, COHRT-05, DATA-01, DATA-02, DATA-03, DATA-05, DATA-06, DATA-07, DATA-08, DATA-09, DATA-10
**Success Criteria** (what must be TRUE):
  1. A single configuration layer defines feature-to-tier assignments (Tier 1/2/3) — all components call this gating service, never individual plan checks
  2. Every metered action (data pulls, skip traces, saves, exports) is logged with user_id, cost estimate, and provider before execution — verified by integration test
  3. PostHog provider wraps the entire app, session recording is active, and user lifecycle events (signup, signin, subscription changes) fire correctly
  4. PostHog cohorts (retention, feature adoption, acquisition source, market, deal score) are configured and receiving data
  5. DataEnrichmentService exists with `stage1Enrich()` and `stage2Enrich()` method signatures, cache TTL definitions, and `cache_source` tracking — even if Stage 1 adapters are stubs
  6. Soft limits are enforced: 80% warning, 100% block with upgrade prompt, beta override sets all to unlimited
**Plans**: 6 plans

**Note**: ANLYT-09 (operational events: address outside coverage, data inaccuracy reports) is deferred per D-30 — these events wire up in the phases where those features are built, not in infrastructure setup.

Plans:
- [ ] 02A-01-PLAN.md — Feature tier config, schemas (feature_overrides + expanded usage_log)
- [ ] 02A-02-PLAN.md — PostHog provider, pageview tracker, server-side client, layout integration
- [ ] 02A-03-PLAN.md — Hybrid 3-tier GatingService + full METER-01 usage metering
- [ ] 02A-04-PLAN.md — DataEnrichmentService interface contract + stub implementations
- [ ] 02A-05-PLAN.md — PostHog lifecycle events, usage API, UsageMeter + UsageIndicator UI in Account Settings
- [ ] 02A-06-PLAN.md — End-to-end wiring (enrichment endpoint), SESS-05 paywall flagging, Stripe webhook events, PostHog dashboard config

### Phase 2B: BRRRR Calculator & Deal Score
**Goal**: A free-tier user can run a complete BRRRR analysis and all supporting financial calculations using manually entered property data, see a Deal Score summarizing deal quality, and adjust inputs with real-time recalculation — giving validation investors something real to evaluate deals before any paid data integration exists.
**Depends on**: Phase 2A
**Requirements**: CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06, PROP-02, PROP-03, DEAL-01, DEAL-02, DEAL-03, DEAL-04, DEAL-05, DEAL-06, DEAL-07, ANLYT-05
**Success Criteria** (what must be TRUE):
  1. Free-tier user can enter property details manually (address, beds, baths, sqft, lot size, purchase price, zoning) and run a BRRRR analysis without any paywall
  2. User can see monthly cash flow, annual cash-on-cash return, cap rate, DSCR, and GRM calculated from their inputs in real time
  3. User can override any individual input field with a custom value at any time without losing other calculated results
  4. Every analyzed property displays a Deal Score (0-100) with color-coded band (Poor/Fair/Good/Strong) as the most visually prominent element
  5. Deal Score recomputes in real time when any input changes, with component breakdown visible on Pro tier
  6. Analysis flow events fire to PostHog (analysis_started, analysis_completed, deal_score_computed)
**Plans**: TBD
**UI hint**: yes

### Phase 2C: Portfolio Management
**Goal**: Users can save analyses, organize properties into lists with tags, and return to their deal history — building a persistent pipeline management workflow on top of the calculator.
**Depends on**: Phase 2B
**Requirements**: PROP-04, PROP-06, PROP-07, LIST-01, LIST-02, LIST-03, LIST-04, LIST-05, TAG-01, TAG-02, TAG-03, TAG-04, TAG-05, TAG-06, METER-03, ANLYT-07
**Success Criteria** (what must be TRUE):
  1. User can save an analysis and see it in a deal history list sorted by most recently viewed, and return to it in its saved state
  2. Pro-tier user can create, rename, and soft-delete property lists, and add/remove properties from lists
  3. Users have up to 5 custom tags (color-coded), can apply multiple tags per property via single-tap, and tagged properties auto-populate system-generated lists
  4. All tag and list operations use optimistic UI — instant visual update, background database write, rollback with error toast on failure
  5. Large list exports (50+ properties) are queued as background jobs with toast notification when ready
  6. Property detail page has quick actions accessible without scrolling: tag, add to list, get owner info, save analysis, share analysis
**Plans**: TBD
**UI hint**: yes

### Phase 3: Investor Profile, Onboarding & Caching
**Goal**: A new user is guided through their first analysis and can configure personal defaults that pre-populate future analyses — making every subsequent session faster and more relevant to their investment strategy. The full field-level caching architecture is operational so that downstream data pipeline phases (4, 5, 6) have cache infrastructure to build on. Admin dashboard provides founder visibility into usage and costs.
**Depends on**: Phase 2C
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, ONBD-01, ONBD-02, ONBD-03, CACHE-01, CACHE-02, CACHE-03, CACHE-04, CACHE-05, CACHE-06, CACHE-07, CACHE-08, CACHE-09, CHURN-01, CHURN-02, CHURN-03, CHURN-04, CHURN-05, CHURN-06, CHURN-07, METER-06, METER-07, METER-11, ADMIN-01, ADMIN-02, ADMIN-03, ADMIN-04
**Success Criteria** (what must be TRUE):
  1. First-time user is guided step by step through running their first property analysis, with both free and paid tier value demonstrated before the flow completes
  2. User can set target markets, investment strategy, minimum cash flow threshold, and financial assumption defaults (down payment %, interest rate, rehab cost per sqft) from account settings
  3. Financial assumption defaults pre-populate the matching input fields when a user starts a new analysis
  4. User can skip onboarding at any point and re-access it from account settings
  5. Field-level caching is operational: TTLs by field type (static 180d, semi-static 30d, dynamic 24-48h), lazy invalidation, cascade invalidation via dependency map, request deduplication, stale-while-revalidate UI
  6. Admin dashboard shows daily/weekly/monthly metrics including per-user API cost, usage volume, churn signals, and cache hit rates
  7. Churn monitoring triggers are configured (14-day inactive, paywall friction, data quality frustration, etc.)
**Plans**: TBD
**UI hint**: yes

### Phase 4: DADU Feasibility Engine
**Goal**: For any property with a known zoning designation in all four launch markets, a paid-tier user can see whether a DADU/ADU is permitted, which types are allowed, what the governing constraints are, and have that ADU income automatically folded into the BRRRR cash flow model — with full data provenance so investors know what to verify.
**Depends on**: Phase 2B
**Requirements**: DADU-01, DADU-02, DADU-03, DADU-04, DADU-05, DADU-06, ANLYT-06
**Success Criteria** (what must be TRUE):
  1. For a property in any of the four launch markets (King County WA, Snohomish County WA, Pierce County WA, Multnomah County OR), user can see whether an ADU or DADU is permitted under the current zoning designation
  2. User can see the specific constraints that produced the feasibility result: maximum ADU size, required setbacks, lot coverage limit, owner-occupancy requirement, and permitted ADU types (attached, detached, garage conversion, JADU)
  3. Every feasibility result displays the rule source URL, the date the rule was last verified, and a "report inaccuracy" link — no binary verdict without constraint-level explanation
  4. When DADU is assessed as feasible, projected ADU rental income appears as a line item in the BRRRR cash flow calculation
  5. DADU-specific analytics events fire to PostHog (dadu_feasibility_checked, dadu_income_added_to_brrrr, dadu_report_viewed)
**Plans**: TBD

### Phase 5: King County Paid Data Pipeline
**Goal**: A paid-tier user can enter any King County WA address and have the platform automatically pull public records, GIS data, and a rent estimate — pre-populating the BRRRR and DADU analysis inputs and proving the market adapter pattern works before a second market is built. King County is the pilot market because the founder's validation investor network is Washington-based.
**Depends on**: Phase 3, Phase 4
**Requirements**: PROP-01, PROP-05, DATA-04, RENT-01, RENT-02, RENT-03, RENT-04
**Success Criteria** (what must be TRUE):
  1. Paid-tier user can enter a King County WA address and see property details (beds, baths, sqft, lot size, year built, zoning classification) auto-populated from the county assessor and GIS data pull — without typing them manually
  2. User can see automated market rent estimates for the primary unit and for a potential ADU unit, with the data source and estimated-as-of date shown alongside each figure
  3. User can override any auto-populated field (purchase price, rent estimate, rehab cost) with a manual value at any time
  4. A data freshness indicator is shown for all externally-sourced fields, and if any data source is unavailable, the user is prompted to enter values manually rather than seeing an error
  5. Every automated lookup is rejected at the server if the user is on the free tier, and a contextual upgrade prompt is shown
  6. Field-level caching from Phase 3 is active — repeat lookups for the same address served from cache with zero repeat API calls
**Plans**: TBD

### Phase 6: Remaining Markets, Reports & UX
**Goal**: The three remaining launch markets (Snohomish County WA, Pierce County WA, and Multnomah County OR) are brought live on the same adapter pattern established by King County in Phase 5, the end-to-end workflow produces a shareable single-page deal summary that can be exported as a PDF, and the web app is fully usable on a phone at a property walkthrough — completing the MVP.
**Depends on**: Phase 5
**Requirements**: RPRT-01, RPRT-02, RPRT-03, UX-01, UX-02, UX-03
**Success Criteria** (what must be TRUE):
  1. Paid-tier user can enter an address in Snohomish County WA, Pierce County WA, or Multnomah County OR and receive the same automated data pull and DADU feasibility analysis already live for King County WA
  2. User can view a single-page deal summary showing property details, BRRRR output, DADU feasibility result, and rent estimates in one view
  3. User can generate a shareable read-only link to their deal analysis that anyone can view without an account
  4. User can export the deal summary as a PDF suitable for a lender package
  5. The web app is usable on a phone at a property walkthrough — no horizontal scrolling, all inputs are tap-friendly, all pages load in under 3 seconds on a standard mobile connection
**Plans**: TBD
**UI hint**: yes

## Progress

**Execution Order:**
Phases execute in order: 1 -> 2A -> 2B -> 2C -> 3 -> 4 -> 5 -> 6
(Phase 4 depends on 2B, not 2C/3 — can potentially parallelize with 2C/3 if resources allow)

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 5/5 | Complete |  |
| 2A. Infrastructure Services | 0/6 | Planned | - |
| 2B. BRRRR Calculator & Deal Score | 0/TBD | Not started | - |
| 2C. Portfolio Management | 0/TBD | Not started | - |
| 3. Investor Profile, Onboarding & Caching | 0/TBD | Not started | - |
| 4. DADU Feasibility Engine | 0/TBD | Not started | - |
| 5. King County Paid Data Pipeline | 0/TBD | Not started | - |
| 6. Remaining Markets, Reports & UX | 0/TBD | Not started | - |
