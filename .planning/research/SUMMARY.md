# Project Research Summary

**Project:** Real Estate Investment Analysis Platform (BRRRR + DADU)
**Domain:** Real estate investment SaaS — automated data, freemium, multi-market
**Researched:** 2026-03-25
**Confidence:** MEDIUM (Next.js 16 verified HIGH; competitor data and external APIs MEDIUM; DADU whitespace HIGH)

## Executive Summary

This is a greenfield SaaS build targeting a real, unoccupied niche: no tool today combines automated public records + GIS pull, BRRRR financial modeling, and ADU/DADU feasibility analysis in a single workflow. The closest analog is DealCheck — a strong deal calculator with zero data automation and no ADU awareness. The recommended approach is to build infrastructure-first (types, schema, auth, billing metering) before any user-facing feature ships, then stack features in strict dependency order: BRRRR calculator (free tier, validates the product exists) → paid data pipeline → DADU feasibility engine → full integrated analysis. This order ensures billing and metering are in place before any variable-cost API is enabled, and that the competitive differentiators (ADU feasibility, automated data) have a working foundation to sit on.

The primary risks are execution risks, not technical ones. Hardcoding zoning rules in application logic instead of a database would require a full rewrite when Portland or Seattle updates its ADU rules — and they will. Treating county assessor APIs as reliable infrastructure without retry/fallback logic will produce a broken paid tier the first time a county goes offline for maintenance. Building the automated data pull without first shipping the metering layer will invert unit economics. The DADU feasibility feature specifically requires treating accuracy as a hard product requirement, not a nice-to-have: wrong feasibility answers destroy investor trust faster than a missing feature.

The founder's part-time bandwidth constraint is the most consequential project variable. Each phase must ship something a real investor can use and give feedback on — no phase should exceed 6-8 weeks of part-time build without a testable artifact. The architecture recommendations (adapter pattern for market pipelines, rules as data, API-first REST layer) are slightly more upfront investment than taking shortcuts, but every shortcut in this domain has a HIGH recovery cost (schema migrations, logic rewrites, user trust repair). The upfront investment is worth it.

## Key Findings

### Recommended Stack

The stack is largely fixed by the existing prototype: Next.js 16.2.1, React 19.2.4, Tailwind v4. These are very recent versions with breaking changes from prior training data — Next.js 16 specifically renames `middleware.ts` to `proxy.ts`, makes `params`/`cookies()`/`headers()` async-only, and removes `next lint` from the build. Read `node_modules/next/dist/docs/` before writing any Next.js code. For the new SaaS infrastructure layer, the recommended additions are Neon (serverless PostgreSQL), Drizzle ORM (TypeScript-native, SQL-transparent), Better Auth (designed for App Router, no edge runtime friction), Stripe (billing), and Inngest or Trigger.dev (background jobs for market data pipelines). All external API calls must go through Next.js Route Handlers — never from client components.

**Core technologies:**
- Next.js 16.2.1 (installed): Full-stack framework + REST API layer via Route Handlers — already installed; `proxy.ts` replaces `middleware.ts`
- React 19.2.4 (installed): UI layer with Server Components — installed; do not upgrade independently
- TypeScript 5.x (installed): Type safety — required for complex nested types across property/zoning/financial domains
- Tailwind v4 (installed): Styling — CSS-first config; `tailwind.config.js` is not used in v4
- PostgreSQL via Neon: Primary data store — serverless, branch-per-PR, generous free tier
- Drizzle ORM: Database access — SQL-transparent, better fit than Prisma for data-pipeline-heavy work
- Better Auth: Authentication — TypeScript-native, App Router native, no edge runtime friction
- Stripe: Billing and freemium gating — industry standard; sync subscription state to own DB, never call Stripe in hot paths
- Inngest or Trigger.dev: Background jobs for market data pipelines — avoids Redis/BullMQ overhead at MVP scale
- Zod + react-hook-form: Validation + forms — validate all external API responses and API route inputs

