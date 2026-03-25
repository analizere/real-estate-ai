# Pitfalls Research

**Domain:** Real estate investment analysis SaaS — public records data, zoning/ADU feasibility, freemium, multi-market expansion
**Researched:** 2026-03-25
**Confidence:** MEDIUM — no live web search available; findings drawn from well-documented PropTech patterns, public data API behavior, and SaaS freemium literature. Flagged where direct verification would strengthen claims.

---

## Critical Pitfalls

### Pitfall 1: Treating Public Records APIs as Reliable Infrastructure

**What goes wrong:**
County assessor and GIS APIs are not consumer-grade infrastructure. They go offline for maintenance windows (often unannounced), return stale data (assessments lag 6-18 months), return structurally inconsistent responses across counties, change endpoints without versioning, and enforce rate limits that are not documented. When the app treats these as synchronous, always-available dependencies, a single county API outage causes the paid tier to fail silently or return obviously wrong values — and the user blames the product, not the county.

**Why it happens:**
Developers test against live APIs during development when they're working, build the happy path, and treat error states as edge cases. The prototype already has no error handling (confirmed in codebase review). The failure modes of public data APIs are not visible until they actually fail in production.

**How to avoid:**
- Every public records API call must be wrapped with explicit timeout, retry with exponential backoff, and graceful degradation to "data unavailable, enter manually"
- Cache successful responses aggressively (county data changes at most once per assessment cycle — 6-12 months for most fields). A 24-hour TTL is conservative and safe for most fields
- Display data freshness timestamps to users ("pulled from King County Assessor on March 20, 2026") so stale data is visible, not hidden
- Design the UI so that a failed data pull degrades to the free-tier manual input mode, not to a broken page
- Never block the analysis from loading on a failed API call — partial data is better than a spinner

**Warning signs:**
- Any code path that throws an unhandled error or shows a loading spinner indefinitely when an API call fails
- API integration tests that only test the success path
- No retry logic in API client code
- Analysis page that cannot render without a successful upstream API response

**Phase to address:** Data pipeline phase (before paid tier launch). Retry/fallback behavior must be built into the API client layer from day one, not retrofitted.

---

### Pitfall 2: DADU Feasibility Rules Encoded in Application Logic Instead of a Rules Database

**What goes wrong:**
Zoning rules for DADU/ADU feasibility (setbacks, lot coverage, height limits, owner-occupancy requirements, utility hookup rules) are hyper-local, change frequently, and vary at the municipality — sometimes parcel — level. If these rules are hardcoded in TypeScript/JavaScript business logic, every rule change requires a code deploy. Portland and Seattle have both had significant ADU rule changes in recent years (Portland's middle housing legalization 2023, Seattle's DADU legalization 2019, subsequent amendments). A product that gives wrong feasibility answers because the rules are stale destroys trust faster than a product that says "we don't have data for this municipality."

**Why it happens:**
It is faster to hardcode a rule than to design a rules data schema. The prototype already encodes DADU constraints as static property fields (`daduOpportunity` in mock data). Developers carry this pattern forward without questioning whether it belongs in data or code.

**How to avoid:**
- Design a `zoning_rules` database table/collection as a first-class object before building any feasibility logic
- Schema must support: municipality, rule type, rule value, effective date, expiration date, source URL, last verified date
- Feasibility engine reads from the database — it does not contain market-specific constants
- The rules database must be updatable by an admin (or eventually the founder) without a code deploy
- For MVP, a JSON file or simple database table is acceptable — the point is separation of rules from logic
- Each rule must carry a `last_verified` timestamp so the UI can warn users when rules are potentially stale

**Warning signs:**
- Any TypeScript file containing setback numbers, lot coverage percentages, or owner-occupancy requirements as constants
- Feasibility logic that branches on city or county name strings directly in code
- No administrative interface or config file for updating zoning rules independently of deployments

**Phase to address:** Data strategy phase, before DADU feasibility engine is built. The schema decision cannot be retrofitted without rewriting the feasibility logic.

---

### Pitfall 3: Multi-Market Expansion Requires a Schema Decision on Day One

**What goes wrong:**
Starting with hardcoded Oregon/Washington markets and then trying to add new markets later reveals that the data pipeline, zoning rules, and property data schemas were built with Pacific NW assumptions baked in. Field names, data formats, and API structures differ across county assessors (some return XML, some JSON, some require SOAP, some have no API at all). If the market is not a first-class concept in the data model, adding market 3 requires touching every layer of the application.

