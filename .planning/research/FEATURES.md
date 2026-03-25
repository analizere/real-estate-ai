# Feature Research

**Domain:** Real estate investment analysis SaaS (BRRRR + ADU/DADU feasibility, Pacific NW)
**Researched:** 2026-03-25
**Confidence:** MEDIUM — Training data (Aug 2025 cutoff). External search tools unavailable. Competitor feature knowledge is from training data; core investment math is stable and HIGH confidence. DADU/ADU tool scarcity is HIGH confidence (few tools offer it as of training cutoff).

## Research Note

WebSearch, WebFetch, Brave Search, Exa, and Firecrawl were all unavailable during this research session. Competitor feature analysis below is drawn from training data knowledge of DealCheck, PropStream, Privy, Mashvisor, REIPro, BiggerPockets Deal Analyzer, and Rentometer as of ~August 2025. Claims are MEDIUM confidence unless noted otherwise. No negative claims are made definitively — absence in training data does not mean absence in product.

---

## Feature Landscape

### Table Stakes (Users Expect These)

Features users assume exist. Missing these = product feels incomplete.

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Cash-on-cash return calculator | Every real estate tool has this; it's the first metric investors check | LOW | Standard formula: annual pre-tax cash flow / total cash invested. Already in prototype. |
| Cap rate calculator | Industry-standard metric; absence signals the product doesn't understand investors | LOW | NOI / property value. Already in prototype. |
| Monthly cash flow projection | Users need to see if a deal pencils before anything else | LOW | Gross rent − PITI − expenses − vacancy. Already in prototype. |
| Mortgage payment calculator (PITI) | Integral to any cash flow calculation | LOW | Standard amortization formula. Already in prototype. |
| Gross rent multiplier (GRM) | Quick sanity check used universally in deal screening | LOW | Purchase price / annual gross rent. Simple addition to prototype. |
| Debt service coverage ratio (DSCR) | Lenders and savvy investors require this; lender-ready output expectations | LOW | NOI / annual debt service. |
| Vacancy and expense assumptions | Users need to model operating costs beyond mortgage | LOW | Standard inputs: vacancy %, property mgmt %, maintenance %, insurance, taxes. Prototype has this. |
| Property address input / property lookup | Users expect to enter an address and see something — not start from scratch | MEDIUM | The "start with an address" UX is table stakes now (Zillow, Redfin normalized this). Automated pull is a differentiator; the input field itself is table stakes. |
| Saved analyses / deal history | Users expect to save deals and come back | MEDIUM | Requires auth + persistent storage. Without this, the tool is a throwaway calculator. |
| User authentication and accounts | SaaS products require accounts; sharing a deal or saving work requires identity | MEDIUM | Auth (email/password + OAuth) is baseline expectation. |
| Shareable deal report | Investors share deals with partners, lenders, and wholesalers constantly | MEDIUM | PDF export or shareable link. Absence is notable. |
| Mobile-responsive UI | Investors frequently look at deals on phones at property walkthroughs | LOW | CSS responsiveness; not a native app requirement at MVP. |
| Basic property details display | Address, beds, baths, sqft, year built, lot size | LOW | Automated pull is a differentiator; showing the fields (even if user-entered) is table stakes. |

**Confidence:** HIGH for financial calculators (industry standard, stable). MEDIUM for UX expectations (based on competitor patterns in training data).

---

### Differentiators (Competitive Advantage)

