# Competitive Landscape Analysis

**Domain:** Real estate investment analysis SaaS (BRRRR + ADU/DADU feasibility, Pacific NW)
**Researched:** 2026-03-25
**Overall Confidence:** MEDIUM — All competitor data sourced from training data (knowledge cutoff August 2025). WebSearch and WebFetch were both unavailable during this research session. Pricing and feature sets change frequently; every claim below should be independently verified before roadmap decisions that depend on specific competitor gaps. Absence of a feature in training data does not mean it was never added; it means it was not present or widely documented as of ~August 2025.

---

## Research Constraints

Both WebSearch and WebFetch were permission-denied during this session. This analysis is constructed entirely from training data. The following consequences apply:

- Pricing figures are approximate and may be stale
- Feature additions post-August 2025 are not reflected
- Any "they don't have X" claim carries LOW-to-MEDIUM confidence; treat as hypothesis, not fact
- Verification sources are listed under each competitor so the founder can spot-check directly

---

## Competitor Profiles

### 1. DealCheck

**Website:** dealcheck.io
**Confidence:** MEDIUM — well-documented tool; core feature set is stable but pricing may have changed

#### Core Value Proposition
Mobile-first deal analyzer for real estate investors. Covers rental property, fix-and-flip, BRRRR, and commercial deals. Positioned as "the calculator you carry with you." Appeals to solo investors who want clean financial modeling without a spreadsheet.

#### Target User
Solo investors and small landlords. Not aimed at wholesalers or off-market prospectors. Finance-first, not data-first.

#### Feature Set

| Feature | Status | Notes |
|---------|--------|-------|
| Cash flow calculator | Yes | Core product; rental property analysis |
| Cap rate / CoC / GRM calculators | Yes | Full suite of investor metrics |
| BRRRR analyzer | Yes | Named as a specific calculator type; covers ARV, rehab, refi, rental |
| Fix-and-flip analyzer | Yes | Profit, ROI, holding costs |
| Commercial deal analyzer | Yes | Multi-family, mixed-use |
| Automated property data pull | No | All inputs are manual; user enters everything |
| MLS integration | No | Manual inputs only |
| Rent estimation (automated) | No | User enters rent; no API integration |
| ADU/DADU feasibility | No | No zoning analysis of any kind |
| Zoning data | No | Not part of the product |
| Off-market prospecting | No | Pure analyzer, no lead generation |
| Skip tracing | No | Not part of the product |
| Deal CRM / pipeline | No | Not part of the product |
| Shareable deal report | Yes | PDF export; shareable link (paid) |
| Saved deals / deal history | Yes | Limited on free tier; unlimited on paid |
| Mobile app (iOS/Android) | Yes | Strong mobile UX; this is a differentiator for DealCheck |
| Freemium / free tier | Yes | Free tier: ~3 saved deals; limited exports |
| Comparable analysis (comps) | Limited | User can input comparable data manually; no auto-pull |
| ARV estimation | Input only | User enters ARV; no automated estimation |

#### Pricing (MEDIUM confidence — may be stale)

| Tier | Price | Notes |
|------|-------|-------|
| Free | $0 | ~3 saved deals, limited features |
| Plus | ~$10/month | More saved deals, PDF exports |
| Pro | ~$20/month | Unlimited deals, all features, team sharing |
| Team/Business | Higher | Multi-user accounts |

DealCheck is the most affordable dedicated investment calculator in the market.

#### Key Weaknesses / Gaps

- **No automated data.** Every single field is manual. An investor analyzing 20 deals/week spends significant time entering data that is publicly available.
- **No DADU/ADU awareness.** BRRRR analysis exists but never accounts for ADU income potential.
- **No rent data.** Users must research market rent separately and enter it manually.
- **Mobile-first UX constrains depth.** The mobile-first approach means desktop power features are limited.
- **Calculator, not an intelligence tool.** DealCheck tells you if a deal pencils; it does not help you find or understand the property.

#### Differentiation Against This Platform

DealCheck is the most comparable product on analysis depth — but it is a dumb calculator: the user does all the research, the tool just runs the math. This platform's core attack on DealCheck is **"same calculation depth, but the research is done for you."** Specific differentiators:
- Automated public records + GIS pull eliminates the manual data entry DealCheck requires
- DADU/ADU feasibility is a complete feature category DealCheck does not have
- Automated rent estimation removes a manual lookup step DealCheck ignores
- BRRRR analysis that integrates ADU income into post-rehab cash flow — DealCheck does not model this

**Moat assessment:** DealCheck's moat is mobile UX polish and brand recognition. Those are real but not structural — they do not prevent this platform from winning on feature depth for investors who primarily work at a desk.