**Why it happens:**
"We'll worry about that when we expand" is a reasonable short-term decision that becomes very expensive. The temptation to hardcode Portland and Seattle and move fast is strong when the founder has limited bandwidth.

**How to avoid:**
- Every database record that is market-specific must have a `market_id` or `county_fips` foreign key from day one — even when only one market exists
- The data pipeline must be structured as a per-market plugin/adapter pattern: each market implements a common interface (`fetchParcelData(address)`, `fetchZoningData(parcel_id)`) with market-specific implementation behind the interface
- Zoning rules table must be keyed by municipality — see Pitfall 2
- Never hardcode county FIPS codes, API endpoints, or data field mappings as application constants; put them in configuration

**Warning signs:**
- Any database migration or schema definition without a market/county identifier column on property or parcel records
- Data pipeline code that contains a county assessor URL as a string constant rather than a configurable value
- Feature flags or code branches based on `if market === 'portland'` instead of market capability flags from the database

**Phase to address:** Data pipeline architecture phase (first market integration). The market-as-first-class-concept decision must be made before any county API integration is written.

---

### Pitfall 4: Free Tier That Delivers No Standalone Value

**What goes wrong:**
The freemium gate is "automated data pull behind paid tier." If the free tier is just blank inputs with a calculator, users who land on the product and don't immediately pay will churn without understanding what the product does. Conversion from free to paid requires that the free user has already internalized the product's value. A free tier that is purely a data-entry form teaches users nothing about the product's automated-data value proposition.

**Why it happens:**
The developer (and founder) understand the value of the automated data pull because they built it. New users don't. The free tier is designed as an obvious gate rather than as a value demonstration tool.

**How to avoid:**
- Free tier should include at least one "sample" or "demo" property analysis with pre-filled real data so users experience the full paid-tier output before being asked to subscribe
- Consider a limited free-tier lookup allowance (e.g., 3 full address lookups free before paywall) rather than zero lookups — this is more effective for conversion than a pure manual-entry free tier
- The upgrade prompt should appear immediately after the user has experienced value, not before ("You've used your 3 free lookups — unlock unlimited for $X/month")
- Copy on the free tier should describe what they're missing, not just ask for payment

**Warning signs:**
- Free tier user sessions that bounce after less than 2 minutes (users never reached the "aha" moment)
- No analytics on where free users drop off in the funnel
- Upgrade prompt appearing on first page load before any product interaction

**Phase to address:** Freemium gating phase. Free tier UX must be designed alongside the paywall, not as an afterthought.

---

### Pitfall 5: Part-Time Founder Scope Creep Kills the MVP

**What goes wrong:**
A part-time founder with a full-time job has roughly 10-15 hours per week of focused build time, at best. Features that seem "quick to add" compound into a never-shipping product. The prototype already has a broad feature surface (BRRRR, DADU, deal summary, shared state) with zero infrastructure. Adding auth, data pipelines, billing, and multi-market support simultaneously while also building the DADU rules engine and the BRRRR analyzer is a guaranteed stall.

**Why it happens:**
The requirements list in PROJECT.md is comprehensive and correct — the mistake is attempting all of it before shipping anything to validation users. Every week without peer feedback is a week of building on unvalidated assumptions.

**How to avoid:**
- Ruthlessly phase the build: ship the smallest useful slice to the 3-5 validation users as fast as possible, even if it requires manual data entry and no automated pull
- Phase 1 should produce something a real investor can use and give feedback on — not necessarily the automated data pull
- Each phase must produce a tangible artifact that can be used for validation before the next phase begins
- The DADU rules engine for Portland/Seattle only is a better MVP than a generalized multi-market DADU engine — add the second market when the first one is validated
- Treat "done for now" as a valid state: ship Phase 1, get feedback, decide what Phase 2 is based on that feedback

**Warning signs:**
- A phase that has no shippable user-facing artifact until the entire phase is complete
- More than 8 weeks passing without a real investor using a feature
- Architecture work (schema design, API abstraction layers) consuming more than 30% of build time before any user-facing feature ships

**Phase to address:** Every phase — this is an execution discipline constraint, not a one-time architectural decision.

---

### Pitfall 6: API Cost Blowout from Unmetered Lookups

**What goes wrong:**
Rentcast and county data API costs are per-lookup. If the metering layer is not built before the paid tier launches, a single power user or a billing bug can generate hundreds of lookups with no revenue attached. Worse: if the freemium gate is misconfigured and free users can trigger paid API calls, the unit economics invert — the product costs more to run as it grows.

