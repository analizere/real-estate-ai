/**
 * DataEnrichmentService — permanent interface contract for Stage 1 and Stage 2 data enrichment.
 *
 * Interface contract: D-40 — PERMANENT. Only the implementation changes when Phase 5 replaces
 * stubs with real API adapters. Never change exported type signatures without a migration plan.
 *
 * Architecture:
 *   - stage1Enrich(address): Free tier boundary (D-39). County assessor, GIS, OpenStreetMap.
 *   - stage2Enrich(propertyId, features[]): Paid tier boundary (D-39). Rentcast, ATTOM, skip trace.
 *
 * Cache TTL per field type (D-44):
 *   - static: 180 days  — lot size, parcel, zoning, year built, beds/baths/sqft, APN, owner, footprint
 *   - semi-static: 30 days — tax assessed value, sale history, ownership history, permit history
 *   - dynamic: 2 days  — rent estimates, comps, days on market (24–48 hours)
 *   - never: 0 days    — skip trace / owner contact
 *
 * cache_source tracked per field (D-45):
 *   county_api | gis_api | openstreetmap | rentcast | attom | internal
 */

import { MOCK_KING_COUNTY_PROFILES } from './enrichment-stubs'

// ---------------------------------------------------------------------------
// Core types — exported as the permanent interface contract
// ---------------------------------------------------------------------------

export type CacheSource =
  | 'county_api'
  | 'gis_api'
  | 'openstreetmap'
  | 'rentcast'
  | 'attom'
  | 'internal'

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
  partial_data: boolean // true = return what we have, flag what's missing
}

export type CountyQualityTier = 'excellent' | 'good' | 'moderate'

export type Stage2Feature = 'rent_estimate' | 'comparable_sales' | 'dadu_rules' | 'skip_trace'

// GeoJSON type (simplified — sufficient for interface contract)
export type GeoJSON = {
  type: string
  coordinates: unknown[][]
}

export type Stage1EnrichmentResult = {
  success: boolean
  property_id: string
  address_normalized: string
  // static fields — 180-day TTL, source: county_api
  lot_size_sqft: EnrichedField<number>
  zoning_code: EnrichedField<string>
  beds: EnrichedField<number>
  baths: EnrichedField<number>
  sqft: EnrichedField<number>
  year_built: EnrichedField<number>
  owner_name: EnrichedField<string>
  parcel_number: EnrichedField<string>
  // semi-static fields — 30-day TTL, source: county_api
  last_sale_date: EnrichedField<Date>
  last_sale_price: EnrichedField<number>
  tax_assessed_value: EnrichedField<number>
  // GIS fields — 180-day TTL, source: gis_api
  parcel_boundaries: EnrichedField<GeoJSON>
  frontage_street_ft: EnrichedField<number>
  frontage_alley_ft: EnrichedField<number>
  building_footprint_sqft: EnrichedField<number>
  // GIS extension fields — required by CLAUDE.md GIS architecture mandate
  // These support the planned utility expansion overlay and temporal data model.
  planned_expansion_zone: EnrichedField<string | null>
  projected_timeline: EnrichedField<string | null>
  funding_status: EnrichedField<string | null>
  source_document: EnrichedField<string | null>
  confidence_level: EnrichedField<number | null>
  // enrichment metadata
  cache_hit: boolean
  county_quality_tier: CountyQualityTier
  error?: EnrichmentError
}