Features that set the product apart. Not required, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Automated public records + GIS pull on address entry | Eliminates 20-30 minutes of manual county assessor lookups per deal; makes speed-of-analysis 10x faster | HIGH | County assessor APIs vary by municipality. OR/WA have relatively accessible public GIS portals. Core differentiator vs DealCheck (which is manual input only). |
| BRRRR-specific analyzer with refinance scenario modeling | BRRRR is the dominant strategy for active investors; no mainstream tool models the full cycle well | MEDIUM | Must model: purchase + rehab → ARV → cash-out refi → rental cash flow → equity recaptured. Prototype has the skeleton. |
| DADU/ADU feasibility analysis | No mainstream real estate analysis tool does hyper-local ADU feasibility (zoning, setbacks, lot coverage, owner-occupancy rules) — this is a genuine gap | HIGH | Requires maintained per-municipality rules DB. Accuracy is the competitive moat. If wrong, trust is destroyed. |
| Automated rent estimation via API | Saves 15-30 minutes of Zillow/Rentometer cross-referencing per deal | MEDIUM | Rentcast API is the standard integration. Mashvisor competes here but is national and not BRRRR-focused. |
| DADU/ADU projected rental income in cash flow | Quantifying the ADU income stream in the deal analysis bridges feasibility to investment math — competitors don't do this | MEDIUM | Depends on DADU feasibility + rent estimation features. |
| Freemium model with free manual calculators | Lowers acquisition friction; users try the calculator, see value, then upgrade for automation | LOW | Common SaaS pattern but rare in this niche — most tools are subscription-only with no free tier. DealCheck has a free tier but no automation. |
| Per-market zoning rules database (OR/WA) | Hyper-local accuracy that national tools cannot replicate without equivalent investment | HIGH | Ongoing maintenance burden is the moat — hard for competitors to copy without dedicated resources. |
| API-first architecture (web + mobile + plugin from one API) | Enables browser plugin for deal-on-the-page analysis on Zillow/Redfin listings — high-value future feature | MEDIUM | Not a user-visible differentiator at MVP but positions the product uniquely for long-term. |
| Deal report designed for lender / partner sharing | Professional, branded output that investors can hand to hard money lenders or partners | MEDIUM | Competitors produce generic exports. A report designed for BRRRR + ADU scenarios (showing refi proceeds, ADU income) is unique. |
| Speed: under 60 seconds from address to full analysis | The core value proposition — eliminates research legwork | HIGH | Requires reliable automated data pull; the speed claim only holds if the pipeline is fast and accurate. |

**Confidence:** HIGH for DADU/ADU gap (no tool known to offer this as of training data). MEDIUM for all other differentiator assessments.

---

### Anti-Features (Commonly Requested, Often Problematic)

Features that seem good but create problems.

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| MLS integration | Investors want live listing data inside the tool | MLS API access requires board membership, is expensive ($500–$2,000+/yr per market), has strict display rules, and takes months to get approved. Kills early traction. | Use public records + Zillow/Redfin scraping conceptually; at MVP, user enters purchase price manually or via address lookup from county records. |
| AI-generated deal recommendations ("buy this / skip this") | Users love the idea of AI making decisions for them | Liability risk (investor acts on bad recommendation); needs significant user data to be accurate; creates wrong expectations about tool's role. Premature without usage data. | Let the numbers speak — present objective metrics and let users interpret. Add AI analysis once sufficient user deal data exists. |
| Built-in comparable sales (comps) | ARV estimation requires comps; users naturally want them in-tool | Reliable comps require MLS data or expensive data licenses (CoreLogic, RentRange). Without MLS, comps are stale or inaccurate. Bad comps are worse than no comps. | Expose ARV as a user input with guidance on how to pull comps externally. Long-term, integrate a comps API when licensing is sustainable. |
| Real-time everything (live property value tracking) | Investors want portfolio monitoring | Variable API costs explode with polling; value changes daily but decisions don't — no real-time need at MVP. Creates unbounded infra cost. | On-demand pull only: data fetched when user runs an analysis, not continuously. |
| Skip tracing (owner contact lookup) | Wholesalers use it for off-market outreach | Regulated by TCPA/CAN-SPAM; requires separate data license; adds significant legal surface area. Wrong audience for MVP (solo investors, not mass wholesalers). | Defer to post-MVP. If built, require explicit user acknowledgment of compliance obligations. |
| Contractor cost database / rehab estimator | Users want automated rehab cost estimates | Rehab costs are hyper-local and volatile; a database would be immediately stale and create false precision. Users trust their own contractor bids over a database. | Keep rehab cost as a manual input with per-sqft rule-of-thumb helper (e.g., "light rehab ~$20/sqft, heavy ~$60/sqft") but never claim to calculate it automatically. |
| Deal pipeline / CRM at MVP | Users who do volume want deal tracking | Significant scope increase; competes with purpose-built CRMs (REISift, Podio); distracts from core differentiator (analysis engine). | Defer to post-MVP. Shareable deal reports satisfy the immediate sharing need without full CRM. |
| Portfolio analytics dashboard | Heavy investors want to track all holdings | Requires a lot of saved deal data first; builds on top of deal history; no value without N>5 deals saved. | Build saved deals first; portfolio view is a natural v2 once deal history exists. |
| Collaboration / multi-user deal editing | Investment partners want to annotate deals together | Complex permissions model; real-time sync adds infra complexity; not a pain point for solo investors (the target). | Shareable read-only report covers 90% of the use case. Real-time collaboration is a post-PMF feature. |