**Why it happens:**
Auth and billing are built first, metering is assumed to come "with billing." In practice, metering requires explicit tracking of API call counts per user per billing period — this is a separate system from Stripe subscriptions.

**How to avoid:**
- Before any live API call is enabled for any user, implement a usage tracking table: `api_calls(user_id, call_type, called_at, cost_cents)`
- Gate every live data lookup behind both (a) subscription status check AND (b) rate limit check — even for paid users (prevents runaway costs from bugs or abuse)
- Set per-user daily/monthly call limits in configuration, not in code constants
- Stripe metered billing (usage-based billing) can replace manual metering for variable-cost lookups — evaluate this before building custom metering from scratch
- Free tier: zero live API calls, enforced at middleware level, not at UI level

**Warning signs:**
- API keys stored in environment variables without any call-count tracking in the database
- Subscription status checked in the UI but not re-verified in the API route handler (client-side gates are bypassable)
- No alerting when API call volume exceeds expected thresholds

**Phase to address:** Authentication and billing phase — metering must be built alongside subscription status, not after.

---

### Pitfall 7: Wrong-Answer DADU Assessments Destroy Credibility

**What goes wrong:**
A user pays for a feasibility assessment, acts on it (or shows it to a client), and later discovers the zoning rules used were wrong or outdated. This is worse than no assessment — it actively harms the user. DADU/ADU rules are genuinely complex: Portland's ADU rules changed significantly in 2023 with HB 2001 middle housing implementation, Seattle updated DADU setback rules in 2024, and individual municipalities within metro areas (e.g., Beaverton vs Portland vs Lake Oswego within Portland metro) have materially different rules. Presenting a binary "FEASIBLE / NOT FEASIBLE" when the underlying data may be stale is a liability.

**Why it happens:**
Developers build the feasibility engine against the rules they research at build time. Those rules are correct at time of writing. The product ships. Rules change. No update process exists. Six months later the product gives wrong answers.

**How to avoid:**
- Never show a binary feasibility verdict without a confidence/freshness indicator: "Based on Portland zoning rules verified March 2026 — rules may have changed"
- Include a "Report inaccurate zoning data" link on every DADU result — users who know the local rules better than the product will self-report errors
- The rules database must track `last_verified_date` per rule and per municipality — surface a warning in the UI when rules are more than 90 days old
- For launch, only claim accuracy for municipalities where the rules have been manually verified — do not extrapolate rules from a neighboring municipality
- Consider a disclaimer on the DADU assessment explicitly stating it is informational, not a substitute for a city planning consultation

**Warning signs:**
- DADU feasibility logic that does not reference a `last_verified` timestamp
- No mechanism for users to report incorrect feasibility outputs
- Feasibility results presented as definitive without any data-provenance information

**Phase to address:** DADU feasibility engine phase — freshness indicators and report-error flows must be built into the first version of the feature, not added later.

---