export type Stage2EnrichmentResult = {
  success: boolean
  property_id: string
  rent_estimate?: {
    primary: EnrichedField<number>
    adu: EnrichedField<number>
  }
  comparable_sales?: {
    comps: EnrichedField<
      Array<{ address: string; sale_price: number; sqft: number; distance_miles: number }>
    >
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

// ---------------------------------------------------------------------------
// Cache TTL constants
// ---------------------------------------------------------------------------

export const CACHE_TTL = {
  STATIC: 180, // lot size, parcel, zoning, year built, beds/baths/sqft, APN, owner, footprint
  SEMI_STATIC: 30, // tax assessed value, sale history, ownership history, permit history
  DYNAMIC: 2, // rent estimates, comps, days on market (24–48 hours = 2 days)
  NEVER: 0, // skip trace / owner contact
} as const satisfies Record<string, CacheTTL>

// ---------------------------------------------------------------------------
// County data quality tiers (D-46)
// ---------------------------------------------------------------------------

export const COUNTY_QUALITY_TIERS: Record<string, CountyQualityTier> = {
  king_county_wa: 'excellent',
  multnomah_county_or: 'good',
  pierce_county_wa: 'moderate',
  snohomish_county_wa: 'moderate',
}

// Supported WA/OR county markets mapped from city/state hint in address
const SUPPORTED_CITY_TO_COUNTY: Record<string, string> = {
  seattle: 'king_county_wa',
  bellevue: 'king_county_wa',
  redmond: 'king_county_wa',
  renton: 'king_county_wa',
  kirkland: 'king_county_wa',
  kent: 'king_county_wa',
  auburn: 'king_county_wa',
  everett: 'snohomish_county_wa',
  marysville: 'snohomish_county_wa',
  tacoma: 'pierce_county_wa',
  lakewood: 'pierce_county_wa',
  portland: 'multnomah_county_or',
  gresham: 'multnomah_county_or',
}

// ---------------------------------------------------------------------------
// Address normalization helper (D-42)
// ---------------------------------------------------------------------------

const STREET_ABBREVIATIONS: Record<string, string> = {
  street: 'St',
  st: 'St',
  avenue: 'Ave',
  ave: 'Ave',
  boulevard: 'Blvd',
  blvd: 'Blvd',
  drive: 'Dr',
  dr: 'Dr',
  road: 'Rd',
  rd: 'Rd',
  lane: 'Ln',
  ln: 'Ln',
  court: 'Ct',
  ct: 'Ct',
  place: 'Pl',
  pl: 'Pl',
  way: 'Way',
  circle: 'Cir',
  cir: 'Cir',
  terrace: 'Ter',
  ter: 'Ter',
  trail: 'Trl',
  trl: 'Trl',
  north: 'N',
  south: 'S',
  east: 'E',
  west: 'W',
  northeast: 'NE',
  northwest: 'NW',
  southeast: 'SE',
  southwest: 'SW',
  ne: 'NE',
  nw: 'NW',
  se: 'SE',
  sw: 'SW',
}

// State abbreviations to keep uppercased
const STATE_ABBREVIATIONS = new Set(['wa', 'or', 'ca', 'id', 'mt', 'fl', 'ny', 'tx'])

/**
 * Normalize address string for consistent lookup matching.
 * Title-cases words, applies standard street abbreviations, normalizes whitespace.
 */
export function normalizeAddress(address: string): string {
  // Collapse extra whitespace
  const clean = address.trim().replace(/\s+/g, ' ')

  // Split on comma boundaries, process each segment
  const segments = clean.split(',').map((segment) => {
    return segment
      .trim()
      .split(' ')
      .map((word, _index) => {
        if (!word) return word
        const lower = word.toLowerCase().replace(/[.,]$/, '')
        const trailing = word.match(/[.,]$/) ? word.slice(-1) : ''

        // Check if it's a state abbreviation (keep uppercase)
        if (STATE_ABBREVIATIONS.has(lower)) {
          return lower.toUpperCase() + trailing
        }

        // Check if it's a street abbreviation
        if (STREET_ABBREVIATIONS[lower]) {
          return STREET_ABBREVIATIONS[lower] + trailing
        }

        // Title case
        return lower.charAt(0).toUpperCase() + lower.slice(1) + trailing
      })
      .join(' ')
  })

  return segments.join(', ')
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * String hash to deterministically select a mock profile.
 * Uses the standard Java-style hash (shift+subtract) for good distribution.
 * Same address always returns the same profile.
 */
function hashAddress(address: string): number {
  let hash = 0
  for (let i = 0; i < address.length; i++) {
    hash = ((hash << 5) - hash) + address.charCodeAt(i)
    hash = hash & hash // convert to 32-bit integer
  }
  return Math.abs(hash)
}

/**
 * Create an EnrichedField wrapper with computed stale_at.
 */
function makeField<T>(
  value: T | null,
  cacheSource: CacheSource,
  ttlDays: CacheTTL,
  fetchedAt?: Date
): EnrichedField<T> {
  const now = fetchedAt ?? new Date()
  const staleAt =
    ttlDays === 0
      ? null // never cache — no stale date
      : new Date(now.getTime() + ttlDays * 24 * 60 * 60 * 1000)
  return {
    value,
    cache_source: cacheSource,
    last_fetched_at: now,
    cache_ttl_days: ttlDays,
    stale_at: staleAt,
  }
}

/**
 * Determine the county key from a normalized address.
 * Returns null if no supported city is found.
 */
function resolveCounty(normalizedAddress: string): string | null {
  const lower = normalizedAddress.toLowerCase()
  for (const [city, county] of Object.entries(SUPPORTED_CITY_TO_COUNTY)) {
    if (lower.includes(city)) {
      return county
    }
  }
  return null
}

/**
 * Generate a stub GeoJSON polygon representing a parcel boundary.
 * Coordinates are synthetic but realistic for King County.
 */
function stubParcelGeoJSON(): GeoJSON {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [-122.335, 47.608],
        [-122.334, 47.608],
        [-122.334, 47.607],
        [-122.335, 47.607],
        [-122.335, 47.608],
      ],
    ],
  }
}