---

### 2. PropStream

**Website:** propstream.com
**Confidence:** MEDIUM — PropStream is heavily documented in investor communities; core capabilities are well-known

#### Core Value Proposition
The leading off-market prospecting and property data platform for real estate investors. Over 155 million property records. Primary use case: find motivated sellers before they list. Secondary use case: research a specific address.

#### Target User
Active wholesalers, fix-and-flip investors doing volume, and investors doing off-market outreach. Not solo buy-and-hold investors who analyze one deal at a time.

#### Feature Set

| Feature | Status | Notes |
|---------|--------|-------|
| Property records database (155M+) | Yes | Core product; nationwide |
| Automated property data pull | Yes | Address lookup populates property details |
| MLS integration | Yes | Sold comps, active listings where available |
| Owner contact information | Yes | Skip tracing add-on |
| Skip tracing | Yes (add-on) | Per-skip pricing |
| Off-market prospecting (list building) | Yes | Filter by equity, liens, absentee, pre-foreclosure, etc. |
| Direct mail tools | Yes | Built-in postcard/mailer system |
| Deal CRM / pipeline | Limited | Basic tracking; not a full CRM |
| Financial calculators | Limited | Basic deal analysis; not the core product |
| BRRRR analyzer | No | Not a named calculator or workflow |
| Cash flow projections | Limited | Basic; not investor-grade |
| Rent estimation | Limited | Some rental data but not Rentcast-quality |
| ADU/DADU feasibility | No | No zoning or ADU analysis |
| Zoning data | Basic | Zoning classification may display; no rule-level detail |
| Comps / ARV estimation | Yes | Sold comps from MLS + public records |
| Mobile app | Yes | Mobile access available |
| Freemium / free tier | No | Paid subscription only; trial available |

#### Pricing (MEDIUM confidence — may be stale)

| Tier | Price | Notes |
|------|-------|-------|
| Base | ~$99/month | Property data, list building, basic features |
| Add-ons | +$30–$100+/month | Skip tracing credits, team members, MLS access |

PropStream is significantly more expensive than calculator tools. The price reflects data access, not analysis depth.

#### Key Weaknesses / Gaps

- **Weak deal analysis.** PropStream helps you find deals; it does not help you analyze them with investor-grade depth. BRRRR modeling does not exist.
- **No ADU awareness.** No zoning detail, no ADU feasibility, no ADU income modeling.
- **Price.** $99+/month is a barrier for solo investors analyzing occasional deals.
- **Overkill for analysis-only users.** If you are not doing off-market prospecting, you are paying for capabilities you do not use.
- **Not a calculator tool.** Community consensus is that investors use PropStream to find leads, then use a separate tool (DealCheck, spreadsheet) to analyze them.

#### Differentiation Against This Platform

PropStream is not a direct competitor at MVP — it is a prospecting tool, not an analysis tool. This platform is an analysis tool first. The risk is in the long term: if this platform adds off-market prospecting, PropStream would become a competitor in a category where PropStream has a massive data moat (155M records, national coverage, years of data).

**Strategic implication:** Do not compete with PropStream on data breadth. Compete on analysis depth and hyper-local DADU accuracy. When off-market prospecting is added post-MVP, the pitch is "analysis-first prospecting" not "more records."

**Moat assessment:** PropStream's moat is enormous — data breadth, nationwide coverage, established wholesaler community, and direct mail integration. Do not underestimate it. The differentiation must be on depth of analysis per deal, not on the number of deals in the database.

---

### 3. BatchLeads

**Website:** batchleads.io
**Confidence:** MEDIUM — BatchLeads is well-known in wholesaler communities; core features documented

#### Core Value Proposition
Off-market lead generation, skip tracing, and direct mail for real estate wholesalers. Close competitor to PropStream in the prospecting category; often compared as "PropStream alternative."

#### Target User
Real estate wholesalers doing volume outreach. Bulk lead export, skip tracing, and SMS/direct mail campaigns. Not aimed at investors doing deal-by-deal analysis.

#### Feature Set

| Feature | Status | Notes |
|---------|--------|-------|
| Off-market list building | Yes | Core product |
| Skip tracing | Yes | Competitive pricing per skip |
| Direct mail | Yes | Postcard campaigns |
| SMS outreach | Yes | Text blasting to owner lists |
| Property data / records | Yes | County records, ownership data |
| Financial calculators | No | Not part of the product |
| BRRRR analyzer | No | Not part of the product |
| ADU/DADU feasibility | No | No zoning analysis |
| Rent estimation | No | Not part of the product |
| MLS comps | Limited | Some sold data access |
| Deal CRM / pipeline | Yes | Basic lead pipeline tracking |
| Mobile app | Yes | Mobile access |
| Freemium / free tier | No | Paid only; trial available |