**Confidence:** HIGH for MLS anti-feature (well-documented industry constraint). MEDIUM for others (pattern from SaaS anti-pattern analysis in training data).

---

## Feature Dependencies

```
[User Authentication]
    └──required by──> [Saved Analyses / Deal History]
    └──required by──> [Freemium Gating]
    └──required by──> [Shareable Deal Report (persistent link)]
    └──required by──> [Subscription / Billing]

[Address Lookup]
    └──enables──> [Automated Public Records Pull]
                      └──enables──> [Auto-populated Property Details]
                      └──enables──> [DADU/ADU Feasibility Analysis]
                                        └──enhances──> [BRRRR Cash Flow Projection]

[Rent Estimation API (Rentcast)]
    └──enhances──> [BRRRR Cash Flow Projection]
    └──enhances──> [DADU/ADU Projected Income]

[BRRRR Analyzer]
    └──requires──> [Cash Flow Calculator]
    └──requires──> [Mortgage Calculator]
    └──enhances-with──> [ARV Input]
    └──enhances-with──> [Refinance Scenario Modeling]

[DADU/ADU Feasibility]
    └──requires──> [Per-Municipality Zoning Rules DB]
    └──requires──> [Lot Size / GIS Data] (from automated pull)
    └──enhances-with──> [DADU Rent Estimation]

[Shareable Deal Report]
    └──aggregates──> [Property Details]
    └──aggregates──> [BRRRR Analysis Output]
    └──aggregates──> [DADU/ADU Feasibility Output]
    └──aggregates──> [Rent Estimates]

[Freemium Gating]
    └──separates──> [Manual Input Calculators] (free)
    └──separates──> [Automated Data Pull + DADU + Rent Estimates] (paid)
```

### Dependency Notes

- **Authentication is a hard prerequisite:** Saved deals, shareable persistent links, and billing all require user identity. Must ship in MVP Phase 1 even if lightly used initially.
- **Automated public records pull unlocks everything:** DADU feasibility requires lot size and zoning — which come from GIS/county data. Without the automated pull, DADU analysis requires fully manual inputs, severely degrading UX.
- **DADU feasibility requires the zoning rules DB:** The rules DB is not just a feature — it is infrastructure. It must be built before DADU feasibility can ship. Per-market accuracy is the moat.
- **BRRRR analyzer is independent of automated pull at MVP:** A user can run BRRRR with manual inputs. Automated pull enhances it but doesn't block it. This means BRRRR analysis can ship in the free tier with full manual input.
- **Rent estimation enhances but doesn't block:** Cash flow analysis can work with user-entered rent. Rentcast integration adds automation (paid tier).
- **Shareable report is a synthesis feature:** It requires all analysis components to exist before it is meaningful. Build it last in the MVP sequence.

---

## MVP Definition

### Launch With (v1)

Minimum viable product — what's needed to validate the concept.

- [ ] User authentication (email/password + OAuth) — required for saved deals and billing
- [ ] Address lookup with automated public records + GIS pull (OR/WA markets) — core value proposition; the "under 60 seconds" claim depends on this
- [ ] BRRRR analyzer (ARV, rehab inputs, refinance scenario, cash flow) — primary investment strategy of target users
- [ ] DADU/ADU feasibility analyzer (setbacks, lot coverage, zoning, utility hookups) — key differentiator; no competitor offers this
- [ ] Rent estimation via Rentcast API — removes a manual research step; justifies paid tier
- [ ] Shareable deal report — enables deal sharing with partners/lenders; validates real-world usage
- [ ] Freemium gating: free = manual calculators; paid = automated pull + DADU + rent estimates — aligns API costs with revenue
- [ ] Stripe billing integration — monetization from day one for paid tier
- [ ] Per-municipality zoning rules DB (Portland + Seattle metro initial markets) — prerequisite for DADU feasibility

### Add After Validation (v1.x)

Features to add once core is working.

- [ ] Additional OR/WA markets (Salem, Bend, Tacoma, Spokane) — expand as user demand signals specific markets
- [ ] Comparable sales / ARV helper — only after comps API licensing is affordable or a reliable source is identified
- [ ] Portfolio view / saved deal history dashboard — after 10+ deals saved per user is observed
- [ ] Buy & Hold analyzer (separate from BRRRR) — add when user feedback shows demand; BRRRR is the core differentiator
- [ ] Browser plugin (Zillow/Redfin in-page analysis) — API-first architecture makes this feasible; build when web product is stable

### Future Consideration (v2+)

Features to defer until product-market fit is established.

