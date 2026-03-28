# Real Estate Investment Analysis Platform (TBD name)

## What This Is

A SaaS platform for real estate investors and wholesalers that eliminates the research legwork behind deal analysis. Enter any address and the platform automatically pulls public records, GIS, and zoning data, then runs BRRRR and DADU/ADU feasibility analysis with rent estimates — delivering a complete investment picture in under 60 seconds. Piloting in Pacific NW markets (OR/WA) where DADU/ADU activity is high and public data is accessible.

## Core Value

Any address → complete investment analysis in under 60 seconds, without manual research.

## Requirements

### Validated

- ✓ BRRRR financial calculator (ARV, rehab cost, refinance LTV, cash flow) — prototype
- ✓ DADU opportunity display (zoning, setback constraints) — prototype
- ✓ Shared financial input state across analysis sections — prototype

> Note: "Validated" here means the calculator logic is sound reference material from the prototype. The prototype architecture is being discarded (clean start). These are requirements confirmed as valuable, not shipped production features.

### Active

**MVP — Core Analysis Engine**
- [ ] Address lookup: enter any address and automatically pull public records, GIS, lot size, structure attributes, and zoning data
- [ ] BRRRR analyzer: ARV estimation, rehab cost inputs, refinance scenario modeling, post-rehab cash flow
- [ ] DADU/ADU feasibility analyzer: assess feasibility using hyper-local zoning rules (setbacks, lot coverage, owner-occupancy, utility hookups)
- [ ] Rent estimation: projected market rent for primary unit and ADU/DADU via Rentcast or equivalent API
- [ ] Deal summary: clean, shareable analysis report per property

**MVP — Platform Infrastructure**
- [x] Authentication and user accounts — Validated in Phase 1: Foundation (Better Auth with email/password, Google OAuth, email verification, password reset)
- [x] Pricing: Free tier (BRRRR calculator only, no saving, acquisition funnel) and Pro tier ($99/mo or $79/mo annual — automated data pull with 50 lookups/month, DADU feasibility, rent estimation, unlimited saves/lists, full calculator suite) — Validated in Phase 1: Foundation (server-enforced via requirePro() returning 402)
- [x] REST API layer designed to support web, mobile, and browser plugin from day one — Validated in Phase 1: Foundation (versioned /api/v1/ routes)
- [x] Subscription/billing integration (Stripe or equivalent) — Validated in Phase 1: Foundation (Stripe Checkout, portal, webhook, subscription status)
- [x] Product analytics (PostHog) — session recording, event tracking, funnel monitoring as a foundation layer so all subsequent phases inherit tracking automatically — Validated in Phase 2A: Infrastructure Services (PostHog provider, pageview tracking, server-side events, lifecycle events, session recording configured)
- [x] Feature gating service — 3-tier gating with database overrides, single config source of truth — Validated in Phase 2A: Infrastructure Services
- [x] Usage metering pipeline — per-action-type limits, pre-execution logging, beta mode bypass, 80%/100% warnings — Validated in Phase 2A: Infrastructure Services
- [x] DataEnrichmentService skeleton — Stage 1/Stage 2 boundary defined, cache TTL tiers, stub implementations — Validated in Phase 2A: Infrastructure Services
- [ ] Property data caching — field-level lazy invalidation with TTL by field type, cascade invalidation, stale-while-revalidate UI
- [ ] Property organization — lists (free: 3, paid: unlimited) and tags (5 per user) with optimistic UI
- [ ] Skip trace — owner contact lookup with rate limiting and usage logging

**MVP — Data Strategy**
- [ ] Pilot in Pacific NW markets (OR/WA — Portland, Seattle, and/or surrounding metros)
- [ ] Hybrid DADU data: manual zoning rules database as source of truth, supplemented by live GIS/county APIs where available
- [ ] Per-market data pipeline: county assessor, city GIS, zoning APIs
- [ ] Rentcast API integration for rent estimates

### Out of Scope