## Technical Debt Patterns

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Hardcode Portland + Seattle county API URLs as constants | Faster to ship first market | Every additional market requires code changes and a deploy | Never — use config from day one; the cost is 30 minutes |
| Hardcode DADU setback/coverage rules in TypeScript | No database schema to design | Rule changes require deploys; rules are untestable in isolation | Never — rules belong in data |
| Client-side subscription check only (no server re-validation) | Simpler frontend logic | Paid API calls accessible to free users by bypassing UI | Never — any paid gate must be server-enforced |
| Synchronous API calls without timeout/retry | Simpler code | Production outages when any upstream API is slow or down | Never for external APIs |
| Single-tenant data model (no market_id) | Faster first-market build | Schema migration required before second market ships | Acceptable only if multi-market is explicitly out of scope for 12+ months, which it isn't here |
| Skip usage metering until after launch | Faster billing setup | API cost blowout with no visibility | Never — metering must precede live API usage |
| Manual DADU rules verification skipped for adjacent municipalities | Broader geographic coverage | Wrong feasibility answers, user trust damage | Never for paid output |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| County Assessor APIs (OR/WA) | Assume JSON REST API — many counties use ESRI ArcGIS REST (different query syntax), some return XML, some are SOAP | Investigate each county's actual API format before writing integration code; build per-county adapters |
| King County / Multnomah County GIS | Treat the GIS endpoint as the authoritative parcel data source | GIS data and assessor data are separate systems that may disagree on lot size, zoning, and owner info — cross-reference both |
| Rentcast API | Assume rent estimates are available for all addresses | Rentcast has data gaps in lower-density markets; always have a fallback path where rent is user-entered |
| Rentcast API | Ignore rate limits and pricing tiers | Rentcast's free tier is very limited; validate pricing against expected lookup volume before choosing the tier |
| Stripe | Build subscription status check without metered billing for variable-cost lookups | Evaluate Stripe's metered billing feature for per-lookup charges before building custom usage tracking |
| Portland/Oregon DADU zoning data | Assume city of Portland rules apply to all Portland metro addresses | Clackamas County, Washington County, and each city within those counties have independent zoning codes — address geocoding must identify the correct jurisdiction, not just the city name |
| Address geocoding | Use a free/low-tier geocoder that returns ambiguous parcel matches | Ambiguous geocoding (two properties with similar addresses) produces wrong parcel data; use a geocoder with parcel-level precision (e.g., Precisely, SmartyStreets, or county-specific MSAG) |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| Synchronous data pipeline: geocode → county lookup → zoning lookup → rent estimate all in serial | Analysis takes 15-30 seconds; users abandon | Parallelize independent API calls (geocode first, then county + zoning in parallel, then rent estimate) | At every scale — serial calls are slow from day one |
| No caching of county/parcel data | Same address looked up multiple times hits the county API each time; slow and costly | Cache parcel data by address hash with 24-hour TTL; rent estimates by address with 7-day TTL | At first repeat lookup |
| Blocking analysis page render on data fetch | Blank page / long spinner until all data returns | Render analysis shell immediately; stream/hydrate data sections as they arrive | At first slow API response |
| Per-request county API calls without connection pooling | API client creates new HTTP connection per request | Use a connection-pooled HTTP client with keepalive; respect county API rate limits | At ~50+ concurrent users |
| Zoning rules fetched from database on every feasibility calculation | Database query on every analysis request | Cache zoning rules in application memory or Redis on startup; invalidate when rules are updated | At ~100+ daily analyses |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| API keys for Rentcast/county APIs stored only in environment variables with no rotation plan | Key leak → unbounded API costs billed to the account | Store in a secrets manager (AWS Secrets Manager, Vercel environment secrets); plan key rotation schedule |
| Subscription status checked only in client-side code or UI middleware | Free users bypass paywall by crafting direct API requests | Every paid API route handler must independently verify subscription status from the database — never trust the client |
| User-submitted addresses passed directly to county API without sanitization | Path traversal, injection into query parameters | Normalize and validate addresses through a geocoder before constructing any downstream API query |
| No rate limiting on the analysis API endpoint | A single bad actor runs hundreds of analyses, incurring API costs | Rate limit the analysis endpoint per user (e.g., 10/minute for paid, 0 for free) at the API gateway or middleware layer |
| County parcel data cached without user-scoping | User A's lookup results visible to User B if cache key is address-only | Cache key must be address + (either public data marker or user_id if data contains user-specific inputs) — parcel/zoning data is public, so address-only cache key is fine; user analysis results are not |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| Showing a spinner for 15+ seconds while fetching all data before rendering anything | Users assume the product is broken and leave | Render the analysis shell immediately; populate sections as each API call completes (progressive disclosure) |
| Binary FEASIBLE / NOT FEASIBLE without explanation | Users don't know which rule disqualified the property or whether it's borderline | Show which specific constraint(s) triggered the result: "Lot size 4,200 sq ft — minimum for DADU in Portland is 5,000 sq ft" |
| Hiding data provenance (where did this number come from?) | Users can't calibrate trust in the output | Every auto-pulled data point should show its source and pull date on hover or in a "data sources" section |
| Upgrade wall appearing before the user has seen any product value | Conversion rates near zero | Demo path: show a complete example analysis before asking for payment |
| No indication of what happens when data pull fails | Users see empty fields and assume the product doesn't support their address | Explicit "we couldn't pull data for this address — enter manually below" with a fallback form |
| Analysis results without export/share | Investors need to share analyses with partners, lenders, wholesalers | Even a basic "copy link" or PDF export increases perceived value significantly for the target user |

---

## "Looks Done But Isn't" Checklist