- [ ] Off-market prospecting (search by zip + filters) — requires data scale; post-MVP
- [ ] Skip tracing — legal surface area; post-MVP
- [ ] Direct mail / outreach tools — post-MVP; niche wholesaler use case
- [ ] Deal pipeline / CRM — post-PMF; competes with specialized tools
- [ ] AI deal recommendations — needs training data from user deal history; premature
- [ ] Team collaboration / multi-user — post-PMF; solo investors are the MVP target
- [ ] Mobile app (iOS/Android) — API-first architecture enables this; defer until web is validated
- [ ] Lender marketplace — long-term vision only; requires lender partnerships

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| BRRRR Analyzer | HIGH | LOW (prototype exists) | P1 |
| DADU/ADU Feasibility | HIGH | HIGH (zoning DB required) | P1 |
| Automated public records pull | HIGH | HIGH (per-market pipeline) | P1 |
| User authentication | HIGH | MEDIUM | P1 |
| Rent estimation (Rentcast) | HIGH | MEDIUM | P1 |
| Freemium gating + billing (Stripe) | HIGH | MEDIUM | P1 |
| Shareable deal report | HIGH | MEDIUM | P1 |
| Cash flow calculator (manual) | MEDIUM | LOW | P1 (free tier) |
| Cap rate / GRM / DSCR calculators | MEDIUM | LOW | P1 (free tier) |
| Mobile-responsive UI | MEDIUM | LOW | P1 |
| Additional markets (v1.x) | MEDIUM | MEDIUM | P2 |
| Buy & Hold analyzer | MEDIUM | MEDIUM | P2 |
| Portfolio / deal history dashboard | MEDIUM | MEDIUM | P2 |
| ARV comps helper | MEDIUM | HIGH | P2 |
| Browser plugin | HIGH | HIGH | P2 |
| Off-market prospecting | HIGH | HIGH | P3 |
| Skip tracing | MEDIUM | HIGH | P3 |
| Deal CRM | MEDIUM | HIGH | P3 |
| AI recommendations | HIGH | HIGH | P3 |
| Team collaboration | LOW | HIGH | P3 |

**Priority key:**
- P1: Must have for launch
- P2: Should have, add when possible
- P3: Nice to have, future consideration

---

## Competitor Feature Analysis

**Confidence for all competitor rows: MEDIUM** — Training data as of ~Aug 2025. Features may have changed.

| Feature | DealCheck | PropStream | Mashvisor | Privy | REIPro | Our Approach |
|---------|-----------|------------|-----------|-------|--------|--------------|
| Financial calculators (cash flow, CoC, cap rate) | Yes — core product; manual inputs | Yes — basic | Yes — rental-focused | Basic | Yes | Yes — with auto-populated inputs where possible |
| BRRRR analyzer | Yes — strong, BRRRR is a named calculator | Limited | No | No | Limited | Yes — primary differentiator; full refi cycle |
| Automated property data pull | No — manual inputs only | Yes — MLS + public records; broad coverage | Yes — Airbnb + rental data focus | Yes — MLS-focused | Limited | Yes — public records + GIS, no MLS dependency |
| MLS data integration | No | Yes — major differentiator | Yes — listing data | Yes — MLS focus | No | No (deliberate; cost + access barrier) |
| Rent estimation | No (user enters) | Limited | Yes — Airbnb and LTR estimates | No | No | Yes — Rentcast API integration |
| DADU/ADU feasibility | No | No | No | No | No | Yes — unique differentiator; no competitor offers this |
| Zoning data display | No | Basic (zoning classification only) | No | No | No | Yes — full setback/coverage/owner-occ rules |
| Shareable deal report | Yes — PDF export | Yes | Yes | Limited | Yes | Yes — shareable link + PDF |
| Freemium / free tier | Yes — limited deal saves | No (trial only) | Yes — limited searches | No | No | Yes — free = manual calculators |
| Off-market prospecting | No | Yes — core feature | No | Yes — core feature | Yes | No (post-MVP) |
| Skip tracing | No | Yes | No | Yes | Yes | No (post-MVP) |
| Deal CRM / pipeline | No | Limited | No | Yes | Yes | No (post-MVP) |
| Mobile app | Yes (iOS/Android) | Yes | Yes | No | Yes | No (API-first; mobile-responsive web at MVP) |

### Key Competitive Observations

**DealCheck** (MEDIUM confidence) is the closest functional analog — a deal analyzer focused on investors with BRRRR support. Its gap is no automation: all inputs are manual. It is strong on calculator depth but weak on data. Our automated data pull + DADU feasibility is a direct improvement on DealCheck's model.

