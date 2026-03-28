import { describe, it, expect, beforeEach } from 'vitest'
import { DataEnrichmentService } from '@/lib/services/enrichment'
import type {
  Stage1EnrichmentResult,
  Stage2EnrichmentResult,
  CacheSource,
} from '@/lib/services/enrichment'
import {
  CACHE_TTL,
  COUNTY_QUALITY_TIERS,
  normalizeAddress,
} from '@/lib/services/enrichment'

describe('normalizeAddress', () => {
  it('title-cases street names', () => {
    expect(normalizeAddress('123 main st, seattle, wa')).toBe('123 Main St, Seattle, WA')
  })

  it('handles already-cased input unchanged', () => {
    expect(normalizeAddress('456 Oak Ave, Redmond, WA')).toBe('456 Oak Ave, Redmond, WA')
  })

  it('normalizes extra whitespace', () => {
    expect(normalizeAddress('789   elm   blvd,  bellevue,  wa')).toBe('789 Elm Blvd, Bellevue, WA')
  })
})

describe('CACHE_TTL constants', () => {
  it('STATIC is 180 days', () => {
    expect(CACHE_TTL.STATIC).toBe(180)
  })

  it('SEMI_STATIC is 30 days', () => {
    expect(CACHE_TTL.SEMI_STATIC).toBe(30)
  })

  it('DYNAMIC is 2 days', () => {
    expect(CACHE_TTL.DYNAMIC).toBe(2)
  })

  it('NEVER is 0', () => {
    expect(CACHE_TTL.NEVER).toBe(0)
  })
})

describe('COUNTY_QUALITY_TIERS', () => {
  it('King County WA is excellent', () => {
    expect(COUNTY_QUALITY_TIERS['king_county_wa']).toBe('excellent')
  })

  it('Multnomah County OR is good', () => {
    expect(COUNTY_QUALITY_TIERS['multnomah_county_or']).toBe('good')
  })

  it('Pierce County WA is moderate', () => {
    expect(COUNTY_QUALITY_TIERS['pierce_county_wa']).toBe('moderate')
  })

  it('Snohomish County WA is moderate', () => {
    expect(COUNTY_QUALITY_TIERS['snohomish_county_wa']).toBe('moderate')
  })
})