### Expected Features

The market has two clear feature categories: table-stakes calculators that users assume exist (cash flow, cap rate, CoC, DSCR, GRM, PITI), and the actual competitive differentiation (automated public records pull, DADU/ADU feasibility, rent estimation, BRRRR + ADU combined cash flow). The single highest-confidence whitespace finding is that no competitor offers DADU/ADU feasibility analysis — this is confirmed absent across DealCheck, PropStream, BatchLeads, REIPro, BiggerPockets, Mashvisor, Privy, and REISift as of the training data cutoff.

**Must have (table stakes):**
- Cash flow, cap rate, CoC, GRM, DSCR calculators — users expect these; already in prototype
- User authentication and saved analyses — SaaS baseline; required for billing and deal history
- Mobile-responsive UI — investors review deals on phones at walkthroughs
- Shareable deal report — investors share with partners and lenders constantly

**Should have (competitive differentiators):**
- Automated public records + GIS pull on address entry — eliminates 20-30 minutes of manual lookup per deal; makes the 60-second claim credible
- BRRRR analyzer with full refinance cycle modeling — no mainstream tool models the full purchase → rehab → ARV → refi → rental cash flow cycle well
- DADU/ADU feasibility analysis with per-municipality zoning rules — the primary unoccupied whitespace; zero competitors offer this
- Automated rent estimation via Rentcast API — removes a manual research step that DealCheck and BiggerPockets calculators skip
- BRRRR + ADU combined cash flow (ADU income as first-class variable) — synthesis feature no competitor models
- Freemium gate: manual calculators free, automated data paid — DealCheck has a free tier; most others do not

**Defer (v2+):**
- Off-market prospecting — PropStream's moat is too large to compete with at MVP; data scale required first
- Skip tracing — legal surface area (TCPA) + commodity infrastructure; post-MVP
- AI deal recommendations — needs user deal history to train on; premature without data
- Native mobile app — API-first architecture enables this post-MVP; mobile-responsive web sufficient at launch
- Deal CRM / pipeline — competes with specialized tools; BRRRR analysis is the core differentiator

### Architecture Approach

The recommended architecture is a layered system: Next.js App Router handles both the web UI and the REST API (`app/api/v1/`), a service layer contains all business logic (property lookup, BRRRR engine, DADU feasibility engine) as functions with no I/O, and a data layer contains PostgreSQL (via Neon) plus per-market pipeline adapters for county/GIS APIs. The two most critical architectural decisions — both expensive to reverse — are: (1) zoning rules stored as database rows keyed by municipality and zone code, never as TypeScript constants, and (2) market pipelines implemented as adapter pattern with a registry, never as `if market === 'portland'` conditionals in service code. Analysis engines (BRRRR, DADU) must be pure functions with zero database imports, making them fully testable without infrastructure.

**Major components:**
1. REST API layer (`app/api/v1/`) — versioned from day one; supports future mobile and browser plugin clients
2. Market Pipeline Registry (`lib/pipelines/registry.ts`) — maps market slug to per-market adapter; adding market N requires zero changes to service code
3. DADU Feasibility Engine (`lib/services/analysis/dadu.ts`) — pure function; receives property attributes + rules array, returns structured feasibility result with per-constraint checks
4. BRRRR Calculation Engine (`lib/services/analysis/brrrr.ts`) — pure function; full purchase → rehab → ARV → refi → cash flow cycle
5. Zoning Rules Database — `zoning_rules` table with market_slug, municipality, zone_code, rule_type, value, effective_date, source_url; updatable without deployments
6. Subscription/Metering Service — tier gate checks live in the service layer, not route layer; usage tracking before any live API call is enabled

### Critical Pitfalls