- [ ] **DADU Feasibility:** Result appears to render, but check — does it show which specific constraints were evaluated? Are rules sourced from the database (not hardcoded)? Does it show a `last_verified` date?
- [ ] **Automated Data Pull:** Address lookup returns a result — but does it handle: address not found, county API timeout, geocode ambiguity, partial data (some fields returned, others missing)?
- [ ] **Freemium Gate:** Paid features hidden in UI for free users — but are the underlying API routes also protected server-side? Test by calling the API directly without a paid session.
- [ ] **Subscription Billing:** Stripe webhook received for payment — but is subscription status persisted to the database? Is it re-checked on each paid API request, not just at login?
- [ ] **Multi-Market Support:** Second market "added" — but are all zoning rules, API endpoints, and field mappings in configuration/database? Is any market assumption still hardcoded?
- [ ] **Rent Estimates:** Rentcast returns a number — but what happens when Rentcast has no data for the address? Is there a fallback UI and a manual-entry path?
- [ ] **API Cost Metering:** Billing is live — but is every live API call logged to the usage table? Is there an alert when costs exceed expected thresholds?
- [ ] **Address Geocoding:** Geocoder returns coordinates — but does it correctly identify the governing municipality (not just city name) for jurisdiction-specific zoning rule lookup?

---

## Recovery Strategies

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| County API reliability — no fallback built | MEDIUM | Add retry + timeout layer to API client; add graceful degradation UI; no schema changes needed |
| DADU rules hardcoded in app logic | HIGH | Extract rules to database table; rewrite feasibility engine to read from DB; requires schema migration and logic rewrite |
| Single-tenant data model (no market_id) | HIGH | Schema migration across all property/parcel tables; data backfill for existing records; risk of breaking existing queries |
| API costs unmetered — blowout discovered | MEDIUM-HIGH | Emergency: disable live lookups until metering is built; build usage tracking table; may require partial refunds if overcharging |
| Wrong DADU feasibility results shipped | HIGH | Issue correction notices to affected users; add freshness/disclaimer UI immediately; audit all past results for affected municipalities; possible trust damage that cannot be fully recovered |
| Freemium gate server-side bypass discovered | MEDIUM | Audit all API routes; add server-side auth checks; rotate any API keys that may have been exposed |

---

## Pitfall-to-Phase Mapping

| Pitfall | Prevention Phase | Verification |
|---------|------------------|--------------|
| Public records API reliability (no fallback) | Data pipeline phase — before paid tier launch | All API calls have timeout, retry, and graceful degradation to manual entry; test by mocking API failures |
| DADU rules in app logic | Data strategy phase — before DADU engine built | No municipality-specific constants in TypeScript files; feasibility engine reads from database/config |
| Single-tenant data model | Data pipeline architecture phase — first market integration | Every market-specific table has a `market_id` or equivalent; adding a second market requires only config/data, not schema changes |
| Free tier delivers no value | Freemium gating phase — designed alongside paywall | Free user can experience a complete sample analysis without paying |
| Part-time founder scope creep | Every phase — execution discipline | Each phase has a defined, shippable artifact; no phase exceeds 6-8 weeks of part-time build |
| API cost blowout | Auth and billing phase — before any live API call is enabled | Usage tracking table exists; every live API call writes a record; free users cannot trigger paid lookups server-side |
| Wrong DADU feasibility answers | DADU feasibility engine phase | Every result shows rule source, `last_verified` date, and a "report inaccuracy" path |
| Address geocoding jurisdiction error | Data pipeline phase — geocoding layer | Geocoder output resolves to governing municipality (not city string); test with addresses in overlapping jurisdictions (e.g., unincorporated Multnomah County vs City of Portland) |

---

## Sources

- Project context: `/Users/sticky_iqqy_iqqy/real-estate-ai/.planning/PROJECT.md`
- Prototype codebase review: `/Users/sticky_iqqy_iqqy/real-estate-ai/.planning/codebase/CONCERNS.md`, `ARCHITECTURE.md`, `INTEGRATIONS.md`
- Domain knowledge: PropTech SaaS failure patterns, county assessor API behavior (ESRI ArcGIS REST, WA/OR county GIS systems), ADU/DADU rule history (Portland HB 2001 implementation, Seattle DADU ordinance changes), freemium conversion literature, part-time founder execution patterns
- Confidence note: WebSearch and Brave Search unavailable during this research session. Findings reflect training data (cutoff August 2025) and project-specific context. Specific API documentation (Rentcast pricing tiers, county API rate limits) should be verified against current official sources before implementation.

---
*Pitfalls research for: Real estate investment analysis SaaS (Pacific NW pilot)*
*Researched: 2026-03-25*
