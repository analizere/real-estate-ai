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
- [ ] **CALC-06**: Free tier has BRRRR calculator only with manual inputs; Pro tier unlocks full calculator suite (BRRRR, cash flow, cap rate, DSCR, GRM)

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

### Billing & Pricing

- [x] **BILL-01**: Free tier: manual BRRRR calculator only, no saving, no analysis history, one analysis at a time — purpose is acquisition funnel, not a usable free product
- [x] **BILL-02**: Automated public records pull, DADU feasibility analysis, and rent estimation are gated behind Pro tier
- [x] **BILL-03**: User can subscribe to Pro tier ($99/month or $79/month billed annually) via Stripe — annual pricing presented as default option on pricing page
- [x] **BILL-04**: User can view their current subscription status and cancel from account settings
- [x] **BILL-05**: Each automated data lookup (public records pull, rent estimate) is metered and logged per user account — Pro tier includes 50 lookups/month, $1.50 per lookup over 50
- [x] **BILL-06**: Free-tier user is shown clear contextual upgrade prompts throughout the app when they attempt to use a Pro feature
- [ ] **BILL-07**: Pro tier includes: automated property data pull (50/month), DADU/ADU feasibility engine, rent estimation (primary + ADU), unlimited saved analyses, unlimited lists, PDF export, shareable deal links, full calculator suite (BRRRR, cash flow, cap rate, DSCR, GRM)
- [ ] **BILL-08**: Skip trace credits included in Pro tier — pricing TBD pending API cost evaluation; overage pricing also TBD
- [ ] **BILL-09**: Team tier deferred until Phase 6 collaboration features are complete — no intermediate Analyst tier; two tiers only at launch
- [ ] **BILL-10**: Pricing page presents annual billing ($79/month, 20% discount) as the default selected option, with monthly ($99/month) as the alternative

### Analytics

- [ ] **ANLYT-01**: PostHog JavaScript SDK integrated into Next.js app router with `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` environment variables, PostHog provider wrapping entire app layout
- [ ] **ANLYT-02**: Session recording enabled — all sessions for first 90 days of beta, then only free tier users and first 3 sessions of new paid users
- [ ] **ANLYT-03**: Privacy-safe tracking — no PII in event properties, identify users by user ID not email
- [ ] **ANLYT-04**: User lifecycle events tracked: `signed_up` (method), `signed_in` (method), `signed_out`, `email_verified`, `subscription_started` (plan, price), `subscription_cancelled`, `upgrade_clicked` (source)
- [ ] **ANLYT-05**: Analysis flow events tracked: `analysis_started` (strategy), `analysis_address_entered` (market), `analysis_data_pulled` (source, fields_populated), `analysis_completed` (strategy, market, dadu_feasible, time_to_complete_seconds), `analysis_saved`, `analysis_shared` (method), `analysis_reopened`
- [ ] **ANLYT-06**: DADU-specific events tracked: `dadu_feasibility_checked` (county, zone, result), `dadu_income_added_to_brrrr`, `dadu_report_viewed`
- [ ] **ANLYT-07**: Engagement events tracked: `calculator_input_changed` (calculator, field), `rent_estimate_requested` (unit, market), `upgrade_prompt_viewed` (feature), `onboarding_step_completed` (step), `onboarding_skipped`, `list_created`, `list_exported`, `list_deleted`, `tag_applied` (tag_name, property_id), `skip_trace_requested` (property_id)
- [ ] **ANLYT-08**: Key funnels configured: signup → first analysis → upgrade; address entered → data pulled → analysis completed; upgrade clicked → subscription started; shared link viewed → recipient signup; free user → paywall hit → upgrade
- [ ] **ANLYT-09**: Additional events tracked: `address_outside_coverage` (market — logs expansion demand), `data_inaccuracy_reported` (county, field, property_id — flag for same-day review), `data_override_applied` (county, field — data quality monitor), `stage1_data_incomplete` (county, missing_fields — coverage monitor), `deal_score_computed` (score, band, data_source — manual vs auto)
- [ ] **ANLYT-10**: Data pull events (`stage1_data_pull_started`, `stage1_data_pull_completed`, `stage2_data_pull_started`, `stage2_data_pull_completed`) fire server-side to prevent ad blocker suppression of cost-critical events; all user interaction events fire client-side
- [ ] **ANLYT-11**: PostHog person properties updated server-side on plan changes to ensure accuracy; use PostHog feature flags for A/B testing paywall placement and upgrade prompt copy