1. **DADU rules hardcoded in application logic** — Portland changed ADU rules multiple times in 3 years; any TypeScript constant with setback numbers or lot coverage percentages requires a deployment to update. Prevention: design the `zoning_rules` table before writing any feasibility logic; engine reads from DB, never from code constants. Recovery cost: HIGH.

2. **County assessor APIs treated as reliable infrastructure** — public records APIs go offline without notice, return stale data, and change endpoints without versioning. A synchronous dependency on them will break the paid tier in production. Prevention: every external API call needs timeout, retry with exponential backoff, and graceful degradation to "enter manually." Build fallback behavior into the adapter layer from day one. Recovery cost: MEDIUM but damage to user trust is HIGH.

3. **API cost blowout from unmetered lookups** — Rentcast and county APIs are per-lookup variable costs. Building the lookup feature before the metering layer is in place means costs run before revenue. Prevention: usage tracking table must exist before any live API call is enabled for any user, including during development. The freemium gate must be server-enforced (Route Handler), never just UI-level. Recovery cost: MEDIUM-HIGH.

4. **Wrong DADU feasibility answers shipped** — An investor who acts on incorrect feasibility data and discovers the error mid-deal faces financial loss. This is worse than no feature. Prevention: every result must display rule source URL, `last_verified` date, and a "report inaccuracy" link. Never show a binary FEASIBLE/NOT FEASIBLE without the specific constraint checks that produced it. Recovery cost: HIGH (trust damage is permanent for affected users).

5. **Part-time founder scope creep** — The full requirements list is correct but attempting it all simultaneously with 10-15 hours/week is a path to never shipping. Prevention: each phase must produce a testable artifact within 6-8 weeks; ship to 3-5 validation investors before building the next phase; architecture investment (adapter pattern, rules DB schema) is justified but must not consume more than 30% of build time before user-facing features exist.

## Implications for Roadmap

Based on research, suggested phase structure:

### Phase 1: Foundation — Types, Schema, Auth, Billing Infrastructure

**Rationale:** Authentication, database schema, and billing metering must exist before any user-facing feature can be saved, gated, or charged for. Specifically, the metering layer (usage tracking table) must precede any live API call — this is the pitfall that cannot be retrofitted cheaply. Building these first means all subsequent phases ship with gates already in place. The zoning rules DB schema also belongs here: the DADU feasibility engine cannot be written without it, and changing the schema after data exists is painful.

**Delivers:** Working auth (signup, login, session), PostgreSQL schema (users, subscriptions, zoning_rules, analyses tables with market_id from day one), Stripe subscription lifecycle (checkout, webhook, plan sync to DB), usage tracking table, and the `proxy.ts` auth/tier-gate middleware. No user-facing analysis features yet — this phase is invisible to end users but is the prerequisite for everything.

**Addresses:** User authentication (table stakes), freemium gating architecture, subscription billing, market-as-first-class-concept in schema

**Avoids:** API cost blowout (metering before APIs), wrong tier access (server-side gate from day one), single-tenant schema trap (market_id on all records from day one)

**Stack:** Better Auth, Drizzle ORM + Neon, Stripe, `proxy.ts` (not `middleware.ts`)

**Research flag:** Better Auth version and plugin API should be verified against current docs before implementation (MEDIUM confidence in training data).

### Phase 2: Free Tier — BRRRR Calculator and Core Calculators

**Rationale:** BRRRR analysis is independent of the automated data pull — users can run it with manual inputs. Shipping a working BRRRR calculator with free-tier access gets the product in front of validation investors without requiring the county API integrations. This also proves the analysis engine and validates that the calculator logic (from the prototype) is sound before the paid data layer is built on top of it. A working free tier also enables early conversion funnel testing.

**Delivers:** BRRRR analyzer UI with full refinance cycle (purchase, rehab costs, ARV, refinance LTV, post-rehab cash flow), supporting calculators (cap rate, CoC, GRM, DSCR, PITI), free-tier API route (`POST /api/v1/analysis/brrrr` — auth required, any tier), saved analyses (requires Phase 1 auth), mobile-responsive layout.