- Off-market prospecting engine (search by zip + filters) — post-MVP; needs data scale first
- ~~Skip tracing~~ — moved to MVP scope (see SKIP-01 through SKIP-06 in REQUIREMENTS.md)
- Direct mail and outreach tools — post-MVP
- Deal pipeline / CRM — post-MVP
- Buy & Hold analyzer — post-MVP; BRRRR and DADU are the core differentiators
- AI-powered recommendations — post-MVP; needs user data to train on
- Market comparables and sold comps — post-MVP
- Collaboration / team sharing — post-MVP
- Mobile app (iOS/Android) — post-MVP; API-first architecture enables this later
- Browser plugin — post-MVP; API-first architecture enables this later
- MLS integration — explicitly avoided at early stage; costly and gated
- Lender marketplace and contractor cost database — long-term vision only
- Mapping / GIS visualization layer — post-MVP; **architect for from day one** (see Long-Term Vision)

## Long-Term Vision

### Mapping and GIS Layer (post-MVP — architect for from day one)

Integrate Mapbox for property visualization with pluggable overlay layers. All GIS data feeds directly into the DADU feasibility scoring engine, not just map display.

**Overlay layers:**
- Parcel boundaries and lot lines
- Zoning — color-coded by zone type
- Topographic terrain — slope and elevation (critical for DADU buildability on sloped lots)
- FEMA flood zones
- School district boundaries
- Satellite imagery
- Sewer and water service area boundaries (public sewer vs. septic)
- Utility connection points — proximity to nearest sewer/water main
- Planned utility expansion zones — from local utility district CIPs and city comprehensive plans. A property on septic but in a planned 2027 sewer expansion zone is a completely different investment thesis. AI should cross-reference CIP documents and surface this insight automatically.
- Existing structure location and footprint on parcel — determines available rear yard space, setback compliance, and buildable area for DADU. Sources: Microsoft Building Footprints dataset (free, national coverage), county assessor GIS, OpenStreetMap.
- Parcel frontage — street and alley frontage measured from parcel geometry. Lots with alley frontage are significantly better DADU candidates (separate entrance, independent access). Calculated programmatically from parcel geometry already pulled from county GIS.

**Data sources:**
- Mapbox — base maps, terrain, satellite imagery
- County GIS portals — parcels, zoning, building footprints, utility boundaries
- Microsoft Building Footprints — free, national coverage
- Local utility district CIPs — planned sewer/water expansion timelines
- USGS — elevation and topographic data
- FEMA — flood zone boundaries
- OpenStreetMap — supplemental building and infrastructure data

**Combined DADU feasibility output (when GIS layer is active):**
- Total lot size and available rear yard after accounting for existing structure placement
- Existing structure footprint and position relative to property lines
- Street and alley frontage measurements
- Setback compliance given existing structure location
- Estimated maximum buildable DADU footprint
- Current utility status (sewer/water/septic)
- Planned utility expansion timeline if applicable
- Slope/terrain assessment for buildability
- Visual Mapbox display of all of the above on the parcel map

**Architecture requirements (enforced from day one — see CLAUDE.md):**
- Pluggable layer system for Mapbox — new overlays added without rearchitecting the map component
- Building footprint and parcel geometry stored and versioned so changes over time can be tracked
- Frontage calculations (street and alley) computed from parcel geometry and stored as derived fields
- Utility expansion timeline fields on property records from day one — not just current utility status: `planned_expansion_zone`, `projected_timeline`, `funding_status`, `source_document`, `confidence_level`
- All GIS layers feed directly into DADU feasibility scoring engine, not just display on map
- Explicit prohibition on flat/current-state-only property modeling — schema must support temporal and spatial dimensions from phase 1

## Competitive Landscape

### Direct Competitors