### Admin Dashboard (internal, founder-facing only)

- [ ] **ADMIN-01**: Daily metrics dashboard: new signups (total + by acquisition source), free-to-paid conversions (count + rate), analyses completed (free vs. paid users tracked separately), API cost incurred by provider (Rentcast | county_api | skip_trace), data inaccuracies reported (flagged for same-day review), addresses outside coverage area (ranked by market for expansion demand), cache hit rate (% lookups served from internal database vs. external API — target: increase month over month)
- [ ] **ADMIN-02**: Weekly metrics dashboard: top 20 users by estimated monthly API cost (flag any approaching $25/month), top 20 users by action volume (separate from cost — different populations), feature adoption rates (% active users who used DADU, sensitivity analysis, comparison view), data override rates by county and field (rising override rate = data source problem), shared link conversion rate (viral loop health), funnel completion rates for all configured funnels, `stage1_data_incomplete` rate by county (rising rate = county API degradation)
- [ ] **ADMIN-03**: Monthly metrics dashboard: MRR, ARR, MRR growth rate; churn count and rate by cohort; LTV by acquisition source; API cost per paying customer (target: under $20/month at scale); net revenue retention (expansion revenue from overages vs. churn); DADU accuracy rate (inaccuracies reported ÷ total DADU analyses — rising rate = zoning database needs review); county coverage gap requests ranked by volume (expansion roadmap input); cache hit rate trend (month over month); top uncovered markets by `address_outside_coverage` volume (informs next market to add)
- [ ] **ADMIN-04**: Admin dashboard is internal only — no user-facing access; derives from usage_log table + PostHog data; email alert when any single user's estimated monthly API cost exceeds $25

### Cohort Analysis

- [ ] **COHRT-01**: PostHog cohorts configured from day one: week 1 retention (returned within 7 days of signup), month 1 retention (returned at least once in first month)
- [ ] **COHRT-02**: Feature adoption cohorts: users who ran DADU in week 1 vs. week 4 — which group retains better?
- [ ] **COHRT-03**: Acquisition source cohorts: founder network vs. organic vs. paid — which converts to paid and retains best?
- [ ] **COHRT-04**: Market cohorts: King County users vs. other markets — engagement and conversion differences
- [ ] **COHRT-05**: Deal score cohorts: users whose saved deals average above 66 vs. below 40 — does deal quality affect retention?

### Churn Prediction and Re-engagement

- [ ] **CHURN-01**: Monitor and trigger re-engagement: user not logged in for 14 days → trigger re-engagement email
- [ ] **CHURN-02**: Monitor: user logged in but ran zero analyses in last 7 days → possible friction or disengagement signal
- [ ] **CHURN-03**: Monitor: user hit paywall 3+ times but did not upgrade → price sensitivity or feature mismatch — candidate for founder outreach during beta
- [ ] **CHURN-04**: Monitor: user manually overrode 5+ auto-populated fields in a single session → data quality frustration — investigate their county and field
- [ ] **CHURN-05**: Monitor: user reported 2+ data inaccuracies → trust breakdown — immediate founder outreach required
- [ ] **CHURN-06**: Monitor: user's saved deals consistently score below 40 → not finding good deals — may churn due to market conditions, not product quality; consider proactive outreach with market tips
- [ ] **CHURN-07**: Monitor: user ran analyses in week 1 but none since → did not activate properly — candidate for onboarding follow-up

### Session Recording

