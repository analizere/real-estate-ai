# Requirements: Real Estate Investment Analysis Platform

**Defined:** 2026-03-25
**Core Value:** Any address → complete investment analysis in under 60 seconds, without manual research.

## v1 Requirements

### Authentication

- [x] **AUTH-01**: User can create an account with email and password
- [x] **AUTH-02**: User can sign in with Google OAuth
- [x] **AUTH-03**: User receives a verification email after signup and must confirm before accessing paid features
- [x] **AUTH-04**: User can reset password via an emailed link
- [x] **AUTH-05**: User session persists across browser refresh without requiring re-login

### Onboarding

- [ ] **ONBD-01**: First-time user is guided through an onboarding flow that walks them through running their first property analysis
- [ ] **ONBD-02**: Onboarding demonstrates both free (manual) and paid (automated) tier value so the user understands what they can unlock
- [ ] **ONBD-03**: Onboarding can be skipped and re-accessed from account settings

### Investor Profile

- [ ] **PROF-01**: User can set their target markets (cities/regions they invest in)
- [ ] **PROF-02**: User can set their preferred investment strategy (BRRRR, buy-and-hold, wholesale)
- [ ] **PROF-03**: User can set minimum acceptable cash flow threshold for a deal
- [ ] **PROF-04**: User can set default financial assumptions (down payment %, interest rate, rehab cost per sqft) to pre-populate analysis inputs

### Property Lookup

- [ ] **PROP-01**: User can enter any address and the app automatically pulls public records, GIS data, lot size, structure attributes, and zoning classification (paid tier)
- [ ] **PROP-02**: User can manually enter property details (address, beds, baths, sqft, lot size, purchase price, zoning) without triggering a paid data pull (free tier)
- [ ] **PROP-03**: User can view basic property details — address, beds, baths, sqft, lot size, year built, zoning — populated from the automated pull or manual input
- [ ] **PROP-04**: User can save an analysis and return to it later from their deal history
- [ ] **PROP-05**: User can see when the property's public records and zoning data was last updated (data freshness indicator)
- [ ] **PROP-06**: User can view all saved analyses in a deal history list, sorted by most recently viewed

### Financial Calculators

- [ ] **CALC-01**: User can run a BRRRR analysis with inputs for purchase price, rehab cost, ARV, refinance LTV %, refinance interest rate, and holding period — seeing equity recaptured and post-refi cash flow
- [ ] **CALC-02**: User can see monthly cash flow, annual cash-on-cash return, and cap rate calculated from their inputs
- [ ] **CALC-03**: User can see DSCR (debt service coverage ratio) calculated from NOI and annual debt service
- [ ] **CALC-04**: User can see GRM (gross rent multiplier) calculated from purchase price and annual gross rent
- [ ] **CALC-05**: User can override any auto-populated input (purchase price, rent, rehab cost) with a manual value at any time
- [ ] **CALC-06**: All financial calculators are available to free-tier users with manual inputs

### DADU/ADU Feasibility

- [ ] **DADU-01**: For a given property, user can see whether an ADU or DADU is permitted under current zoning (paid tier)
- [ ] **DADU-02**: User can see the applicable zoning rules: maximum ADU size, required setbacks (rear, side, street), lot coverage limit, and whether owner-occupancy is required
- [ ] **DADU-03**: User can see what type(s) of ADU are permitted on the lot (attached, detached, garage conversion, junior ADU)
- [ ] **DADU-04**: DADU feasibility is assessed for four launch markets: King County WA (Seattle, Bellevue, Redmond, Renton), Snohomish County WA (Everett metro), Pierce County WA (Tacoma metro), and Multnomah County OR (Portland metro) — indexed by zone designation within each county jurisdiction
- [ ] **DADU-05**: User can see a data freshness indicator and "verify with municipality" disclaimer alongside DADU feasibility output
- [ ] **DADU-06**: Projected ADU rental income is included in the BRRRR cash flow calculation when DADU is assessed as feasible

### Rent Estimation

- [ ] **RENT-01**: User can see an automated market rent estimate for the primary unit at the subject property via Rentcast API (paid tier)
- [ ] **RENT-02**: User can see an automated market rent estimate for an ADU/DADU unit at the subject property via Rentcast API (paid tier)
- [ ] **RENT-03**: User can override automated rent estimates with manual values at any time
- [ ] **RENT-04**: Rent estimates display the data source and estimated-as-of date

### Deal Report

