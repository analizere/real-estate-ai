---
phase: 02A-infrastructure-services
plan: 04
type: execute
wave: 2
depends_on: [02A-01]
files_modified:
  - lib/services/enrichment.ts
  - lib/services/enrichment-stubs.ts
  - tests/unit/enrichment.test.ts
autonomous: true
requirements: [DATA-01, DATA-02, DATA-03, DATA-05, DATA-06, DATA-07, DATA-08, DATA-09, DATA-10]

must_haves:
  truths:
    - "DataEnrichmentService has stage1Enrich(address) and stage2Enrich(propertyId, features[]) as distinct methods"
    - "Stage 1 and Stage 2 are separate methods with explicit free/paid boundary"
    - "Stub returns varied realistic King County WA data based on address hash"
    - "Error paths are modeled explicitly (ADDRESS_NOT_FOUND, COUNTY_NOT_SUPPORTED, PARTIAL)"
    - "Cache TTLs defined per field type: static 180d, semi-static 30d, dynamic 24-48h, skip trace never"
    - "cache_source tracked per field (county_api, gis_api, openstreetmap, rentcast, attom, internal)"
  artifacts:
    - path: "lib/services/enrichment.ts"
      provides: "DataEnrichmentService class with permanent interface contract"
      exports: ["DataEnrichmentService", "CacheSource", "CacheTTL", "EnrichedField", "Stage1EnrichmentResult", "Stage2EnrichmentResult", "Stage2Feature", "EnrichmentError", "CountyQualityTier"]
    - path: "lib/services/enrichment-stubs.ts"
      provides: "5 varied King County WA mock property profiles"
      exports: ["MOCK_KING_COUNTY_PROFILES"]
  key_links:
    - from: "lib/services/enrichment.ts"
      to: "lib/services/enrichment-stubs.ts"
      via: "mock profile import for stub implementation"
      pattern: "import.*MOCK_KING_COUNTY_PROFILES.*from.*enrichment-stubs"
---

<objective>
Create the DataEnrichmentService with the permanent interface contract for Stage 1 (free) and Stage 2 (paid) data enrichment. Stub implementations return realistic varied King County WA data. This interface is what Phase 5 real API adapters will build against.

Purpose: The interface contract defined here is PERMANENT (D-40). Only implementations change when real APIs replace stubs. Phase 2B needs the stub to test calculator pre-population.
Output: `lib/services/enrichment.ts` (interface + stub class), `lib/services/enrichment-stubs.ts` (mock data), tests.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02A-infrastructure-services/02A-CONTEXT.md
@.planning/phases/02A-infrastructure-services/02A-RESEARCH.md
@.planning/phases/02A-infrastructure-services/02A-01-SUMMARY.md