- [ ] **SESS-01**: Record all sessions for first 90 days of beta — no exceptions
- [ ] **SESS-02**: After 90 days: record all free tier sessions, first 5 sessions of every new paid user
- [ ] **SESS-03**: Never record payment screens (Stripe Checkout is external — automatic)
- [ ] **SESS-04**: Flag sessions containing rage clicks for priority UX review
- [ ] **SESS-05**: Flag sessions where user hit paywall but did not upgrade — review for UX friction
- [ ] **SESS-06**: PostHog heatmaps configured on: Property Intelligence page, Portfolio page, pricing/upgrade modal
- [ ] **SESS-07**: Founder reviews at least 10 recorded sessions per week during beta — non-negotiable founder activity

### Property Data Caching

- [ ] **CACHE-01**: Field-level caching with TTL by type — static fields (lot size, parcel, zoning, year built, beds/baths/sqft, APN, owner name, building footprint): 180 days; semi-static fields (tax assessed value, sale history, ownership history, permit history): 30 days; dynamic fields (rent estimates, comps, days on market): 24–48 hours; skip trace/owner contact: never cached
- [ ] **CACHE-02**: Each cached field stores: value, `last_fetched_at`, `cache_ttl`, `stale_reason` (TTL_EXPIRED | ZONING_CHANGE | SALE_RECORDED | USER_REQUESTED | ADMIN_FLAGGED), `stale_at`
- [ ] **CACHE-03**: Property record has `has_stale_fields` boolean — page load checks this boolean only; field-level staleness checks only run when `has_stale_fields` is true
- [ ] **CACHE-04**: Lazy invalidation — external triggers mark only impacted fields as stale; stale fields refresh only when a user accesses a view requiring those specific fields; list views never trigger refreshes for fields only needed on detail views
- [ ] **CACHE-05**: Cascade invalidation via dependency map — when source fields refresh, dependent computed fields are also invalidated (e.g., `zoning_designation` refresh → invalidate `dadu_feasibility_score`, `dadu_feasibility_details`)
- [ ] **CACHE-06**: Request deduplication — if a refresh is in flight for a property field, queue subsequent requests and serve all from the same result; never fire duplicate API calls for the same field on the same property
- [ ] **CACHE-07**: Stale-while-revalidate UI — never block UI rendering while stale data refreshes; show cached data immediately with subtle field-level "updating..." indicator; swap in fresh data when refresh completes without full page reload
- [ ] **CACHE-08**: Database indexes: `zip_code` on property table, `user_id` on all user-owned records, `has_stale_fields` on property table, compound `(property_id, field_group)` for field-level staleness queries
- [ ] **CACHE-09**: Background jobs via Inngest or Trigger.dev for zone invalidation sweeps, export generation, and skip trace calls — no heavy operations synchronous in API route handlers

### Lists and Tags

- [ ] **LIST-01**: Users can create, rename, and soft-delete property lists — Pro tier only, unlimited lists
- [ ] **LIST-02**: Users can add/remove properties from lists, view individual lists, and export lists as CSV or PDF
- [ ] **LIST-03**: Large list exports (50+ properties) queued as background jobs with toast notification when ready — never synchronous
- [ ] **LIST-04**: List architecture supports adding campaign metadata later (campaign_type, send_date, status) without schema redesign
- [ ] **LIST-05**: All list and list membership deletes are soft deletes (`deleted_at` timestamp) — users can recover accidentally deleted lists
- [ ] **TAG-01**: Users have up to 5 custom tags per account, each with name and color (selected from 8 preset colors)
- [ ] **TAG-02**: Default suggested tags: DADU Potential, BRRRR, Flip, Hold, Watch — user can rename
- [ ] **TAG-03**: Tags applied at property level (multiple tags per property) via single-tap interaction on property card or detail page
- [ ] **TAG-04**: Tagged properties automatically appear in system-generated lists per tag (Pro tier only — tags require saved analyses)
- [ ] **TAG-05**: Tags are color-coded and visually prominent on property cards and list views
- [ ] **TAG-06**: Optimistic UI for all tag and list operations — UI updates instantly, database write happens in background, rollback on failure with error toast