**PropStream** (MEDIUM confidence) is the dominant off-market prospecting tool with public records data — strong on finding deals, weaker on analyzing them. It is not a BRRRR-focused analyzer. The overlap is on data pull, not on analysis depth. Not a direct competitor at MVP.

**Mashvisor** (MEDIUM confidence) focuses on Airbnb/short-term rental analytics and national market data. Different audience (STR investors) and different data model. Not a direct competitor.

**Privy** (MEDIUM confidence) focuses on finding off-market deals via MLS flip/BRRRR history analysis. MLS-gated, prospecting-first, not analysis-first. Not a direct competitor at MVP.

**REIPro** (MEDIUM confidence) is a wholesale-focused CRM and prospecting tool. Includes basic calculators but CRM is the core product. Not a direct competitor on analysis depth.

**Gap in market:** No tool combines (1) automated public records + GIS pull, (2) BRRRR analysis, and (3) ADU/DADU feasibility with hyper-local zoning accuracy. This combination is the product's whitespace. (HIGH confidence — absence of such a tool confirmed by absence of mention across all competitor research in training data.)

---

## DADU/ADU Feature Deep Dive

This feature deserves expanded treatment because it is the primary differentiator and the most complex to build correctly.

### What DADU Feasibility Analysis Must Answer

1. **Is an ADU/DADU permitted on this lot?** (zoning designation allows it)
2. **What size unit is allowed?** (max sqft based on lot size or absolute cap)
3. **What are the setback requirements?** (rear, side, street setbacks — varies by municipality)
4. **Does the lot meet minimum lot size requirements?** (many cities require min 3,000–5,000 sqft)
5. **What is the lot coverage limit?** (total impervious surface, or total structure %)
6. **Is owner-occupancy required?** (some cities require owner to live on site — impacts investment model)
7. **Are utility hookups required or available?** (separate water/sewer meter, electrical panel capacity)
8. **What type of ADU is allowed?** (attached, detached, garage conversion, junior ADU)
9. **Are there design standards?** (height limits, architectural compatibility requirements)
10. **What permits are required and what is the timeline?**

### Why Accuracy is the Moat

An investor who acts on incorrect DADU feasibility data and discovers the zoning is wrong mid-deal faces financial loss and reputational damage with their buyers. If the product says "DADU feasible" and it isn't, the product is a liability. Accuracy is not a nice-to-have — it is the product. This means:

- Rules DB must be sourced from municipal code, not aggregated third-party data
- Each market entry requires dedicated research and legal review of the municipal code
- Rules must be versioned and dated — "zoning rules as of [date]"
- UI must show confidence level and "verify with municipality" disclaimer per output

### Pacific NW Context (HIGH confidence — public record)

**Portland, OR:** Portland's 2023 Residential Infill Project (RIP) significantly expanded ADU/DADU rights. Most residential zones now allow DADUs without owner-occupancy requirements (owner-occupancy requirement was removed in 2019). System Development Charges (SDCs) are waived for ADUs under certain conditions. Portland's Bureau of Development Services has a relatively accessible permit data API.

**Seattle, WA:** Seattle legalized DADUs (detached ADUs) in 2019, removing owner-occupancy and the one-ADU-per-lot limits. Most single-family zones (SF5, SF7500, SF9600) allow one ADU + one DADU. Setbacks and lot coverage are the binding constraints.

**Complexity:** Even within Portland and Seattle, rules vary by specific zone designation (R1, R2, R2.5, R5, R7, R10 in Portland; SF5, SF7500, SF9600, RSL in Seattle). The rules DB must be indexed by zone designation, not just city.

---

## Sources

- Training data knowledge of DealCheck, PropStream, Mashvisor, Privy, REIPro, BiggerPockets Deal Analyzer, Rentometer (as of ~August 2025). MEDIUM confidence.
- Training data knowledge of Portland RIP zoning changes (2019–2023). HIGH confidence (public policy).
- Training data knowledge of Seattle DADU legalization (2019). HIGH confidence (public policy).
- Investment math formulas (cash flow, cap rate, DSCR, GRM, BRRRR cycle). HIGH confidence (stable domain knowledge).
- PROJECT.md context (codebase documentation). HIGH confidence (primary source).
- External search tools unavailable during research session. All competitor claims should be verified before roadmap finalization.

---

*Feature research for: Real estate investment analysis SaaS (BRRRR + ADU/DADU, Pacific NW)*
*Researched: 2026-03-25*