// ---------------------------------------------------------------------------
// DataEnrichmentService
// ---------------------------------------------------------------------------

export class DataEnrichmentService {
  /**
   * Stage 1: Free data pull — county assessor, GIS, OpenStreetMap.
   * Cached in ReVested DB on first lookup (DATA-03).
   * Per D-39: stage1Enrich is the free-tier boundary.
   * Per D-40: this interface is PERMANENT — only implementation changes in Phase 5.
   */
  async stage1Enrich(address: string): Promise<Stage1EnrichmentResult> {
    const normalized = normalizeAddress(address)
    const now = new Date()

    // Detect PARTIAL error trigger (D-43 error path modeling)
    if (normalized.toLowerCase().includes('error')) {
      return {
        success: false,
        property_id: '',
        address_normalized: normalized,
        lot_size_sqft: makeField<number>(null, 'county_api', CACHE_TTL.STATIC, now),
        zoning_code: makeField<string>(null, 'county_api', CACHE_TTL.STATIC, now),
        beds: makeField<number>(null, 'county_api', CACHE_TTL.STATIC, now),
        baths: makeField<number>(null, 'county_api', CACHE_TTL.STATIC, now),
        sqft: makeField<number>(null, 'county_api', CACHE_TTL.STATIC, now),
        year_built: makeField<number>(null, 'county_api', CACHE_TTL.STATIC, now),
        owner_name: makeField<string>(null, 'county_api', CACHE_TTL.STATIC, now),
        parcel_number: makeField<string>(null, 'county_api', CACHE_TTL.STATIC, now),
        last_sale_date: makeField<Date>(null, 'county_api', CACHE_TTL.SEMI_STATIC, now),
        last_sale_price: makeField<number>(null, 'county_api', CACHE_TTL.SEMI_STATIC, now),
        tax_assessed_value: makeField<number>(null, 'county_api', CACHE_TTL.SEMI_STATIC, now),
        parcel_boundaries: makeField<GeoJSON>(null, 'gis_api', CACHE_TTL.STATIC, now),
        frontage_street_ft: makeField<number>(null, 'gis_api', CACHE_TTL.STATIC, now),
        frontage_alley_ft: makeField<number>(null, 'gis_api', CACHE_TTL.STATIC, now),
        building_footprint_sqft: makeField<number>(null, 'gis_api', CACHE_TTL.STATIC, now),
        planned_expansion_zone: makeField<string | null>(null, 'gis_api', CACHE_TTL.STATIC, now),
        projected_timeline: makeField<string | null>(null, 'gis_api', CACHE_TTL.STATIC, now),
        funding_status: makeField<string | null>(null, 'gis_api', CACHE_TTL.STATIC, now),
        source_document: makeField<string | null>(null, 'gis_api', CACHE_TTL.STATIC, now),
        confidence_level: makeField<number | null>(null, 'gis_api', CACHE_TTL.STATIC, now),
        cache_hit: false,
        county_quality_tier: 'excellent',
        error: {
          code: 'PARTIAL',
          message: 'Partial data available — some fields could not be retrieved',
          partial_data: true,
        },
      }
    }

    const lowerNorm = normalized.toLowerCase()

    // Check for explicitly out-of-market state indicators first (e.g. "Miami, FL")
    // This gives COUNTY_NOT_SUPPORTED only when the address clearly names an out-of-market location.
    const hasOutOfMarketState =
      / fl$| fl,| tx$| tx,| ny$| ny,| ca$| ca,| miami| chicago| houston| new york/.test(
        lowerNorm
      )

    if (hasOutOfMarketState) {
      return this._errorResult(normalized, 'COUNTY_NOT_SUPPORTED', 'Address is outside supported markets (Pacific NW only)')
    }

    // ADDRESS_NOT_FOUND: address doesn't contain a recognizable street number + name pattern
    const hasStreetPattern = /\d+\s+\w/.test(normalized)
    if (!hasStreetPattern) {
      return this._errorResult(normalized, 'ADDRESS_NOT_FOUND', 'Address format not recognized or property not found in county records')
    }

    // Determine county — COUNTY_NOT_SUPPORTED if inside US but outside our markets
    const county = resolveCounty(normalized)

    if (county === null && !lowerNorm.includes('wa') && !lowerNorm.includes('or')) {
      return this._errorResult(normalized, 'COUNTY_NOT_SUPPORTED', 'Address is outside supported markets (Pacific NW only)')
    }

    // Select mock profile based on address hash (D-41 — varied data)
    const profileIndex = hashAddress(normalized) % MOCK_KING_COUNTY_PROFILES.length
    const profile = MOCK_KING_COUNTY_PROFILES[profileIndex]

    // Effective county for quality tier lookup
    const effectiveCounty = county ?? 'king_county_wa'
    const qualityTier = COUNTY_QUALITY_TIERS[effectiveCounty] ?? 'moderate'

    // Generate a deterministic property_id from address hash
    const addrHash = hashAddress(normalized)
    const propertyId = `stub-${effectiveCounty}-${addrHash}`

    return {
      success: true,
      property_id: propertyId,
      address_normalized: normalized,

      // Static fields — county assessor data (180-day TTL)
      lot_size_sqft: makeField(profile.lot_size_sqft, 'county_api', CACHE_TTL.STATIC, now),
      zoning_code: makeField(profile.zoning_code, 'county_api', CACHE_TTL.STATIC, now),
      beds: makeField(profile.beds, 'county_api', CACHE_TTL.STATIC, now),
      baths: makeField(profile.baths, 'county_api', CACHE_TTL.STATIC, now),
      sqft: makeField(profile.sqft, 'county_api', CACHE_TTL.STATIC, now),
      year_built: makeField(profile.year_built, 'county_api', CACHE_TTL.STATIC, now),
      owner_name: makeField(profile.owner_name, 'county_api', CACHE_TTL.STATIC, now),
      parcel_number: makeField(profile.parcel_number, 'county_api', CACHE_TTL.STATIC, now),

      // Semi-static fields — sale history / assessment (30-day TTL)
      last_sale_date: makeField(profile.last_sale_date, 'county_api', CACHE_TTL.SEMI_STATIC, now),
      last_sale_price: makeField(profile.last_sale_price, 'county_api', CACHE_TTL.SEMI_STATIC, now),
      tax_assessed_value: makeField(profile.tax_assessed_value, 'county_api', CACHE_TTL.SEMI_STATIC, now),

      // GIS fields — parcel geometry and derived measurements (180-day TTL)
      parcel_boundaries: makeField(stubParcelGeoJSON(), 'gis_api', CACHE_TTL.STATIC, now),
      frontage_street_ft: makeField(profile.frontage_street_ft, 'gis_api', CACHE_TTL.STATIC, now),
      frontage_alley_ft: makeField(profile.frontage_alley_ft, 'gis_api', CACHE_TTL.STATIC, now),
      building_footprint_sqft: makeField(profile.building_footprint_sqft, 'gis_api', CACHE_TTL.STATIC, now),

      // GIS extension fields — utility expansion timeline (CLAUDE.md mandate)
      // Stubs return null — Phase 5 will populate from utility district CIP documents
      planned_expansion_zone: makeField(null, 'gis_api', CACHE_TTL.STATIC, now),
      projected_timeline: makeField(null, 'gis_api', CACHE_TTL.STATIC, now),
      funding_status: makeField(null, 'gis_api', CACHE_TTL.STATIC, now),
      source_document: makeField(null, 'gis_api', CACHE_TTL.STATIC, now),
      confidence_level: makeField(null, 'gis_api', CACHE_TTL.STATIC, now),

      // Enrichment metadata
      cache_hit: false, // stub always simulates first fetch
      county_quality_tier: qualityTier,
    }
  }