### Skip Trace

- [ ] **SKIP-01**: Users can look up owner contact information (phone, email, mailing address) for any property via skip trace API (e.g., BatchSkipTracing, Skip Genie)
- [ ] **SKIP-02**: Skip trace results are never cached — always fetch fresh on each request
- [ ] **SKIP-03**: Skip trace is Pro tier only; credit/limit counter shown prominently before each lookup; credit allocation and overage pricing TBD pending API cost evaluation
- [ ] **SKIP-04**: Skip trace calls are async and non-blocking — show spinner, display results when ready (typically 2–5 seconds)
- [ ] **SKIP-05**: Architecture supports per-lookup charging or monthly credit bundles later without redesign
- [ ] **SKIP-06**: Every skip trace request logged in `usage_log` table: user_id, property_id, timestamp, result_found (boolean), cost

### Deal Score

- [ ] **DEAL-01**: Every analyzed property displays a computed Deal Score (0–100) — the single most important number in the product, the north star metric of the user experience
- [ ] **DEAL-02**: Deal Score computation inputs: cash-on-cash return (30% weight), monthly cash flow absolute (20% weight), cap rate (15% weight), DADU feasibility yes/no/conditional (20% weight), DSCR (10% weight), equity recaptured as % of total invested (5% weight)
- [ ] **DEAL-03**: Deal Score display bands: 0–40 Poor (red badge), 41–65 Fair (amber badge), 66–80 Good (blue badge), 81–100 Strong (green badge)
- [ ] **DEAL-04**: Deal Score appears on: property cards in portfolio view (most visually dominant element), property detail page header (large, next to address), deal reports and shared links, list and comparison views as a sortable column
- [ ] **DEAL-05**: Visual hierarchy: Deal Score is the single most prominent element on every property card and property detail page — size, color, and placement more prominent than any other single metric
- [ ] **DEAL-06**: Deal Score is a derived field stored in the database with component breakdown so it can be queried and sorted without recomputation; recomputes when any input changes via cascade invalidation (e.g., rent estimate refresh triggers Deal Score recompute)
- [ ] **DEAL-07**: Free tier: Deal Score computed from manually entered data only (no automated enrichment); Pro tier: Deal Score from auto-populated data with full component breakdown visible

### Staged Data Pull Architecture

- [ ] **DATA-01**: Property data enrichment follows a two-stage architecture — Stage 1 (free data) and Stage 2 (premium data) as distinct service methods
- [ ] **DATA-02**: Stage 1 — free data pull (available on free tier): county assessor APIs (lot size, zoning designation, beds/baths/sqft, year built, owner name, last sale date/price, tax assessed value), county GIS APIs (parcel boundaries, lot dimensions, frontage calculations, building footprint), OpenStreetMap (supplemental building data), Census TIGER files (parcel geometry)
- [ ] **DATA-03**: All Stage 1 data cached in ReVested's property database on first lookup; subsequent lookups for same address served from cache with zero repeat API calls
- [ ] **DATA-04**: Stage 2 — premium data enrichment (paid tier only, triggered on demand): Rentcast API (primary unit and ADU rent estimates), skip trace API (owner contact — never cached), ATTOM or similar (deeper comparable sales), ReVested DADU zoning rules database (internal — no external API cost)
- [ ] **DATA-05**: Cache TTLs per field-level caching architecture: Stage 1 static 180 days, Stage 1 semi-static 30 days, Stage 2 rent estimates 24–48 hours, Stage 2 skip trace never cache
- [ ] **DATA-06**: Track `cache_source` per field: county_api | gis_api | openstreetmap | rentcast | attom | internal
- [ ] **DATA-07**: County data quality tiers: King County WA (Excellent — full GIS + assessor API), Multnomah County OR (Good — open data portal, some API limitations), Pierce County WA (Moderate — assessor data available, GIS less structured), Snohomish County WA (Moderate — available but requires more parsing)
- [ ] **DATA-08**: Implement as `DataEnrichmentService` with `stage1Enrich(address)` and `stage2Enrich(propertyId, features[])` as distinct methods — free/paid boundary explicit in codebase
- [ ] **DATA-09**: Graceful degradation: show available data clearly, flag missing fields explicitly rather than failing silently
- [ ] **DATA-10**: Track cache hit rate as a key infrastructure metric — every lookup enriches internal cache; repeat lookups cost nothing over time

