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
- [ ] Authentication and user accounts
- [ ] Freemium gating: free tier = manual input + calculators; paid tier = automated data pull + DADU feasibility + rent estimates
- [ ] REST API layer designed to support web, mobile, and browser plugin from day one
- [ ] Subscription/billing integration (Stripe or equivalent)

**MVP — Data Strategy**
- [ ] Pilot in Pacific NW markets (OR/WA — Portland, Seattle, and/or surrounding metros)
- [ ] Hybrid DADU data: manual zoning rules database as source of truth, supplemented by live GIS/county APIs where available
- [ ] Per-market data pipeline: county assessor, city GIS, zoning APIs
- [ ] Rentcast API integration for rent estimates

### Out of Scope

- Off-market prospecting engine (search by zip + filters) — post-MVP; needs data scale first
- Skip tracing — post-MVP
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

**API costs:** Live data lookups (public records, rent estimates) are variable-cost. Gating them behind the paid tier keeps costs aligned with revenue. Free tier relies on user-provided manual inputs only.

## Constraints

- **API-first**: REST API must support web, mobile, and browser plugin from day one — do not build web-only shortcuts that break future clients
- **Variable data costs**: Live API calls (county records, Rentcast) must be metered per paid user — no unbounded free lookups
- **DADU data maintainability**: Zoning rules DB must be easy to update per market as rules change — do not hardcode zoning logic into app code
- **Market scoping**: Launch with 4 Pacific NW county-level markets (King, Snohomish, Pierce, Multnomah); data pipeline architecture must support adding new markets without code changes
- **Founder bandwidth**: Part-time build — phases should deliver working, testable features early so peer feedback can happen at each step

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Clean start on architecture | Prototype is UI-only with no data layer, auth, or API — adding SaaS infrastructure on top would compound tech debt | — Pending |
| 4-county Pacific NW launch markets | Founder's investor/realtor network concentrated in WA; all 4 are single county jurisdictions simplifying data pipelines; strong DADU activity across all markets | — Pending |
| Hybrid DADU data strategy | Live APIs alone are inconsistent across municipalities; manual rules DB ensures accuracy; hybrid allows automation where possible | — Pending |
| Freemium gate: automated data behind paid tier | Keeps API costs variable and aligned with revenue; free tier still delivers value via calculators | — Pending |
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
*Last updated: 2026-03-25 after initialization*