- [ ] **RPRT-01**: User can view a single-page deal summary showing property details, BRRRR analysis output, DADU feasibility result, and rent estimates together
- [ ] **RPRT-02**: User can generate a shareable read-only link to their deal analysis that can be viewed without an account
- [ ] **RPRT-03**: User can export the deal summary as a PDF for use in lender packages and record-keeping

### Billing & Freemium

- [x] **BILL-01**: Free-tier users can run unlimited BRRRR and cash flow analyses using manual inputs with no paywall
- [x] **BILL-02**: Automated public records pull, DADU feasibility analysis, and rent estimation are gated behind the paid tier
- [x] **BILL-03**: User can subscribe to the paid tier via Stripe (monthly and annual options)
- [x] **BILL-04**: User can view their current subscription status and cancel from account settings
- [x] **BILL-05**: Each automated data lookup (public records pull, rent estimate) is metered and logged per user account
- [x] **BILL-06**: Free-tier user is shown a contextual upgrade prompt when they attempt to use a paid feature

### Platform & UX

- [ ] **UX-01**: The web app is mobile-responsive and usable on a phone at a property walkthrough (no horizontal scrolling, inputs are tap-friendly)
- [ ] **UX-02**: All pages load in under 3 seconds on a standard mobile connection
- [ ] **UX-03**: A data freshness indicator is shown for all externally-sourced data (public records, zoning, rent estimates) throughout the app

### API Layer

- [x] **API-01**: All property analysis, auth, and data lookup functionality is exposed via a versioned REST API (`/api/v1/`) from day one
- [x] **API-02**: All external API calls (public records, GIS, Rentcast) are made server-side only — never from client components
- [x] **API-03**: The API design supports future consumption by a mobile app and browser plugin without modification to existing endpoints

### Component Library

- [x] **COMP-01**: Before building any feature UI, a reusable component library exists in `/components/ui/` as the foundation — every feature in every phase consumes exclusively from this library; no one-off hardcoded styles anywhere in the codebase
- [x] **COMP-02**: Design tokens (colors, typography scale, spacing, border radius, shadows) are defined as CSS variables and Tailwind config so changes propagate everywhere automatically; dark mode is built in from day one using CSS variable switching
- [x] **COMP-03**: Core components are built before any feature uses them: Button (primary/secondary/ghost/destructive variants), Input, Select, Textarea, Checkbox, Radio, Card, Badge, Tooltip, Modal/Dialog, Toast/notification system, Loading spinner, Skeleton loader, Empty state, Error state
- [x] **COMP-04**: Form, layout, data display, and navigation component families are built before the features that need them: FormField wrapper (label + error + helper text), layout primitives (Page, Section, Container, Grid, Sidebar), data display (Stat card, Data table, Property card, Analysis summary card), navigation (top nav desktop, bottom tab bar mobile, user menu dropdown, mobile hamburger menu)
- [x] **COMP-05**: All components are mobile-first with Tailwind breakpoints (sm/md/lg); each breakpoint feels native — desktop gets multi-column layouts, expanded navigation, richer data displays, not just a scaled mobile view; tested at 375px, 390px, 768px, and 1280px; all interactive elements have minimum 44×44px touch targets; no horizontal scrolling at any screen size
- [x] **COMP-06**: Business logic never lives inside UI components — all logic lives in hooks (`hooks/`), services (`lib/services/`), and API route handlers (`app/api/`); UI components receive data and callbacks via props only

---

## v2 Requirements

### Additional Markets

- **MKT-01**: Extend automated public records pull and DADU feasibility to Clark County WA (Vancouver metro — adjacent to Portland, same investor network)
- **MKT-02**: Extend automated public records pull and DADU feasibility to Kitsap County WA (Bremerton area — active investor community)
- **MKT-03**: Extend automated public records pull and DADU feasibility to Salem / Marion County OR and Bend / Deschutes County OR

### Deal Analysis Enhancements

- **CALC-07**: Buy & Hold analyzer (separate from BRRRR — long-term rental hold without refi)
- **CALC-08**: ARV comparables helper — link out to comps or surface nearby sold data
- **CALC-09**: Rehab cost estimator with per-sqft rule-of-thumb guidance by condition tier

### Portfolio

- **PORT-01**: User can view a portfolio dashboard summarizing all saved analyses (total deals, average CoC, total projected monthly cash flow)
- **PORT-02**: User can tag and filter saved deals by market, strategy, or status

### Browser Plugin

- **PLUG-01**: Browser extension overlays property analysis on Zillow and Redfin listing pages, consuming the v1 REST API

### Outreach Infrastructure (Architecture Note)