### Data Tier Architecture

- [ ] **TIER-01**: Property data organized into three access tiers controlled by a central gating service — never scatter plan checks in individual components
- [ ] **TIER-02**: Tier 1 (always free — Stage 1 public data): basic property attributes (beds, baths, sqft, lot size, year built, zoning name, owner name, last sale date/price, tax assessed value), parcel boundaries and basic map display, manual calculator inputs, Deal Score from manually entered data only
- [ ] **TIER-03**: Tier 2 (preview free — demonstrates value): rent estimate shown as clear readable number, DADU feasibility pass/fail/conditional badge with one-line reason, Deal Score from auto-populated data shown clearly
- [ ] **TIER-04**: Tier 2 critical UI pattern: show data clearly and completely — never blur, hide, or obscure. Gate the ability to use it (include in analysis, save, export), not the visibility. "See everything, do more with Pro"
- [ ] **TIER-05**: Tier 3 (Pro only $99/month): full rent comps with addresses/sqft/distance, full DADU feasibility checklist with all rules and sources, Deal Score breakdown with component scores, automated Stage 1 + Stage 2 data pull, ADU rent estimate, BRRRR with auto-populated data, skip trace (10/month), PDF export, shareable deal links, unlimited saves/lists, sensitivity analysis, ability to include Tier 2 preview data in analysis/saves/exports
- [ ] **TIER-06**: Central gating service: single config file or database table defines feature-to-tier assignments; all components call this service to check access; supports tier changes, A/B testing, and new tiers without rearchitecting
- [ ] **TIER-07**: Tier assignments are intentionally preliminary — gating architecture must support rapid iteration on what's free vs. paid without engineering effort; limits configurable per tier without code deployments

### Usage Metering and Action Counting

- [ ] **METER-01**: Every action with a cost implication is logged before it executes — not after. Tracks: user_id, timestamp, action_type, cost_estimate_cents, api_provider, property_id (nullable), metadata JSON, plan_at_time_of_action
- [ ] **METER-02**: Data pull actions metered: address_lookup_stage1, address_lookup_stage2, rent_estimate_requested (primary), rent_estimate_requested_adu, dadu_feasibility_checked (per property per session), comparable_sales_pulled
- [ ] **METER-03**: User content actions metered: analysis_saved, analysis_exported_pdf, analysis_shared_link_created, list_created, list_exported, property_added_to_list
- [ ] **METER-04**: Skip trace actions metered: skip_trace_requested (highest cost — always meter), skip_trace_result_found (boolean — track hit rate separately)
- [ ] **METER-05**: Report actions metered: deal_report_generated, deal_report_viewed_by_recipient (track virality)
- [ ] **METER-06**: Usage aggregation computed and stored daily: per-user daily/monthly action counts by type, per-user estimated daily/monthly API cost in cents, top 20% users by action volume, top 20% users by estimated API cost (different populations), flag users where estimated monthly API cost exceeds 30% of subscription revenue ($29.70 for Pro)
- [ ] **METER-07**: Admin dashboard (founder-facing): users sorted by monthly estimated API cost and action volume, per-user action breakdown, monthly API cost vs. subscription revenue with 30% threshold highlight, email alert when any user's estimated monthly cost exceeds $25
- [ ] **METER-08**: Soft limits: every metered action checks configurable limit before executing; limits defined in central config per plan tier (same config as gating service); at 80% show usage indicator in account settings; at 100% show clear message with upgrade/overage option — never silently fail; limits can be set to "unlimited"
- [ ] **METER-09**: Current soft limits (preliminary): Free tier — 0 automated lookups/month, 0 skip traces/month, 3 saved analyses total, 1 PDF export/month; Pro tier — 50 automated lookups/month, 10 skip traces/month, unlimited saves/exports; Overage — $1.50 per lookup over 50/month, skip trace overage TBD
- [ ] **METER-10**: Beta strategy (first 90 days): set all limits to "unlimited" for all users, log everything but enforce nothing; after 90 days analyze actual usage to set informed limits before public launch
- [ ] **METER-11**: Power user protection: Pro users with estimated monthly API cost exceeding $29.70 flagged in admin dashboard; founder reviews monthly to inform tier adjustment; high-cost users studied, not punished