**Addresses:** BRRRR analyzer (primary differentiator), table-stakes calculators, saved analyses, mobile-responsive UI

**Avoids:** Builds analysis engine as pure function (zero DB imports) — fully testable before any GIS API is integrated

**Architecture:** `lib/services/analysis/brrrr.ts` as pure function; typed inputs/outputs defined in `types/analysis.ts`; Vitest unit tests for all calculator logic

**Research flag:** Standard patterns — no research phase needed. BRRRR math is stable domain knowledge (HIGH confidence). Next.js Route Handlers are well-documented.

### Phase 3: DADU Feasibility Engine + Portland Zoning Rules Seed

**Rationale:** DADU feasibility is the highest-confidence competitive differentiator. It must be built before the paid data pipeline because the feasibility engine is a pure function that reads from the zoning rules DB — it can be built, seeded with Portland rules, and tested end-to-end without any live GIS API. This also allows DADU feasibility UX (constraint checks, data provenance display, inaccuracy reporting) to be validated before the automated data pull that will eventually feed it. Shipping DADU with manual address inputs first is a valid validation step.

**Delivers:** DADU feasibility engine (`lib/services/analysis/dadu.ts` — pure function), Portland + Seattle zone rules seeded into `zoning_rules` table (R1/R2/R2.5/R5/R7 Portland; SF5/SF7500/SF9600 Seattle), feasibility API route (`POST /api/v1/analysis/dadu` — paid tier gate), UI showing per-constraint check results (not binary FEASIBLE/NOT FEASIBLE), `last_verified` date display on each result, "report inaccuracy" link.

**Addresses:** DADU/ADU feasibility (primary differentiator), per-municipality zoning rules DB, zoning rules accuracy and provenance

**Avoids:** Rules hardcoded in code (all rules in DB from the start), wrong feasibility answers (constraint-level display + freshness indicator), binary verdict without explanation

**Architecture:** Feasibility engine reads `RuleSet[]` passed in as arguments — never queries DB directly; service layer fetches and passes rules; engine is pure and fully unit-testable

**Research flag:** Needs deeper research on Portland zone-level ADU rules (specific setbacks, lot coverage by zone code for R1-R10) and Seattle zone-level rules (SF5/SF7500/SF9600 DADU rules post-2019 ordinance and any 2024 amendments). Rule accuracy is the product — do not seed with guessed values.

### Phase 4: Paid Data Pipeline — Portland Market (First Market)

**Rationale:** The automated property data pull is what makes the 60-second promise credible and what gates the paid tier's core value. Portland is the first market because it has publicly accessible GIS and county assessor APIs (Portland BDS permit API, Multnomah County assessor). Building the adapter pattern correctly for one market validates the architecture before Seattle is added. Metering from Phase 1 ensures all lookups are tracked before a single paid API call is made.

**Delivers:** Address geocoding with jurisdiction resolution (must identify governing municipality, not just city string — Beaverton vs Portland vs Lake Oswego are different municipalities), Multnomah County assessor adapter (`lib/pipelines/portland-or/assessor.ts`), Portland GIS adapter (`lib/pipelines/portland-or/gis.ts`), Rentcast adapter (`lib/adapters/rentcast.ts`), property lookup API route (`POST /api/v1/property/lookup` — paid tier), result caching (parcel data 24-hour TTL, rent estimates 7-day TTL), graceful degradation to manual entry on API failure, data provenance display ("pulled from Multnomah County Assessor on [date]").

**Addresses:** Automated public records + GIS pull, rent estimation (Rentcast), property data auto-population into BRRRR/DADU analysis, paid tier value proposition

**Avoids:** County API as synchronous hard dependency (all calls have timeout + retry + fallback), market-specific conditionals in service code (adapter pattern with registry), unbounded API costs (usage metering from Phase 1 already in place)