  /**
   * Stage 2: Premium data — Rentcast, ATTOM comps, DADU rules, skip trace.
   * Per D-39: stage2Enrich is the paid-tier boundary.
   * Per D-40: this interface is PERMANENT — only implementation changes in Phase 5.
   */
  async stage2Enrich(
    propertyId: string,
    features: Stage2Feature[]
  ): Promise<Stage2EnrichmentResult> {
    const now = new Date()

    // Error trigger for testing error paths (D-43)
    if (propertyId === 'error-test') {
      return {
        success: false,
        property_id: propertyId,
        cache_hit: false,
        error: {
          code: 'ADDRESS_NOT_FOUND',
          message: 'Property not found for Stage 2 enrichment',
          partial_data: false,
        },
      }
    }

    const result: Stage2EnrichmentResult = {
      success: true,
      property_id: propertyId,
      cache_hit: false,
    }

    // Build each requested feature
    for (const feature of features) {
      switch (feature) {
        case 'rent_estimate': {
          // Rentcast — 2-day TTL (dynamic market data)
          result.rent_estimate = {
            primary: makeField(2400, 'rentcast', CACHE_TTL.DYNAMIC, now),
            adu: makeField(1200, 'rentcast', CACHE_TTL.DYNAMIC, now),
          }
          break
        }

        case 'comparable_sales': {
          // ATTOM — 2-day TTL (dynamic market data)
          result.comparable_sales = {
            comps: makeField(
              [
                { address: '456 Oak Ave, Seattle, WA', sale_price: 580000, sqft: 1620, distance_miles: 0.3 },
                { address: '789 Elm St, Seattle, WA', sale_price: 610000, sqft: 1580, distance_miles: 0.5 },
                { address: '321 Maple Dr, Seattle, WA', sale_price: 555000, sqft: 1400, distance_miles: 0.7 },
              ],
              'attom',
              CACHE_TTL.DYNAMIC,
              now
            ),
          }
          break
        }

        case 'dadu_rules': {
          // Internal zoning rules DB — 180-day TTL (semi-permanent zoning rules)
          result.dadu_rules = {
            permitted: makeField(true, 'internal', CACHE_TTL.STATIC, now),
            max_adu_sqft: makeField(1000, 'internal', CACHE_TTL.STATIC, now),
            setbacks: makeField(
              { front: 20, rear: 5, side: 5 },
              'internal',
              CACHE_TTL.STATIC,
              now
            ),
            lot_coverage_limit: makeField(0.45, 'internal', CACHE_TTL.STATIC, now),
            owner_occupancy_required: makeField(false, 'internal', CACHE_TTL.STATIC, now),
            permitted_types: makeField(
              ['detached', 'attached', 'garage_conversion', 'basement'],
              'internal',
              CACHE_TTL.STATIC,
              now
            ),
          }
          break
        }

        case 'skip_trace': {
          // Skip trace — TTL: 0 (NEVER cache per D-44; owner contact changes frequently)
          result.skip_trace = {
            owner_phone: makeField('(206) 555-0100', 'internal', CACHE_TTL.NEVER, now),
            owner_email: makeField('owner@example.com', 'internal', CACHE_TTL.NEVER, now),
            mailing_address: makeField('123 Owner St, Seattle, WA 98101', 'internal', CACHE_TTL.NEVER, now),
          }
          break
        }
      }
    }

    return result
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private _errorResult(
    normalizedAddress: string,
    code: EnrichmentError['code'],
    message: string
  ): Stage1EnrichmentResult {
    const now = new Date()
    return {
      success: false,
      property_id: '',
      address_normalized: normalizedAddress,
      lot_size_sqft: makeField<number>(null, 'county_api', CACHE_TTL.STATIC, now),
      zoning_code: makeField<string>(null, 'county_api', CACHE_TTL.STATIC, now),
      beds: makeField<number>(null, 'county_api', CACHE_TTL.STATIC, now),
      baths: makeField<number>(null, 'county_api', CACHE_TTL.STATIC, now),
      sqft: makeField<number>(null, 'county_api', CACHE_TTL.STATIC, now),
      year_built: makeField<number>(null, 'county_api', CACHE_TTL.STATIC, now),
      owner_name: makeField<string>(null, 'county_api', CACHE_TTL.STATIC, now),
      parcel_number: makeField<string>(null, 'county_api', CACHE_TTL.STATIC, now),
      last_sale_date: makeField<Date>(null, 'county_api', CACHE_TTL.SEMI_STATIC, now),
      last_sale_price: makeField<number>(null, 'county_api', CACHE_TTL.SEMI_STATIC, now),
      tax_assessed_value: makeField<number>(null, 'county_api', CACHE_TTL.SEMI_STATIC, now),
      parcel_boundaries: makeField<GeoJSON>(null, 'gis_api', CACHE_TTL.STATIC, now),
      frontage_street_ft: makeField<number>(null, 'gis_api', CACHE_TTL.STATIC, now),
      frontage_alley_ft: makeField<number>(null, 'gis_api', CACHE_TTL.STATIC, now),
      building_footprint_sqft: makeField<number>(null, 'gis_api', CACHE_TTL.STATIC, now),
      planned_expansion_zone: makeField<string | null>(null, 'gis_api', CACHE_TTL.STATIC, now),
      projected_timeline: makeField<string | null>(null, 'gis_api', CACHE_TTL.STATIC, now),
      funding_status: makeField<string | null>(null, 'gis_api', CACHE_TTL.STATIC, now),
      source_document: makeField<string | null>(null, 'gis_api', CACHE_TTL.STATIC, now),
      confidence_level: makeField<number | null>(null, 'gis_api', CACHE_TTL.STATIC, now),
      cache_hit: false,
      county_quality_tier: 'excellent',
      error: {
        code,
        message,
        partial_data: false,
      },
    }
  }
}