<interfaces>
<!-- From RESEARCH.md Pattern 5 — the permanent interface types -->
```typescript
export type CacheSource = 'county_api' | 'gis_api' | 'openstreetmap' | 'rentcast' | 'attom' | 'internal'
export type CacheTTL = 180 | 30 | 2 | 0 // days; 0 = never cache

export type EnrichedField<T> = {
  value: T | null
  cache_source: CacheSource
  last_fetched_at: Date
  cache_ttl_days: CacheTTL
  stale_at: Date | null
  missing_reason?: 'NOT_IN_COUNTY' | 'API_ERROR' | 'PARSE_ERROR' | 'NOT_APPLICABLE'
}

export type EnrichmentError = {
  code: 'ADDRESS_NOT_FOUND' | 'COUNTY_NOT_SUPPORTED' | 'API_TIMEOUT' | 'PARSE_ERROR' | 'PARTIAL'
  message: string
  partial_data: boolean
}

export type Stage2Feature = 'rent_estimate' | 'comparable_sales' | 'dadu_rules' | 'skip_trace'
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Create DataEnrichmentService interface and stub implementation</name>
  <files>lib/services/enrichment.ts, lib/services/enrichment-stubs.ts, tests/unit/enrichment.test.ts</files>
  <read_first>
    - .planning/phases/02A-infrastructure-services/02A-RESEARCH.md (Pattern 5: DataEnrichmentService Stub, full type definitions)
    - .planning/phases/02A-infrastructure-services/02A-CONTEXT.md (D-39 through D-48)
    - CLAUDE.md (§"Staged data pull architecture", §"Property data caching", §"GIS/mapping data architecture")
  </read_first>
  <behavior>
    - Test: stage1Enrich("123 Main St, Seattle, WA") returns a Stage1EnrichmentResult with success: true
    - Test: stage1Enrich returns different property data for different addresses (hash-based variation)
    - Test: stage1Enrich result includes all static fields (lot_size_sqft, zoning_code, beds, baths, sqft, year_built, owner_name, parcel_number) with cache_ttl_days: 180
    - Test: stage1Enrich result includes all semi-static fields (last_sale_date, last_sale_price, tax_assessed_value) with cache_ttl_days: 30
    - Test: stage1Enrich result includes GIS fields (parcel_boundaries, frontage_street_ft, frontage_alley_ft, building_footprint_sqft)
    - Test: stage1Enrich result includes GIS extension fields (planned_expansion_zone, projected_timeline, funding_status, source_document, confidence_level) per CLAUDE.md GIS architecture
    - Test: stage1Enrich result includes cache_hit: false (first fetch), county_quality_tier
    - Test: stage1Enrich("unknown address") returns error with code: 'ADDRESS_NOT_FOUND'
    - Test: stage1Enrich("123 Main St, Miami, FL") returns error with code: 'COUNTY_NOT_SUPPORTED'
    - Test: stage2Enrich(propertyId, ['rent_estimate']) returns rent estimate with cache_source: 'rentcast' and cache_ttl_days: 2
    - Test: stage2Enrich(propertyId, ['skip_trace']) returns result with cache_ttl_days: 0 (never cache)
    - Test: stage2Enrich(propertyId, ['rent_estimate', 'comparable_sales']) returns both features
    - Test: Every EnrichedField has cache_source set (never undefined)
    - Test: Address normalization: "123 main st" normalizes to "123 Main St"
    - Test: CountyQualityTier for King County is 'excellent', Multnomah is 'good', Pierce is 'moderate', Snohomish is 'moderate'
  </behavior>
  <action>
Create `lib/services/enrichment-stubs.ts` with 5 mock King County WA property profiles:

```typescript
export type MockPropertyProfile = {
  // Will be fully typed — key fields for variation
  lot_size_sqft: number
  zoning_code: string
  beds: number
  baths: number
  sqft: number
  year_built: number
  owner_name: string
  parcel_number: string
  last_sale_date: Date
  last_sale_price: number
  tax_assessed_value: number
  building_footprint_sqft: number
  frontage_street_ft: number
  frontage_alley_ft: number
  rent_estimate_primary: number
  rent_estimate_adu: number
}