**Architecture:** `MarketPipeline` interface defined first; Portland pipeline implements it; `lib/pipelines/registry.ts` maps `'portland-or'` to implementation; property service calls registry, never the Portland adapter directly

**Research flag:** HIGH research priority. County assessor API format (ESRI ArcGIS REST vs JSON vs XML), authentication requirements, rate limits, and field mappings for Multnomah County must be verified against live documentation before implementation. Rentcast pricing tier and rate limits must be confirmed. Geocoder selection (parcel-level precision required — SmartyStreets, Precisely, or county-specific) needs evaluation.

### Phase 5: Seattle Market + Full Integration

**Rationale:** Adding Seattle after Portland proves the adapter pattern generalizes with zero changes to the property service. It also expands addressable market significantly (King County is a large, active DADU market). Full integration means the end-to-end flow — address entry → automated data pull → DADU feasibility → BRRRR analysis with auto-populated inputs → combined cash flow with ADU income → shareable report — works as a single workflow.

**Delivers:** King County assessor adapter + Seattle GIS adapter (proves adapter pattern scales), shareable deal report (persistent link + PDF export — synthesizes all analysis outputs), BRRRR + ADU combined cash flow display (ADU rent as first-class income variable in the BRRRR model), deal history dashboard for saved analyses, freemium demo path (sample property analysis visible before paywall — avoids the "free tier delivers no value" pitfall).

**Addresses:** Seattle market coverage, shareable deal report (table stakes), BRRRR + ADU cash flow integration (top differentiator), freemium conversion funnel

**Avoids:** Free tier with no standalone value (demo path with pre-seeded example analysis before upgrade prompt)

**Architecture:** Seattle pipeline implements same `MarketPipeline` interface; registry adds `'seattle-wa'` entry; zero changes to property service validates the pattern

**Research flag:** King County assessor API format and Seattle GIS endpoints need verification (same research approach as Portland in Phase 4). Shareable report format (persistent link vs. PDF vs. both) is a UX decision that benefits from peer feedback after Phase 4 ships — consider deferring PDF until post-validation.

### Phase Ordering Rationale

- Infrastructure before user-facing features because metering and auth cannot be retrofitted cheaply — this is the single most expensive pitfall to recover from
- Free tier calculator before paid data pipeline because BRRRR analysis is independent of automated data, gets product in front of validation investors faster, and allows the analysis engine to be tested before the data layer exists
- DADU feasibility engine before the GIS pipeline because the engine is a pure function that can be validated with seeded rules; building the engine first means the pipeline's output has a proven consumer when it ships
- Portland before Seattle because the adapter pattern must be validated with one market before it becomes load-bearing; any architecture mistake costs one market, not two
- Shareable report and full integration last because it requires all analysis components to exist; building it before the components are stable produces a report of incomplete analysis

### Research Flags

Phases needing deeper research during planning:
- **Phase 3 (DADU rules seed):** Portland and Seattle zone-level ADU/DADU rules must be manually researched from municipal code — not inferred. Portland BDS and Seattle DPD are the authoritative sources. Rules vary by zone designation within each city.
- **Phase 4 (Portland data pipeline):** County assessor API format, auth, rate limits, and field schemas for Multnomah County require live documentation verification. Rentcast pricing tier must be confirmed against expected lookup volume. Geocoder selection for parcel-level jurisdiction resolution needs evaluation.
- **Phase 5 (Seattle pipeline):** Same as Phase 4 for King County. Seattle 2024 DADU ordinance amendments (if any) need verification against current municipal code.