### Property Quick Actions

- [ ] **PROP-07**: Property detail page has quick actions accessible without scrolling: tag property, add to list, get owner info (skip trace), save analysis, share analysis

### Platform & UX

- [ ] **UX-01**: The web app is mobile-responsive and usable on a phone at a property walkthrough (no horizontal scrolling, inputs are tap-friendly)
- [ ] **UX-02**: All pages load in under 3 seconds on a standard mobile connection
- [ ] **UX-03**: A data freshness indicator is shown for all externally-sourced data (public records, zoning, rent estimates) throughout the app
- [ ] **UX-04**: All user-initiated mutations (tag, list add/remove, save) use optimistic UI — instant visual update, background database write, rollback with error toast on failure

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
| ~~Skip tracing~~ | ~~Moved to v1 active requirements (SKIP-01 through SKIP-06)~~ |
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
| PROP-02 | Phase 2B | Pending |
| PROP-03 | Phase 2B | Pending |
| PROP-04 | Phase 2C | Pending |
| PROP-05 | Phase 5 | Pending |
| PROP-06 | Phase 2C | Pending |
| CALC-01 | Phase 2B | Pending |
| CALC-02 | Phase 2B | Pending |
| CALC-03 | Phase 2B | Pending |
| CALC-04 | Phase 2B | Pending |
| CALC-05 | Phase 2B | Pending |
| CALC-06 | Phase 2B | Pending |
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
| BILL-07 | TBD | Pending |
| BILL-08 | TBD | Pending |
| BILL-09 | TBD | Pending |
| BILL-10 | TBD | Pending |
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
| ANLYT-01 | Phase 2A | Pending |
| ANLYT-02 | Phase 2A | Pending |
| ANLYT-03 | Phase 2A | Pending |
| ANLYT-04 | Phase 2A | Pending |
| ANLYT-05 | Phase 2B | Pending |
| ANLYT-06 | Phase 4 | Pending |
| ANLYT-07 | Phase 2C | Pending |
| ANLYT-08 | Phase 2A | Pending |
| CACHE-01 | Phase 3 | Pending |
| CACHE-02 | Phase 3 | Pending |
| CACHE-03 | Phase 3 | Pending |
| CACHE-04 | Phase 3 | Pending |
| CACHE-05 | Phase 3 | Pending |
| CACHE-06 | Phase 3 | Pending |
| CACHE-07 | Phase 3 | Pending |
| CACHE-08 | Phase 3 | Pending |
| CACHE-09 | Phase 3 | Pending |
| LIST-01 | Phase 2C | Pending |
| LIST-02 | Phase 2C | Pending |
| LIST-03 | Phase 2C | Pending |
| LIST-04 | Phase 2C | Pending |
| LIST-05 | Phase 2C | Pending |
| TAG-01 | Phase 2C | Pending |
| TAG-02 | Phase 2C | Pending |
| TAG-03 | Phase 2C | Pending |
| TAG-04 | Phase 2C | Pending |
| TAG-05 | Phase 2C | Pending |
| TAG-06 | Phase 2C | Pending |
| SKIP-01 | TBD | Pending |
| SKIP-02 | TBD | Pending |
| SKIP-03 | TBD | Pending |
| SKIP-04 | TBD | Pending |
| SKIP-05 | TBD | Pending |
| SKIP-06 | TBD | Pending |
| PROP-07 | Phase 2C | Pending |
| UX-04 | TBD | Pending |
| DEAL-01 | Phase 2B | Pending |
| DEAL-02 | Phase 2B | Pending |
| DEAL-03 | Phase 2B | Pending |
| DEAL-04 | Phase 2B | Pending |
| DEAL-05 | Phase 2B | Pending |
| DEAL-06 | Phase 2B | Pending |
| DEAL-07 | Phase 2B | Pending |
| DATA-01 | Phase 2A | Pending |
| DATA-02 | Phase 2A | Pending |
| DATA-03 | Phase 2A | Pending |
| DATA-04 | Phase 5 | Pending |
| DATA-05 | Phase 2A | Pending |
| DATA-06 | Phase 2A | Pending |
| DATA-07 | Phase 2A | Pending |
| DATA-08 | Phase 2A | Pending |
| DATA-09 | Phase 2A | Pending |
| DATA-10 | Phase 2A | Pending |
| TIER-01 | Phase 2A | Pending |
| TIER-02 | Phase 2A | Pending |
| TIER-03 | Phase 2A | Pending |
| TIER-04 | Phase 2A | Pending |
| TIER-05 | Phase 2A | Pending |
| TIER-06 | Phase 2A | Pending |
| TIER-07 | Phase 2A | Pending |
| METER-01 | Phase 2A | Pending |
| METER-02 | Phase 2A | Pending |
| METER-03 | Phase 2C | Pending |
| METER-04 | Phase 2A | Pending |
| METER-05 | Phase 2A | Pending |
| METER-06 | Phase 3 | Pending |
| METER-07 | Phase 3 | Pending |
| METER-08 | Phase 2A | Pending |
| METER-09 | Phase 2A | Pending |
| METER-10 | Phase 2A | Pending |
| METER-11 | Phase 3 | Pending |
| ANLYT-09 | Phase 2A | Pending |
| ANLYT-10 | Phase 2A | Pending |
| ANLYT-11 | Phase 2A | Pending |
| ADMIN-01 | Phase 3 | Pending |
| ADMIN-02 | Phase 3 | Pending |
| ADMIN-03 | Phase 3 | Pending |
| ADMIN-04 | Phase 3 | Pending |
| COHRT-01 | Phase 2A | Pending |
| COHRT-02 | Phase 2A | Pending |
| COHRT-03 | Phase 2A | Pending |
| COHRT-04 | Phase 2A | Pending |
| COHRT-05 | Phase 2A | Pending |
| CHURN-01 | Phase 3 | Pending |
| CHURN-02 | Phase 3 | Pending |
| CHURN-03 | Phase 3 | Pending |
| CHURN-04 | Phase 3 | Pending |
| CHURN-05 | Phase 3 | Pending |
| CHURN-06 | Phase 3 | Pending |
| CHURN-07 | Phase 3 | Pending |
| SESS-01 | Phase 2A | Pending |
| SESS-02 | Phase 2A | Pending |
| SESS-03 | Phase 2A | Pending |
| SESS-04 | Phase 2A | Pending |
| SESS-05 | Phase 2A | Pending |
| SESS-06 | Phase 2A | Pending |
| SESS-07 | Phase 2A | Pending |

**Coverage:**
- v1 requirements: 157 total (20 complete, 137 pending)
- Mapped to phases: 151 (LIST, TAG, PROP-07 now assigned to Phase 2C)
- Mapped to TBD (phase assignment pending): 6 (BILL-07–10, SKIP-01–06 pending API cost evaluation, UX-04)
- Unmapped: 0 ✓

---
*Requirements defined: 2026-03-25*
*Last updated: 2026-03-27 — Restructured Phase 2 into 2A (infrastructure services), 2B (BRRRR calculator & Deal Score), 2C (portfolio management); moved CACHE-01–09 to Phase 3; assigned LIST, TAG, PROP-07 to Phase 2C; moved ANLYT-06 to Phase 4; moved ADMIN, METER-06/07/11 to Phase 3; added DATA-04 to Phase 5*