export const MOCK_KING_COUNTY_PROFILES: MockPropertyProfile[] = [
  {
    lot_size_sqft: 5200, zoning_code: 'SF 5000', beds: 3, baths: 2, sqft: 1450,
    year_built: 1965, owner_name: 'Robert Chen', parcel_number: '3625049001',
    last_sale_date: new Date('2019-06-15'), last_sale_price: 425000,
    tax_assessed_value: 485000, building_footprint_sqft: 980,
    frontage_street_ft: 50, frontage_alley_ft: 0,
    rent_estimate_primary: 2400, rent_estimate_adu: 1200,
  },
  // ... 4 more varied profiles with different zoning codes (RSL, LR1, NR3, SF 7200),
  // different lot sizes (4800-9600), beds (2-5), baths (1-3.5), sqft (980-2800),
  // year_built (1928-2015), sale prices ($280k-$850k), rent estimates ($1800-$3500)
]
```

Create `lib/services/enrichment.ts`:

1. Export ALL type definitions from RESEARCH.md Pattern 5:
   - CacheSource, CacheTTL, EnrichedField<T>, Stage1EnrichmentResult, Stage2EnrichmentResult, Stage2Feature, EnrichmentError, CountyQualityTier

2. Cache TTL constants:
   ```typescript
   export const CACHE_TTL = {
     STATIC: 180,      // lot size, parcel, zoning, year built, beds/baths/sqft, APN, owner, footprint
     SEMI_STATIC: 30,  // tax assessed value, sale history, ownership history, permit history
     DYNAMIC: 2,       // rent estimates, comps, days on market (24-48 hours = 2 days)
     NEVER: 0,         // skip trace / owner contact
   } as const satisfies Record<string, CacheTTL>
   ```

3. County quality tiers:
   ```typescript
   export const COUNTY_QUALITY_TIERS: Record<string, CountyQualityTier> = {
     'king_county_wa': 'excellent',
     'multnomah_county_or': 'good',
     'pierce_county_wa': 'moderate',
     'snohomish_county_wa': 'moderate',
   }
   ```

4. Address normalization helper:
   ```typescript
   export function normalizeAddress(address: string): string {
     // Title case, normalize whitespace, standard abbreviations (St, Ave, Blvd, Dr)
     // Strip unit/apt numbers for lookup matching
   }
   ```

5. DataEnrichmentService class with stub implementations:
   ```typescript
   export class DataEnrichmentService {
     /**
      * Stage 1: Free data pull — county assessor, GIS, OpenStreetMap.
      * Cached in ReVested DB on first lookup (DATA-03).
      * Per D-39: stage1Enrich is the free-tier boundary.
      */
     async stage1Enrich(address: string): Promise<Stage1EnrichmentResult> {
       // 1. Normalize address (D-42)
       // 2. Determine county from address
       // 3. If county not supported → return error code COUNTY_NOT_SUPPORTED
       // 4. Hash normalized address to select mock profile (D-41: varied data)
       // 5. Build Stage1EnrichmentResult with EnrichedField wrappers
       //    - Static fields: cache_ttl_days=180, cache_source='county_api'
       //    - Semi-static: cache_ttl_days=30, cache_source='county_api'
       //    - GIS fields: cache_ttl_days=180, cache_source='gis_api'
       //    - GIS extension fields: cache_source='gis_api', mostly null for stub
       //    - cache_hit=false (stub always simulates first fetch)
       //    - county_quality_tier from COUNTY_QUALITY_TIERS
       // 6. If address contains "error" → return PARTIAL error with partial_data=true (D-43)
     }

     /**
      * Stage 2: Premium data — Rentcast, comps, DADU rules, skip trace.
      * Per D-39: stage2Enrich is the paid-tier boundary.
      * Per D-40: this interface is PERMANENT — only implementation changes.
      */
     async stage2Enrich(
       propertyId: string,
       features: Stage2Feature[]
     ): Promise<Stage2EnrichmentResult> {
       // 1. For each requested feature, build result:
       //    - rent_estimate: cache_source='rentcast', cache_ttl_days=2
       //    - comparable_sales: cache_source='attom', cache_ttl_days=2
       //    - dadu_rules: cache_source='internal', cache_ttl_days=180
       //    - skip_trace: cache_source='internal', cache_ttl_days=0 (never cache)
       // 2. Return Stage2EnrichmentResult with feature results
       // 3. If propertyId is 'error-test' → return error (D-43)
     }
   }
   ```

6. Stage2EnrichmentResult type:
   ```typescript
   export type Stage2EnrichmentResult = {
     success: boolean
     property_id: string
     rent_estimate?: {
       primary: EnrichedField<number>
       adu: EnrichedField<number>
     }
     comparable_sales?: {
       comps: EnrichedField<Array<{ address: string; sale_price: number; sqft: number; distance_miles: number }>>
     }
     dadu_rules?: {
       permitted: EnrichedField<boolean>
       max_adu_sqft: EnrichedField<number>
       setbacks: EnrichedField<{ front: number; rear: number; side: number }>
       lot_coverage_limit: EnrichedField<number>
       owner_occupancy_required: EnrichedField<boolean>
       permitted_types: EnrichedField<string[]>
     }
     skip_trace?: {
       owner_phone: EnrichedField<string>
       owner_email: EnrichedField<string>
       mailing_address: EnrichedField<string>
     }
     cache_hit: boolean
     error?: EnrichmentError
   }
   ```

7. Stage1EnrichmentResult must include ALL fields from RESEARCH.md Pattern 5 including GIS extension fields (planned_expansion_zone, projected_timeline, funding_status, source_document, confidence_level) per CLAUDE.md GIS architecture mandate.

Create `tests/unit/enrichment.test.ts` with all behavior tests. Use the service directly (no db mocking needed — stubs are in-memory).
  </action>
  <verify>
    <automated>cd /Users/sticky_iqqy_iqqy/real-estate-ai && npx vitest run tests/unit/enrichment.test.ts --reporter=verbose</automated>
  </verify>
  <acceptance_criteria>
    - lib/services/enrichment.ts contains `export class DataEnrichmentService`
    - lib/services/enrichment.ts contains `async stage1Enrich(address: string): Promise<Stage1EnrichmentResult>`
    - lib/services/enrichment.ts contains `async stage2Enrich(propertyId: string, features: Stage2Feature[]): Promise<Stage2EnrichmentResult>`
    - lib/services/enrichment.ts contains `export type CacheSource = 'county_api' | 'gis_api' | 'openstreetmap' | 'rentcast' | 'attom' | 'internal'`
    - lib/services/enrichment.ts contains `export type EnrichedField<T>`
    - lib/services/enrichment.ts contains `export const CACHE_TTL`
    - lib/services/enrichment.ts contains `STATIC: 180`
    - lib/services/enrichment.ts contains `NEVER: 0`
    - lib/services/enrichment.ts contains `export const COUNTY_QUALITY_TIERS`
    - lib/services/enrichment.ts contains `export function normalizeAddress`
    - lib/services/enrichment.ts contains `planned_expansion_zone`
    - lib/services/enrichment.ts contains `confidence_level`
    - lib/services/enrichment.ts contains `ADDRESS_NOT_FOUND`
    - lib/services/enrichment.ts contains `COUNTY_NOT_SUPPORTED`
    - lib/services/enrichment.ts contains `PARTIAL`
    - lib/services/enrichment-stubs.ts contains `export const MOCK_KING_COUNTY_PROFILES`
    - lib/services/enrichment-stubs.ts has at least 5 property profiles
    - tests/unit/enrichment.test.ts exits 0
  </acceptance_criteria>
  <done>DataEnrichmentService with permanent interface contract created. stage1Enrich and stage2Enrich have distinct method signatures with explicit free/paid boundary. Stubs return 5 varied King County profiles based on address hash. Error paths modeled. Cache TTLs and cache_source tracked per field. All tests pass.</done>
</task>

</tasks>

<verification>
- `npx vitest run tests/unit/enrichment.test.ts --reporter=verbose` — all tests pass
- `grep "stage1Enrich\|stage2Enrich" lib/services/enrichment.ts | wc -l` — both methods present
- `grep "cache_source" lib/services/enrichment.ts | wc -l` — tracked per field
- `grep "COUNTY_NOT_SUPPORTED\|ADDRESS_NOT_FOUND\|PARTIAL" lib/services/enrichment.ts` — error paths exist
</verification>

<success_criteria>
- DataEnrichmentService class with stage1Enrich(address) and stage2Enrich(propertyId, features[])
- All type exports: CacheSource, CacheTTL, EnrichedField, Stage1EnrichmentResult, Stage2EnrichmentResult, EnrichmentError
- CACHE_TTL constants: 180 (static), 30 (semi-static), 2 (dynamic), 0 (never)
- COUNTY_QUALITY_TIERS: 4 counties with quality ratings
- 5 varied mock King County profiles in enrichment-stubs.ts
- Address normalization helper
- Error paths: ADDRESS_NOT_FOUND, COUNTY_NOT_SUPPORTED, PARTIAL with partial_data flag
- GIS extension fields present per CLAUDE.md mandate
- cache_source tracked on every EnrichedField
</success_criteria>

<output>
After completion, create `.planning/phases/02A-infrastructure-services/02A-04-SUMMARY.md`
</output>