Phases with standard patterns (skip research-phase):
- **Phase 1 (Infrastructure):** Auth, Stripe billing, and PostgreSQL schema are well-documented SaaS patterns. Better Auth and Drizzle have stable APIs. Verify Better Auth version before installing.
- **Phase 2 (BRRRR calculator):** Investment math formulas are stable domain knowledge (HIGH confidence). Next.js Route Handlers are standard patterns.

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| Stack | MEDIUM-HIGH | Next.js 16 specifics verified HIGH via official blog. Auth/ORM/billing from training data — verify current versions before installing. |
| Features | MEDIUM | Investment math (HIGH). Competitor feature gaps (MEDIUM — training data Aug 2025 cutoff). DADU whitespace claim (HIGH — consistent absence across all competitors). |
| Architecture | MEDIUM | Core patterns (adapter, rules-as-data, pure engines) are HIGH confidence. Next.js 16-specific implementation details (proxy.ts, async params) verified HIGH via official blog. |
| Pitfalls | MEDIUM | County API reliability and DADU rules maintenance patterns drawn from PropTech domain knowledge; no live verification. Specific API behavior needs hands-on validation. |
| Competitive | MEDIUM | All competitor data from training data (Aug 2025 cutoff). Pricing is LOW confidence. ADU/DADU whitespace is HIGH confidence. |

**Overall confidence:** MEDIUM — sufficient to begin roadmap and Phase 1 build. Phase 3 and Phase 4 need research-phase work before implementation begins.

### Gaps to Address

- **County API specifics (Phase 4 blocker):** Multnomah County assessor API format, authentication, rate limits, and field schemas are unverified. This must be researched before Phase 4 implementation begins — it is the highest-risk integration in the build.
- **Geocoder selection:** Parcel-level geocoding with jurisdiction resolution (governing municipality, not just city string) is required for DADU feasibility accuracy. Tool selection (SmartyStreets, Precisely, county-specific MSAG, or other) needs evaluation against cost and coverage in OR/WA.
- **Rentcast pricing and coverage:** Rentcast API pricing tiers, rate limits, and coverage gaps in lower-density Pacific NW markets should be confirmed before Phase 4. If Rentcast has poor coverage in target markets, an alternative (e.g., Zillow rent API, manual fallback) must be identified early.
- **Portland zone-level rules accuracy (Phase 3 blocker):** DADU rules seeded into the `zoning_rules` table must be sourced from current Portland BDS municipal code, not inferred. Rules from training data knowledge should not be trusted without verification against the current code.
- **Better Auth version and plugin API:** Better Auth is recommended over Auth.js for App Router compatibility, but current version and subscription plugin API should be confirmed before implementation begins.
- **Competitor feature additions since Aug 2025:** Any competitor that may have added ADU/DADU features should be spot-checked before roadmap is finalized. Search "ADU feasibility real estate tool 2025 2026."

## Sources

### Primary (HIGH confidence)
- `.planning/PROJECT.md` — project requirements, constraints, key decisions, and existing codebase context
- `nextjs.org/blog/next-16` (verified via WebFetch) — Next.js 16 breaking changes, new APIs, `proxy.ts`, async params, `cacheComponents`, Turbopack default
- Project `package.json` — confirmed installed versions: next@16.2.1, react@19.2.4, tailwindcss@4
- Portland RIP (Residential Infill Project 2023) and Seattle DADU ordinance (2019) — public policy, stable record

### Secondary (MEDIUM confidence)
- Training data: DealCheck, PropStream, BatchLeads, REIPro, BiggerPockets, Mashvisor, Privy (as of ~Aug 2025) — feature analysis; pricing stale
- Training data: Better Auth, Drizzle ORM, Neon, Inngest/Trigger.dev, Resend — community consensus as of Aug 2025; verify current versions
- Training data: Rentcast API capabilities — verify rate limits and coverage before Phase 4
- Training data: PropTech SaaS failure patterns, county assessor API behavior (ESRI ArcGIS REST, OR/WA GIS systems)

### Tertiary (LOW confidence)
- Competitor pricing figures — all figures stale; verify at each competitor's pricing page before use
- Privy and REISift feature details — thinner training data coverage; verify before any competitive positioning decisions

---
*Research completed: 2026-03-25*
*Ready for roadmap: yes*