describe('DataEnrichmentService', () => {
  let service: DataEnrichmentService

  beforeEach(() => {
    service = new DataEnrichmentService()
  })

  describe('stage1Enrich — happy path', () => {
    it('returns success: true for a valid Seattle address', async () => {
      const result = await service.stage1Enrich('123 Main St, Seattle, WA')
      expect(result.success).toBe(true)
    })

    it('returns different property data for different addresses (hash-based variation)', async () => {
      const r1 = await service.stage1Enrich('123 Main St, Seattle, WA')
      const r2 = await service.stage1Enrich('999 Pine St, Bellevue, WA')
      // At least one field should differ between the two addresses
      const differentLot =
        r1.lot_size_sqft.value !== r2.lot_size_sqft.value
      const differentBeds =
        r1.beds.value !== r2.beds.value
      const differentOwner =
        r1.owner_name.value !== r2.owner_name.value
      expect(differentLot || differentBeds || differentOwner).toBe(true)
    })

    it('returns static fields with cache_ttl_days: 180', async () => {
      const result = await service.stage1Enrich('123 Main St, Seattle, WA')
      expect(result.lot_size_sqft.cache_ttl_days).toBe(180)
      expect(result.zoning_code.cache_ttl_days).toBe(180)
      expect(result.beds.cache_ttl_days).toBe(180)
      expect(result.baths.cache_ttl_days).toBe(180)
      expect(result.sqft.cache_ttl_days).toBe(180)
      expect(result.year_built.cache_ttl_days).toBe(180)
      expect(result.owner_name.cache_ttl_days).toBe(180)
      expect(result.parcel_number.cache_ttl_days).toBe(180)
    })

    it('returns semi-static fields with cache_ttl_days: 30', async () => {
      const result = await service.stage1Enrich('123 Main St, Seattle, WA')
      expect(result.last_sale_date.cache_ttl_days).toBe(30)
      expect(result.last_sale_price.cache_ttl_days).toBe(30)
      expect(result.tax_assessed_value.cache_ttl_days).toBe(30)
    })

    it('returns GIS fields with expected TTL and cache_source', async () => {
      const result = await service.stage1Enrich('123 Main St, Seattle, WA')
      expect(result.parcel_boundaries.cache_ttl_days).toBe(180)
      expect(result.parcel_boundaries.cache_source).toBe('gis_api')
      expect(result.frontage_street_ft.cache_ttl_days).toBe(180)
      expect(result.frontage_street_ft.cache_source).toBe('gis_api')
      expect(result.frontage_alley_ft.cache_ttl_days).toBe(180)
      expect(result.building_footprint_sqft.cache_ttl_days).toBe(180)
    })

    it('includes GIS extension fields per CLAUDE.md mandate', async () => {
      const result = await service.stage1Enrich('123 Main St, Seattle, WA')
      // These fields must exist on the result (values may be null for stubs)
      expect('planned_expansion_zone' in result).toBe(true)
      expect('projected_timeline' in result).toBe(true)
      expect('funding_status' in result).toBe(true)
      expect('source_document' in result).toBe(true)
      expect('confidence_level' in result).toBe(true)
    })

    it('returns cache_hit: false (first fetch simulation)', async () => {
      const result = await service.stage1Enrich('123 Main St, Seattle, WA')
      expect(result.cache_hit).toBe(false)
    })

    it('returns a county_quality_tier', async () => {
      const result = await service.stage1Enrich('123 Main St, Seattle, WA')
      expect(['excellent', 'good', 'moderate']).toContain(result.county_quality_tier)
    })

    it('returns King County quality tier as excellent', async () => {
      const result = await service.stage1Enrich('123 Main St, Seattle, WA')
      expect(result.county_quality_tier).toBe('excellent')
    })

    it('every EnrichedField has cache_source set', async () => {
      const result = await service.stage1Enrich('123 Main St, Seattle, WA')
      const fieldsToCheck = [
        result.lot_size_sqft,
        result.zoning_code,
        result.beds,
        result.baths,
        result.sqft,
        result.year_built,
        result.owner_name,
        result.parcel_number,
        result.last_sale_date,
        result.last_sale_price,
        result.tax_assessed_value,
        result.parcel_boundaries,
        result.frontage_street_ft,
        result.frontage_alley_ft,
        result.building_footprint_sqft,
      ]
      for (const field of fieldsToCheck) {
        expect(field.cache_source).toBeDefined()
        expect(field.cache_source).not.toBeUndefined()
      }
    })

    it('static fields have cache_source: county_api', async () => {
      const result = await service.stage1Enrich('123 Main St, Seattle, WA')
      expect(result.lot_size_sqft.cache_source).toBe('county_api')
      expect(result.beds.cache_source).toBe('county_api')
      expect(result.year_built.cache_source).toBe('county_api')
    })
  })

  describe('stage1Enrich — error paths', () => {
    it('returns error with code ADDRESS_NOT_FOUND for unknown address', async () => {
      const result = await service.stage1Enrich('unknown address 99999')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error!.code).toBe('ADDRESS_NOT_FOUND')
    })

    it('returns error with code COUNTY_NOT_SUPPORTED for out-of-market address', async () => {
      const result = await service.stage1Enrich('123 Main St, Miami, FL')
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
      expect(result.error!.code).toBe('COUNTY_NOT_SUPPORTED')
    })

    it('returns PARTIAL error with partial_data: true for partial error trigger', async () => {
      const result = await service.stage1Enrich('123 error street, Seattle, WA')
      expect(result.error).toBeDefined()
      expect(result.error!.code).toBe('PARTIAL')
      expect(result.error!.partial_data).toBe(true)
    })
  })

  describe('stage2Enrich — rent_estimate', () => {
    it('returns rent estimate with cache_source: rentcast', async () => {
      const result = await service.stage2Enrich('prop-123', ['rent_estimate'])
      expect(result.success).toBe(true)
      expect(result.rent_estimate).toBeDefined()
      expect(result.rent_estimate!.primary.cache_source).toBe('rentcast')
      expect(result.rent_estimate!.adu.cache_source).toBe('rentcast')
    })

    it('returns rent estimate with cache_ttl_days: 2', async () => {
      const result = await service.stage2Enrich('prop-123', ['rent_estimate'])
      expect(result.rent_estimate!.primary.cache_ttl_days).toBe(2)
      expect(result.rent_estimate!.adu.cache_ttl_days).toBe(2)
    })
  })

  describe('stage2Enrich — skip_trace', () => {
    it('returns skip_trace with cache_ttl_days: 0 (never cache)', async () => {
      const result = await service.stage2Enrich('prop-456', ['skip_trace'])
      expect(result.success).toBe(true)
      expect(result.skip_trace).toBeDefined()
      expect(result.skip_trace!.owner_phone.cache_ttl_days).toBe(0)
      expect(result.skip_trace!.owner_email.cache_ttl_days).toBe(0)
      expect(result.skip_trace!.mailing_address.cache_ttl_days).toBe(0)
    })
  })

  describe('stage2Enrich — multiple features', () => {
    it('returns both features when requesting rent_estimate and comparable_sales', async () => {
      const result = await service.stage2Enrich('prop-789', [
        'rent_estimate',
        'comparable_sales',
      ])
      expect(result.success).toBe(true)
      expect(result.rent_estimate).toBeDefined()
      expect(result.comparable_sales).toBeDefined()
    })

    it('returns property_id on result', async () => {
      const result = await service.stage2Enrich('prop-xyz', ['rent_estimate'])
      expect(result.property_id).toBe('prop-xyz')
    })
  })

  describe('stage2Enrich — error paths', () => {
    it('returns error result for error-test property ID', async () => {
      const result = await service.stage2Enrich('error-test', ['rent_estimate'])
      expect(result.success).toBe(false)
      expect(result.error).toBeDefined()
    })
  })
})