- **OTCH-01**: Architecture supports future integration with third-party direct mail and outreach partners (Click2Mail, Launch Control, BatchLeads mailers) — implement when off-market prospecting module ships
- **OTCH-02**: Platform can facilitate outreach campaign initiation and take a margin on partner fulfillment

---

## Out of Scope

| Feature | Reason |
|---------|--------|
| MLS integration | Expensive ($500–$2,000+/yr/market), access-gated, months to approve — not needed for public records use case |
| Off-market prospecting engine | Post-MVP; requires data scale and a separate search/filter UX |
| Skip tracing | Legal surface area (TCPA/CAN-SPAM), requires separate data license, wrong audience for MVP |
| Direct mail / outreach tools | Post-MVP; depends on off-market prospecting first |
| Deal pipeline / CRM | Post-PMF; competes with specialized tools (REISift, Podio); deferred until core analysis is validated |
| AI deal recommendations | Premature without user deal history data; liability risk |
| Team collaboration / multi-user | Post-PMF; solo investors are the MVP target; shareable links cover 90% of the use case |
| Native mobile app (iOS/Android) | Post-MVP; API-first web app ships first; mobile-responsive web covers mobile walkthroughs |
| Real-time property value tracking | Unbounded API costs; on-demand pull only at MVP |
| Built-in comparable sales (comps) | Reliable comps require MLS or expensive data licenses — bad comps worse than no comps |
| Contractor cost database | Stale immediately; rehab cost stays a manual input with rule-of-thumb helpers |
| Lender marketplace | Long-term vision only; requires lender partnerships |
| STR / Airbnb analytics | Mashvisor's lane; not the target use case |

---

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| AUTH-01 | Phase 1 | Complete |
| AUTH-02 | Phase 1 | Complete |
| AUTH-03 | Phase 1 | Complete |
| AUTH-04 | Phase 1 | Complete |
| AUTH-05 | Phase 1 | Complete |
| ONBD-01 | Phase 3 | Pending |
| ONBD-02 | Phase 3 | Pending |
| ONBD-03 | Phase 3 | Pending |
| PROF-01 | Phase 3 | Pending |
| PROF-02 | Phase 3 | Pending |
| PROF-03 | Phase 3 | Pending |
| PROF-04 | Phase 3 | Pending |
| PROP-01 | Phase 5 | Pending |
| PROP-02 | Phase 2 | Pending |
| PROP-03 | Phase 2 | Pending |
| PROP-04 | Phase 2 | Pending |
| PROP-05 | Phase 5 | Pending |
| PROP-06 | Phase 2 | Pending |
| CALC-01 | Phase 2 | Pending |
| CALC-02 | Phase 2 | Pending |
| CALC-03 | Phase 2 | Pending |
| CALC-04 | Phase 2 | Pending |
| CALC-05 | Phase 2 | Pending |
| CALC-06 | Phase 2 | Pending |
| DADU-01 | Phase 4 | Pending |
| DADU-02 | Phase 4 | Pending |
| DADU-03 | Phase 4 | Pending |
| DADU-04 | Phase 4 | Pending |
| DADU-05 | Phase 4 | Pending |
| DADU-06 | Phase 4 | Pending |
| RENT-01 | Phase 5 | Pending |
| RENT-02 | Phase 5 | Pending |
| RENT-03 | Phase 5 | Pending |
| RENT-04 | Phase 5 | Pending |
| RPRT-01 | Phase 6 | Pending |
| RPRT-02 | Phase 6 | Pending |
| RPRT-03 | Phase 6 | Pending |
| BILL-01 | Phase 1 | Complete |
| BILL-02 | Phase 1 | Complete |
| BILL-03 | Phase 1 | Complete |
| BILL-04 | Phase 1 | Complete |
| BILL-05 | Phase 1 | Complete |
| BILL-06 | Phase 1 | Complete |
| UX-01 | Phase 6 | Pending |
| UX-02 | Phase 6 | Pending |
| UX-03 | Phase 6 | Pending |
| API-01 | Phase 1 | Complete |
| API-02 | Phase 1 | Complete |
| API-03 | Phase 1 | Complete |
| COMP-01 | Phase 1 | Complete |
| COMP-02 | Phase 1 | Complete |
| COMP-03 | Phase 1 | Complete |
| COMP-04 | Phase 1 | Complete |
| COMP-05 | Phase 1 | Complete |
| COMP-06 | Phase 1 | Complete |

**Coverage:**
- v1 requirements: 55 total
- Mapped to phases: 55
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-25 after roadmap revision — Phase 5 pilot market changed from Multnomah County OR to King County WA; Phase 6 remaining markets updated to Snohomish County WA, Pierce County WA, and Multnomah County OR*