| Competitor | Focus | BRRRR/Cash Flow | DADU/ADU | Investment Analysis | Notes |
|------------|-------|-----------------|----------|---------------------|-------|
| PropStream | Lead gen + basic analysis | Basic calculator | Basic ADU calculator (construction costs only, zero zoning intelligence) | Shallow | $99/mo Essentials tier — ReVested matches price but goes deeper on analysis |
| DealCheck | Deal analysis | Yes — scenario sliders | No | Moderate (no sensitivity table) | Primary analysis competitor; lacks DADU and systematic downside analysis |
| Dwellito | ADU feasibility | No | AI zoning parsing + GIS buildable area mapping | No | Targets architects/homeowners, not investors; no financial analysis |
| Canibuild | ADU site planning | No | Interactive visual site planning | No | Visual feasibility only; same profile as Dwellito |
| REIPro | Full lifecycle | Yes | No | Feature sprawl — breadth over depth | CRM + marketing + analysis; jack of all trades |
| Mashvisor | Market analytics | Basic | No | Rental property focus | Market-level, not deal-level analysis |

### Competitive Monitoring

Monitor quarterly for signals that require product response:

| Competitor | Monitor For | Response Trigger |
|------------|-------------|------------------|
| Dwellito | Market expansion into Pacific NW; pricing changes; addition of financial analysis or investor-facing features | If Dwellito adds BRRRR or cash flow analysis — treat as significant competitive threat requiring immediate product response |
| Canibuild | Same signals as Dwellito — Pacific NW expansion, investor-facing features | Same response trigger as Dwellito |
| PropStream | Improvements to ADU calculator beyond construction costs; addition of zoning intelligence | If PropStream adds zoning eligibility or setback compliance — accelerate DADU engine differentiation |
| DealCheck | Addition of sensitivity analysis table; DADU/ADU features | If DealCheck adds systematic sensitivity analysis — accelerate sensitivity feature delivery |

### Competitive Moat

ReVested's primary competitive moat is the DADU feasibility engine with hyper-local zoning intelligence. The engine must always return at minimum: zoning eligibility, setback compliance, lot coverage calculation, owner-occupancy status, maximum buildable square footage, and a clear feasibility verdict. These six outputs are the minimum bar — PropStream has none of them. This superiority must never be compromised by shortcuts in the zoning rules database.

## Unit Economics

| Metric | Year 1 | Year 2 | Year 3 |
|--------|--------|--------|--------|
| Monthly churn | 5% | 4% | 3% |
| Average customer tenure (1 ÷ churn) | 20 months | 25 months | 33 months |
| LTV (tenure × $99/month) | $1,980 | $2,475 | $3,267 |
| Target blended CAC | $20–40 | $40–60 | $40–80 |
| LTV:CAC ratio | 50–99x | 41–62x | 41–82x |
| Free-to-paid conversion rate | 3–5% | 5–8% | 5–8% |

The high LTV:CAC ratio in Year 1 reflects founder-network acquisition where CAC is near zero. As the product moves to paid acquisition channels (Google Ads, content marketing), blended CAC will rise to $40–80 and LTV:CAC will normalize to 25–50x — still excellent for B2B SaaS. The 3–5% free-to-paid conversion assumption is intentionally conservative. If the product delivers on its value proposition, conversion could reach 8–10% — but financial planning should never depend on optimistic conversion assumptions.

## Context

**Existing codebase:** A Next.js 16 prototype with calculator UI and mock data. The calculator formulas (BRRRR, cap rate, cash-on-cash) are valid reference material. The architecture — mock data layer, no auth, no API, client-side state only — is being replaced entirely with a clean start.

**Stack:** Next.js 16 (App Router), React 19, Tailwind v4. Note: these are very new versions with breaking changes from prior training data. Read `node_modules/next/dist/docs/` before writing Next.js code (see AGENTS.md).

**Markets:** Four v1 launch markets, all in the Pacific NW. Washington markets are prioritized — the founder's investor and realtor network is concentrated there:
- **King County WA** (Seattle, Bellevue, Redmond, Renton) — primary market; largest investor community, single zoning authority
- **Snohomish County WA** (Everett metro) — active investor community, reasonable open GIS data availability
- **Pierce County WA** (Tacoma metro) — active investor community, reasonable open GIS data availability
- **Multnomah County OR** (Portland metro) — secondary market; strong DADU activity post-2023 Residential Infill Project