#### Pricing (LOW confidence — BatchLeads pricing has changed frequently)

| Tier | Price | Notes |
|------|-------|-------|
| Starter | ~$50–$70/month | Limited skip traces, basic features |
| Pro | ~$100–$150/month | More skips, more lists, team features |
| Add-ons | Variable | Per-skip traces, mail credits |

#### Key Weaknesses / Gaps

- **Zero deal analysis.** BatchLeads is entirely prospecting and outreach. No financial modeling at all.
- **Wholesaler-only audience.** The product is designed for wholesalers doing outreach volume, not investors doing deal analysis.
- **No ADU/DADU awareness.**
- **Commodity tool.** Viewed as roughly interchangeable with PropStream, REIPro in the wholesaler community.

#### Differentiation Against This Platform

BatchLeads is not a direct competitor at MVP. No overlap on the analysis side whatsoever. Long-term, if this platform builds off-market prospecting, BatchLeads would become a competitor — but a weaker one than PropStream because BatchLeads' differentiator is bulk outreach, not property data depth.

**Strategic implication:** Ignore BatchLeads entirely for MVP. Note that the wholesaler market (BatchLeads' audience) is identified as a future target for this platform — the positioning when entering that market should emphasize analysis-first tools that make each lead more valuable, not bulk outreach.

---

### 4. REIPro

**Website:** reipro.com
**Confidence:** MEDIUM — documented in wholesaler community comparisons

#### Core Value Proposition
All-in-one platform for real estate wholesalers: CRM, deal tracking, direct mail, skip tracing, and basic property data. Aimed at newer and mid-level wholesalers who want one tool that does everything at a lower price than PropStream.

#### Target User
Entry-level to mid-level wholesalers. Not analysis-focused investors.

#### Feature Set

| Feature | Status | Notes |
|---------|--------|-------|
| CRM / deal pipeline | Yes | Core product; workflow management |
| Skip tracing | Yes | Included in plans |
| Direct mail | Yes | Postcard and letter templates |
| Property records | Yes | Public records data |
| Off-market list building | Yes | Filter-based list creation |
| Financial calculators | Limited | Basic ARV and deal analysis tools |
| BRRRR analyzer | No | Not a featured calculator |
| Cash flow projections | Limited | Basic |
| ADU/DADU feasibility | No | No zoning analysis |
| Rent estimation | No | Not available |
| MLS data | No | No MLS integration |
| Mobile app | Yes | Mobile access |
| Freemium / free tier | No | Paid only |

#### Pricing (LOW confidence — pricing may have changed)

| Tier | Price | Notes |
|------|-------|-------|
| Standard | ~$97–$109/month | CRM, skip tracing, basic tools |
| Professional | ~$149/month | More users, features |

#### Key Weaknesses / Gaps

- **CRM-first, calculator-last.** Financial analysis is a secondary feature, clearly tacked on. Not investor-grade.
- **No BRRRR depth.** The BRRRR strategy is not well-served.
- **No ADU/DADU awareness.**
- **Wholesaler-only market fit.** Solo buy-and-hold investors are not the target; the product shows it.

#### Differentiation Against This Platform

No meaningful overlap at MVP. REIPro serves a different user (active wholesaler managing a pipeline) rather than an investor who wants to deeply analyze a single deal. Future overlap if this platform adds CRM features post-MVP.

---

### 5. BiggerPockets (Calculators and Tools)

**Website:** biggerpockets.com
**Confidence:** MEDIUM — BiggerPockets is extensively documented; community and tools are well-known

#### Core Value Proposition
The largest real estate investor community and education platform, with deal analysis calculators as a tool within a broader media/community product. BiggerPockets is primarily a community and education play; the calculators are a tool for users, not the core business.

#### Target User
Newer and intermediate investors seeking education and community. The calculators serve members who are actively evaluating deals.

#### Feature Set

| Feature | Status | Notes |
|---------|--------|-------|
| Rental property calculator | Yes | Comprehensive cash flow analysis |
| Fix-and-flip calculator | Yes | Rehab cost, profit estimation |
| BRRRR calculator | Yes | Named calculator; full cycle |
| Wholesale calculator | Yes | Assignments and double-close |
| Mortgage calculator | Yes | PITI |
| Automated property data pull | No | Manual inputs; address lookup populates some basic data (from third-party integration, quality varies) |
| MLS integration | No | No live listing data |
| Rent estimation | No | User-entered |
| ADU/DADU feasibility | No | No zoning analysis of any kind |
| Off-market prospecting | No | Not a lead generation tool |
| Skip tracing | No | Not part of the product |
| Deal CRM | No | Not a CRM |
| Shareable deal report | Yes | PDF export for members |
| Mobile app | Yes | Mobile access for community features |
| Freemium / free tier | Partial | Some calculators available free; full features require membership |
| Community and forums | Yes | Core differentiator — largest investor community |
| Education (books, podcasts) | Yes | BP's primary revenue driver |

#### Pricing (MEDIUM confidence)

| Tier | Price | Notes |
|------|-------|-------|
| Free | $0 | Limited calculator use, community access |
| Pro | ~$32/month (or ~$390/year) | Full calculator access, reports, member perks |

#### Key Weaknesses / Gaps

- **Calculators are a side product.** BP's calculators are good but not the business's focus. They will not prioritize calculator depth the way a dedicated tool will.
- **No automation.** All inputs are manual. No data pull.
- **No ADU/DADU awareness.**
- **Generic BRRRR analysis.** Not tuned for Pacific NW market conditions.
- **Community lock-in cuts both ways.** BP's community is a moat for them — investors who learn BRRRR on BP stay on BP. But BP is not a tool people use for serious production-level deal analysis.

#### Differentiation Against This Platform

BiggerPockets' calculators are where many investors learn to analyze deals. That is actually useful: the target audience already knows how to use BRRRR calculators because they learned on BiggerPockets. This platform does not need to educate users on the metrics — it needs to be faster and smarter than the BiggerPockets calculator. The key differentiator is: automated data + ADU feasibility vs. BiggerPockets' manual-input BRRRR calculator.

**Strategic implication:** BP is not a startup competitor — it is a massive media company with calculators as a feature. Do not try to compete on community. Win on tool depth and automation. BiggerPockets users are a natural acquisition audience: they know the terminology, they trust BRRRR analysis, and they are frustrated that BP's calculators require manual data entry.

---

### 6. Mashvisor

**Website:** mashvisor.com
**Confidence:** MEDIUM — well-documented in real estate investment tool comparisons

#### Core Value Proposition
Rental property analytics platform focused on short-term rental (Airbnb/VRBO) performance data and market-level analytics. Helps investors identify high-performing STR markets and estimate rental income.

#### Target User
Short-term rental investors and market-level researchers. Not a BRRRR or fix-and-flip tool. Not aimed at the Pacific NW buy-and-hold investor who cares about ADU feasibility.

#### Feature Set

| Feature | Status | Notes |
|---------|--------|-------|
| Airbnb/STR rental income estimates | Yes | Core differentiator |
| Long-term rental estimates | Yes | LTR data per market |
| Neighborhood-level analytics | Yes | Market comparison by zip/neighborhood |
| Property search and filtering | Yes | Investment property discovery |
| Investment calculators | Yes | Cash-on-cash, cap rate, occupancy models |
| BRRRR analyzer | No | Not a named feature |
| Automated property data pull | Yes | Property-level data on search results |
| MLS integration | Partial | Some listing data integration |
| ADU/DADU feasibility | No | No zoning analysis |
| Off-market prospecting | No | Not a lead generation tool |
| Skip tracing | No | Not part of the product |
| Deal CRM | No | Not a CRM |
| Mobile app | Yes | Mobile app available |
| Freemium / free tier | Yes | Limited searches; full features on paid plan |

#### Pricing (MEDIUM confidence)

| Tier | Price | Notes |
|------|-------|-------|
| Starter | ~$17–$25/month | Limited properties/searches |
| Growth | ~$50–$75/month | More searches, market analytics |
| Pro/Investor | ~$100–$200/month | Full access |

#### Key Weaknesses / Gaps

- **STR-focused.** Long-term rental investors get some value, but STR is the core audience. BRRRR investors are not the target market.
- **No BRRRR modeling.**
- **No ADU/DADU awareness.**
- **Market-level, not deal-level.** Mashvisor is better for "where should I invest?" than "should I buy this specific property?"
- **National breadth over hyper-local depth.** Pacific NW ADU market nuances are invisible to Mashvisor.

#### Differentiation Against This Platform

Mashvisor and this platform have minimal overlap. Mashvisor serves a different investor profile (STR investors researching markets). The only shared territory is rent estimation — both pull rental income estimates. The difference: Mashvisor gives you market-level STR data; this platform gives you property-specific LTR rent estimates integrated into a BRRRR/ADU analysis workflow. Not a direct competitor.

---

### 7. Privy

**Website:** getprivy.com
**Confidence:** LOW-MEDIUM — Privy is smaller and less documented than PropStream/BatchLeads; training data knowledge is thinner

#### Core Value Proposition
Off-market deal discovery via MLS flip and BRRRR history analysis. Find properties where experienced investors have previously profited to identify neighborhoods and property types with strong investment history. MLS-powered prospecting tool.

#### Target User
Investors who want to find deals by following where experienced investors have already been successful. MLS-heavy; requires MLS data access to function.

#### Feature Set

| Feature | Status | Notes |
|---------|--------|-------|
| MLS-based deal discovery | Yes | Core product |
| BRRRR/flip history analysis by area | Yes | Core differentiator |
| Property records | Yes | Integrated with MLS data |
| Financial calculators | Limited | Basic deal analysis |
| BRRRR analyzer | No | Not a dedicated analyzer |
| Cash flow projections | Limited | Basic |
| ADU/DADU feasibility | No | No zoning analysis |
| Off-market prospecting | Yes | MLS-derived comps inform off-market targeting |
| Skip tracing | Yes | Available |
| Deal CRM | Yes | Basic pipeline management |
| Freemium / free tier | No | Paid only |

#### Pricing (LOW confidence)

Pricing was not reliably documented in training data. Estimated $100–$200/month range based on comparable tools in the space. Verify at getprivy.com.

#### Key Weaknesses / Gaps

- **MLS dependency.** Privy's differentiation is MLS data — which is both its strength and its constraint. Investors without MLS access cannot use it well.
- **Prospecting-first.** Analysis depth is limited.
- **No ADU/DADU awareness.**
- **Geography-constrained.** MLS coverage varies significantly by market; Pacific NW MLS data quality would need verification.

#### Differentiation Against This Platform

No overlap at MVP. Privy is a prospecting tool that uses MLS history as its data source. This platform uses public records + GIS and deliberately avoids MLS dependency.

---

### 8. REISift

**Website:** reisift.io
**Confidence:** LOW-MEDIUM — Smaller tool; thinner training data coverage

#### Core Value Proposition
Data-driven deal sourcing CRM with list stacking (overlay multiple motivated seller lists to find high-overlap prospects). Focused on wholesalers doing outbound campaigns.

#### Target User
Wholesalers doing sophisticated list management and outbound outreach. High-volume operations.

#### Feature Set

| Feature | Status | Notes |
|---------|--------|-------|
| CRM | Yes | Core product |
| List stacking / data deduplication | Yes | Key differentiator |
| Skip tracing | Yes | Integrated |
| Off-market prospecting | Yes | List import and filtering |
| Financial calculators | No | Not part of the product |
| ADU/DADU feasibility | No | No zoning analysis |

#### Key Weaknesses / Gaps

- **No deal analysis whatsoever.** CRM and list management only.
- **Wrong audience for this platform's MVP.**

#### Differentiation Against This Platform

Not a competitor at any phase. Different product category.

---

### 9. Roofstock

**Website:** roofstock.com
**Confidence:** MEDIUM — well-documented marketplace

#### Core Value Proposition
Marketplace for single-family rental investments. Buy and sell already-tenanted properties with due diligence packages. A turnkey investing platform, not an analysis tool.

#### Target User
Passive investors who want to buy cash-flowing rentals without doing renovation or property management. Opposite of the BRRRR investor who wants to force equity.

#### Key Weaknesses / Gaps (vs. this platform)

- **Marketplace, not analyzer.** Roofstock does not help you analyze arbitrary addresses — it only shows properties listed on its platform.
- **No BRRRR use case.** Properties are sold move-in ready; no rehab scenario.
- **No ADU/DADU.**

#### Differentiation Against This Platform

Not a competitor. Different product category and investor profile.

---

### 10. Rentometer / Rentcast

**Website:** rentometer.com / rentcast.io
**Confidence:** MEDIUM — both are established tools in the rent estimation space

#### Core Value Proposition
Point tools for rent estimation. Enter an address and get market rent estimates for that unit.

#### Target User
Landlords, property managers, and investors who need a quick rent estimate. Single-feature tools.

#### Feature Set

| Feature | Status | Notes |
|---------|--------|-------|
| Rent estimation by address | Yes | Core product for both |
| Market rent comparables | Yes | Comparable rent data |
| Financial calculators | No | Not part of either product |
| BRRRR analyzer | No | Not part of either product |
| ADU/DADU feasibility | No | No zoning analysis |
| API access | Rentcast: Yes | Rentcast offers an API — this is why Rentcast is the recommended integration source |

#### Differentiation Against This Platform

Not competitors — they are data sources. Rentcast in particular is better positioned as an **integration target** than a competitor. This platform's rent estimation feature is powered by Rentcast (or equivalent API), making Rentcast a dependency, not a threat.

**Strategic note:** If this platform builds rent estimation deeply enough — specifically ADU-unit rent estimation integrated with feasibility analysis — it becomes more useful in-context than navigating to Rentometer/Rentcast directly. This is incremental differentiation, not a moat.

---

## Competitive Comparison Matrix

**Confidence for all rows: MEDIUM** — training data, August 2025 cutoff. Verify before treating as authoritative.

| Feature | DealCheck | PropStream | BatchLeads | REIPro | BiggerPockets | Mashvisor | Privy | **This Platform (MVP)** |
|---------|-----------|------------|------------|--------|---------------|-----------|-------|------------------------|
| **BRRRR analyzer (dedicated)** | Yes | No | No | No | Yes | No | No | **Yes** |
| **ADU/DADU feasibility analysis** | No | No | No | No | No | No | No | **Yes** |
| **Zoning rule detail (setbacks, coverage)** | No | No | No | No | No | No | No | **Yes** |
| **Automated public records + GIS pull** | No | Yes | Yes | Partial | No | Yes | Yes | **Yes** |
| **Rent estimation (automated)** | No | Partial | No | No | No | Yes (STR) | No | **Yes (LTR, Rentcast)** |
| **ADU rent estimation** | No | No | No | No | No | No | No | **Yes** |
| **BRRRR + ADU cash flow combined** | No | No | No | No | No | No | No | **Yes** |
| **Free tier (calculators)** | Yes | No | No | No | Partial | Partial | No | **Yes** |
| **MLS integration** | No | Yes | No | No | No | Partial | Yes | No (deliberate) |
| **Off-market prospecting** | No | Yes | Yes | Yes | No | No | Yes | No (post-MVP) |
| **Skip tracing** | No | Yes | Yes | Yes | No | No | Yes | No (post-MVP) |
| **Direct mail** | No | Yes | Yes | Yes | No | No | No | No (post-MVP) |
| **Deal CRM / pipeline** | No | Limited | Yes | Yes | No | No | Yes | No (post-MVP) |
| **Mobile app (native)** | Yes | Yes | Yes | Yes | Yes | Yes | No | No (API-first, mobile-responsive web) |
| **Shareable deal report** | Yes | Yes | Limited | Yes | Yes | Yes | Limited | **Yes** |
| **Pacific NW market specificity** | No | No | No | No | No | No | No | **Yes (pilot)** |
| **Freemium gate: data behind paid** | Partial | No | No | No | Partial | Partial | No | **Yes** |
| **Price anchor (base paid tier)** | ~$10–20/mo | ~$99/mo | ~$50–150/mo | ~$97–149/mo | ~$32/mo | ~$17–200/mo | ~$100–200/mo | TBD |

---

## Unoccupied Whitespace Analysis

### The Core Gap: BRRRR + ADU + Automated Data in One Tool

No single tool today combines:

1. **BRRRR-specific financial modeling** (dedicated, investor-grade: full purchase → rehab → ARV → cash-out refi → rental cash flow cycle)
2. **ADU/DADU feasibility analysis** (hyper-local zoning rules: setbacks, lot coverage, owner-occupancy, utility requirements — by municipality and zone designation)
3. **Automated property data pull** (public records + GIS on address entry — not manual input)
4. **ADU rent estimation integrated into BRRRR cash flow** (model the ADU income stream as part of the deal analysis)
5. **Reasonable freemium entry point** (free calculators to reduce acquisition friction)

This is the whitespace. It is not a gap in one feature — it is a gap in a **workflow**: the end-to-end journey from "I have an address" to "here is the complete BRRRR + ADU investment picture." Every existing tool handles a fragment of this workflow and forces the investor to stitch together 3–5 tools to complete it.

### The Incumbent Moats to Respect

The following are real competitive advantages incumbents hold. Building against them requires honest assessment:

| Incumbent | Moat | Why It's Real | Implication |
|-----------|------|---------------|-------------|
| PropStream | 155M+ property records, nationwide data, off-market prospecting network | Years of data accumulation; wholesaler community lock-in | Do not compete on data breadth; compete on analysis depth per property |
| DealCheck | Mobile UX polish, BRRRR calculator brand recognition | Strong brand in mobile-first investor community | Compete on automation and ADU features, not on calculator UI polish |
| BiggerPockets | Investor community (largest in the US) | Community creates content, organic SEO, and word-of-mouth at scale | Use BP community as an acquisition channel, not a competitor |
| Mashvisor | STR data and market analytics | Deep Airbnb/VRBO data set built over years | This platform does not compete here; stay on LTR/BRRRR lane |
| BatchLeads | Skip tracing infrastructure and bulk SMS outreach | Pricing and data for outbound outreach at volume | Irrelevant until post-MVP prospecting phase |

### Features Where Incumbents Cannot Easily Catch Up

The most defensible whitespace is features that are expensive for incumbents to add — not just absent, but structurally hard for them to replicate:

**1. Hyper-local ADU/DADU feasibility (the primary moat)**
- Why hard for incumbents: Requires per-municipality zoning rules research, ongoing maintenance as rules change, and product prioritization from a team that has never focused on ADUs
- Why PropStream cannot easily add it: Their product team is focused on prospecting scale, not zoning law detail
- Why DealCheck cannot easily add it: They have no data layer; adding zoning rules would require building data infrastructure from scratch
- Why BiggerPockets cannot easily add it: Their calculators are a side product; ADU is a regional feature that does not justify national product investment
- **Advantage window:** 18-36 months before any large incumbent invests here — and only if this platform demonstrates market demand first

**2. Pacific NW market specificity**
- Why hard for incumbents: National tools are built for national use cases; Oregon and Washington ADU/DADU rules are unusually complex (Portland's Residential Infill Project, Seattle's 2019 DADU legalization)
- **Advantage window:** Permanent for deep market accuracy; incumbents will never invest in Portland municipal code granularity

**3. BRRRR + ADU combined cash flow modeling**
- Why hard for incumbents: Requires not just adding a feature but re-architecting the analysis flow to treat ADU income as a first-class variable in the BRRRR model
- PropStream would have to build a BRRRR calculator from scratch before they could integrate ADU income
- DealCheck's BRRRR calculator exists but ADU income as an input category is absent from the model
- **Advantage window:** Medium-term; DealCheck could add ADU income as an input field (it's not structurally hard); the differentiator is automated feasibility + auto-populated rent, not just the field

### Features Where Incumbents Have Clear Moats

Be honest about where this platform will be outgunned:

| Feature | Incumbent Moat | Honest Assessment |
|---------|---------------|-------------------|
| Off-market prospecting (lead lists by zip + filter) | PropStream, BatchLeads — years of data and customer workflows built around them | Do not try to match PropStream's data depth at MVP or even v2. If off-market is added post-MVP, the angle must be "analysis-enriched leads" not "more leads." |
| Skip tracing | BatchLeads, PropStream — commodity data infrastructure | Build as an add-on or API pass-through when added; do not build from scratch |
| Native mobile app | DealCheck, PropStream — polished apps in market | API-first architecture is the right call; mobile-responsive web is sufficient for launch. Native app is a post-PMF investment. |
| Investor community / education | BiggerPockets — 3M+ members, podcast, books | Never compete here. Use BP as an acquisition channel instead. |
| National comps / ARV data | PropStream, Mashvisor — licensed data at scale | Avoid. Use user-entered ARV with guidance. Comps API integration is viable at v1.x when licensing cost is sustainable. |

---

## Positioning Narrative

### The Problem This Platform Solves

A Pacific NW investor analyzing a BRRRR deal today uses 4–6 tools in sequence:

1. **County assessor website** — to look up ownership, lot size, zoning
2. **Portland BDS or Seattle DPD** — to check ADU rules for that zone
3. **Rentometer or Zillow** — to estimate market rent
4. **DealCheck or a spreadsheet** — to run the BRRRR numbers
5. **Google** — to verify ADU setback requirements, owner-occupancy rules, permit process
6. **Mental math or another spreadsheet** — to add ADU income into the cash flow model

This process takes 30–60 minutes per deal and produces inconsistent results because rules are complex, sources disagree, and the math is done in a different tool than the research.

**This platform collapses that workflow into one address lookup.**

### Who This Is For (Positioning Clarity)

| Audience | Fit | Why |
|----------|-----|-----|
| Solo investors, Pacific NW, BRRRR-focused | Primary — strong fit | This platform is built for this user |
| Small investment firms (2–5 person) | Good fit | Same workflow, multiplied across team |
| Wholesalers assessing deal quality | Secondary fit | BRRRR analysis helps them screen deals before assignment |
| Active wholesalers doing volume outbound | Poor fit (now) | They need PropStream/BatchLeads; this platform is not a prospecting tool at MVP |
| STR/Airbnb investors | Poor fit | Mashvisor is better; this platform doesn't serve STR analysis |
| National investors (not Pacific NW) | Poor fit (now) | ADU data is Pacific NW only at launch; calculators work nationally but automated data doesn't |

### Competitive Positioning Statement (Internal)

"DealCheck with automated data and ADU intelligence, for investors who want the full BRRRR + ADU picture in under 60 seconds — not a spreadsheet and five browser tabs."

---

## Roadmap Implications

### Features to Prioritize (Fill Confirmed Gaps)

1. **ADU/DADU feasibility analyzer** — The highest-confidence unoccupied whitespace. Build it right (per-municipality rules DB, versioned, disclaimer-forward) or do not build it at all. Accuracy is the product.
2. **Automated public records + GIS pull** — Eliminates the primary manual work that makes DealCheck (and BP calculators) slow. This is the feature that makes the 60-second claim credible.
3. **BRRRR + ADU cash flow integration** — Connecting ADU income as a first-class variable in the BRRRR model is a synthesis feature no competitor offers.
4. **Freemium calculator entry** — DealCheck has this; others do not. Reduces friction for acquisition.

### Features to Avoid or Defer (Incumbents Have Moats)

1. **Off-market lead lists** — Do not build until post-PMF. PropStream's data moat is too large to replicate. If added, frame as "analysis-enriched prospecting" not "more leads."
2. **Skip tracing** — Legal surface area + commodity infrastructure. Defer to post-MVP.
3. **MLS integration** — Expensive, gated, and not needed for the core BRRRR + ADU use case. Deliberate avoidance is the right call.
4. **STR analytics** — Mashvisor owns this lane. Stay in LTR/BRRRR.
5. **Native mobile app** — API-first web first. DealCheck has a strong mobile app; do not compete on mobile polish at MVP.

### Acquisition Angle

- **BiggerPockets community** — The target user learned BRRRR on BP, uses BP calculators, and is frustrated by manual data entry. BP forums and podcasts are acquisition channels.
- **Pacific NW real estate investor groups** — Local Facebook groups, REIAs (Real Estate Investor Associations) in Portland and Seattle are direct channels for early adopters.
- **ADU/DADU as SEO hook** — "ADU feasibility calculator Portland" and "DADU rules Seattle" are likely low-competition search terms with high purchase intent from exactly the target audience.

---

## Confidence Assessment

| Area | Confidence | Notes |
|------|------------|-------|
| DealCheck feature analysis | MEDIUM | Well-documented tool; pricing may be stale |
| PropStream feature analysis | MEDIUM | Heavily documented in investor communities |
| BatchLeads feature analysis | MEDIUM | Well-known in wholesaler community |
| REIPro feature analysis | MEDIUM | Less documented; verify at reipro.com |
| BiggerPockets calculators | MEDIUM | Well-documented; community aspects HIGH confidence |
| Mashvisor feature analysis | MEDIUM | Well-documented in STR investing community |
| Privy feature analysis | LOW-MEDIUM | Smaller tool; thinner training data coverage |
| REISift feature analysis | LOW-MEDIUM | Smaller tool; verify at reisift.io |
| ADU/DADU whitespace claim | HIGH | No competitor known to offer this as of training data; absence is consistent across all sources |
| Pricing figures (all competitors) | LOW | Pricing changes frequently; all figures should be verified before use |
| Competitive moat assessments | MEDIUM | Based on product design patterns; moat durability is a business judgment |

---

## Verification Checklist

Before finalizing roadmap decisions based on this analysis, verify the following:

- [ ] DealCheck pricing tiers at dealcheck.io/pricing
- [ ] PropStream current pricing at propstream.com/pricing
- [ ] BatchLeads current pricing at batchleads.io/pricing
- [ ] REIPro current pricing at reipro.com/pricing
- [ ] BiggerPockets Pro pricing at biggerpockets.com/pro
- [ ] Mashvisor current pricing at mashvisor.com/pricing
- [ ] Privy pricing at getprivy.com
- [ ] Any competitor that may have added ADU/DADU features since August 2025 — search "ADU feasibility real estate tool 2025 2026"
- [ ] Confirm no new entrant has emerged in the BRRRR + ADU analysis niche since August 2025

---

## Sources

- Training data knowledge of DealCheck, PropStream, BatchLeads, REIPro, BiggerPockets, Mashvisor, Privy, REISift, Roofstock, Rentometer, Rentcast as of ~August 2025. MEDIUM confidence.
- PROJECT.md (primary source — HIGH confidence)
- FEATURES.md from prior research session (MEDIUM confidence)
- WebSearch and WebFetch unavailable during this session — no live verification performed

---

*Competitive landscape analysis for: Real estate investment analysis SaaS (BRRRR + ADU/DADU, Pacific NW)*
*Researched: 2026-03-25*
*Data cutoff: August 2025 (training data) — verify pricing and feature additions before roadmap finalization*
