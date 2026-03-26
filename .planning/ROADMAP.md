# Roadmap: Real Estate Investment Analysis Platform

## Overview

Six phases that build the platform in strict dependency order: infrastructure first (auth, billing metering, API layer) so every paid feature ships already gated and tracked; then the free-tier BRRRR calculator so validation investors can use the product before any live data integration exists; then investor profiles and onboarding; then the DADU feasibility engine built against the zoning rules database before any GIS pipeline feeds it; then the King County WA (Seattle metro) paid data pipeline as the first proof of the adapter pattern — chosen as the pilot market because the founder's validation investor network is Washington-based; then the remaining three markets (Snohomish County WA, Pierce County WA, and Multnomah County OR) plus reports and UX polish to complete the full any-address-in-60-seconds experience. Each phase delivers a working, testable artifact that can go in front of peer investors.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [ ] **Phase 1: Foundation** - Auth, database schema, billing/metering infrastructure, and versioned API layer
- [ ] **Phase 2: Free Tier Calculator** - BRRRR analyzer, supporting calculators, manual property entry, saved analyses
- [ ] **Phase 3: Investor Profile & Onboarding** - User configuration defaults, target markets, onboarding flow
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
- [ ] 01-05-PLAN.md — Account settings, home page, end-to-end verification checkpoint

**UI hint**: yes

### Phase 2: Free Tier Calculator
**Goal**: A free-tier user can run a complete BRRRR analysis and all supporting financial calculations using manually entered property data, save analyses, and return to them — giving validation investors something real to use before any paid data integration exists.
**Depends on**: Phase 1
**Requirements**: CALC-01, CALC-02, CALC-03, CALC-04, CALC-05, CALC-06, PROP-02, PROP-03, PROP-04, PROP-06
**Success Criteria** (what must be TRUE):
  1. Free-tier user can enter property details manually (address, beds, baths, sqft, lot size, purchase price, zoning) and run a BRRRR analysis without any paywall
  2. User can see monthly cash flow, annual cash-on-cash return, cap rate, DSCR, and GRM calculated from their inputs in real time
  3. User can override any individual input field with a custom value at any time without losing other calculated results
  4. User can save an analysis and see it in a deal history list sorted by most recently viewed, and return to it in its saved state
**Plans**: TBD
**UI hint**: yes

### Phase 3: Investor Profile & Onboarding
**Goal**: A new user is guided through their first analysis and can configure personal defaults that pre-populate future analyses — making every subsequent session faster and more relevant to their investment strategy.
**Depends on**: Phase 2
**Requirements**: PROF-01, PROF-02, PROF-03, PROF-04, ONBD-01, ONBD-02, ONBD-03
**Success Criteria** (what must be TRUE):
  1. First-time user is guided step by step through running their first property analysis, with both free and paid tier value demonstrated before the flow completes
  2. User can set target markets, investment strategy, minimum cash flow threshold, and financial assumption defaults (down payment %, interest rate, rehab cost per sqft) from account settings
  3. Financial assumption defaults pre-populate the matching input fields when a user starts a new analysis
  4. User can skip onboarding at any point and re-access it from account settings
**Plans**: TBD
**UI hint**: yes

### Phase 4: DADU Feasibility Engine
**Goal**: For any property with a known zoning designation in all four launch markets, a paid-tier user can see whether a DADU/ADU is permitted, which types are allowed, what the governing constraints are, and have that ADU income automatically folded into the BRRRR cash flow model — with full data provenance so investors know what to verify.
**Depends on**: Phase 1
**Requirements**: DADU-01, DADU-02, DADU-03, DADU-04, DADU-05, DADU-06
**Success Criteria** (what must be TRUE):
  1. For a property in any of the four launch markets (King County WA, Snohomish County WA, Pierce County WA, Multnomah County OR), user can see whether an ADU or DADU is permitted under the current zoning designation
  2. User can see the specific constraints that produced the feasibility result: maximum ADU size, required setbacks, lot coverage limit, owner-occupancy requirement, and permitted ADU types (attached, detached, garage conversion, JADU)
  3. Every feasibility result displays the rule source URL, the date the rule was last verified, and a "report inaccuracy" link — no binary verdict without constraint-level explanation
  4. When DADU is assessed as feasible, projected ADU rental income appears as a line item in the BRRRR cash flow calculation
**Plans**: TBD

### Phase 5: King County Paid Data Pipeline
**Goal**: A paid-tier user can enter any King County WA address and have the platform automatically pull public records, GIS data, and a rent estimate — pre-populating the BRRRR and DADU analysis inputs and proving the market adapter pattern works before a second market is built. King County is the pilot market because the founder's validation investor network is Washington-based.
**Depends on**: Phase 4
**Requirements**: PROP-01, PROP-05, RENT-01, RENT-02, RENT-03, RENT-04
**Success Criteria** (what must be TRUE):
  1. Paid-tier user can enter a King County WA address and see property details (beds, baths, sqft, lot size, year built, zoning classification) auto-populated from the county assessor and GIS data pull — without typing them manually
  2. User can see automated market rent estimates for the primary unit and for a potential ADU unit, with the data source and estimated-as-of date shown alongside each figure
  3. User can override any auto-populated field (purchase price, rent estimate, rehab cost) with a manual value at any time
  4. A data freshness indicator is shown for all externally-sourced fields, and if any data source is unavailable, the user is prompted to enter values manually rather than seeing an error
  5. Every automated lookup is rejected at the server if the user is on the free tier, and a contextual upgrade prompt is shown
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
Phases execute in numeric order: 1 → 2 → 3 → 4 → 5 → 6

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 1/5 | In Progress|  |
| 2. Free Tier Calculator | 0/TBD | Not started | - |
| 3. Investor Profile & Onboarding | 0/TBD | Not started | - |
| 4. DADU Feasibility Engine | 0/TBD | Not started | - |
| 5. King County Paid Data Pipeline | 0/TBD | Not started | - |
| 6. Remaining Markets, Reports & UX | 0/TBD | Not started | - |