All four are single county jurisdictions, which simplifies the data pipeline per market (one assessor API, one zoning authority).

**Validation plan:** Founder has a day job and is not a daily active investor. MVP validation = ship to 3-5 active investor peers in the target market for structured feedback. Not waiting for personal daily use.

**DADU complexity:** Zoning rules are hyper-local, change frequently, and vary by municipality. The hybrid data strategy (manual rules DB + live APIs) means DADU feasibility accuracy depends on ongoing maintenance of market-specific rules. This is a competitive moat if done well.

**Zoning data freshness strategy:**
- Monthly review of zoning changes for all active pilot county jurisdictions — not quarterly
- Subscribe to county planning department newsletters, city council agendas, and amendment notifications for King, Snohomish, Pierce, and Multnomah counties
- User-facing "Report an inaccuracy" button on every DADU feasibility result — crowd-source change detection from active users who know their local markets
- Store `rule_verified_date` and `rule_source` per zoning rule in the database — display to users for transparency
- At 20+ counties (Year 2 target): evaluate partnership with a commercial zoning data provider (Zoneomics, municipal.io) to automate change detection at scale
- Any zoning rule change triggers immediate lazy invalidation of all cached DADU feasibility scores for affected parcels — per existing caching and invalidation architecture

**Pricing strategy:** Two tiers only at launch — Free (BRRRR calculator only, no saving, acquisition funnel) and Pro ($99/month or $79/month billed annually). Pro includes 50 automated lookups/month with $1.50 overage per lookup. Skip trace credits TBD pending API cost evaluation. Pro at $99 matches PropStream Essentials price but is analysis-focused vs their lead-gen focus. DADU feasibility engine must be meaningfully deeper than PropStream's basic ADU calculator — hyper-local zoning rules are the key differentiator. Annual pricing (20% discount) presented as default on pricing page. Team tier deferred until Phase 6.

**Go-to-market (Year 1):** At 3–5% free-to-paid conversion, achieving 50 paying customers by end of Year 1 requires 1,000–1,667 free signups. Free signup volume — not conversion rate — is therefore the primary Year 1 growth challenge. All GTM activity in Year 1 should be evaluated against its ability to drive free signups, not direct paid conversions.

## Constraints

- **API-first**: REST API must support web, mobile, and browser plugin from day one — do not build web-only shortcuts that break future clients
- **Variable data costs**: Live API calls (county records, Rentcast) metered per Pro user — 50 lookups/month included, $1.50 overage; free tier has zero API access
- **DADU data maintainability**: Zoning rules DB must be easy to update per market as rules change — do not hardcode zoning logic into app code
- **Market scoping**: Launch with 4 Pacific NW county-level markets (King, Snohomish, Pierce, Multnomah); data pipeline architecture must support adding new markets without code changes
- **Founder bandwidth**: Part-time build — phases should deliver working, testable features early so peer feedback can happen at each step

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Clean start on architecture | Prototype is UI-only with no data layer, auth, or API — adding SaaS infrastructure on top would compound tech debt | — Pending |
| 4-county Pacific NW launch markets | Founder's investor/realtor network concentrated in WA; all 4 are single county jurisdictions simplifying data pipelines; strong DADU activity across all markets | — Pending |
| Hybrid DADU data strategy | Live APIs alone are inconsistent across municipalities; manual rules DB ensures accuracy; hybrid allows automation where possible | — Pending |
| Two-tier pricing: Free (acquisition funnel) + Pro ($99/mo) | Free tier intentionally limited to drive conversions; Pro at $99 matches PropStream Essentials; no intermediate tier at launch | — Pending |
| REST API from day one | Mobile app and browser plugin are planned post-MVP — building web-only shortcuts now would require expensive rewrites | — Pending |
| No MLS dependency | MLS APIs are costly and access-gated; public records + GIS serves the core use case without it | — Pending |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-27 — Phase 2A complete: gating service, usage metering, PostHog analytics, DataEnrichmentService skeleton all validated*
