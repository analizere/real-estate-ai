/**
 * Mock King County WA property profiles for DataEnrichmentService stub implementation.
 * These 5 profiles represent realistic variation across King County markets.
 * Used only by the stub — Phase 5 replaces stub with real API adapters.
 */

export type MockPropertyProfile = {
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

/**
 * 5 varied King County WA mock property profiles.
 * Profile is selected by hashing the normalized address.
 * Covers typical zones: SF 5000, RSL, LR1, NR3, SF 7200.
 */
export const MOCK_KING_COUNTY_PROFILES: MockPropertyProfile[] = [
  // Profile 0: Classic SF 5000 Seattle bungalow — 1960s, no alley, entry-level market
  {
    lot_size_sqft: 5200,
    zoning_code: 'SF 5000',
    beds: 3,
    baths: 2,
    sqft: 1450,
    year_built: 1965,
    owner_name: 'Robert Chen',
    parcel_number: '3625049001',
    last_sale_date: new Date('2019-06-15'),
    last_sale_price: 425000,
    tax_assessed_value: 485000,
    building_footprint_sqft: 980,
    frontage_street_ft: 50,
    frontage_alley_ft: 0,
    rent_estimate_primary: 2400,
    rent_estimate_adu: 1200,
  },
  // Profile 1: RSL (Residential Small Lot) — newer Seattle construction, alley access, strong DADU candidate
  {
    lot_size_sqft: 3600,
    zoning_code: 'RSL',
    beds: 2,
    baths: 1,
    sqft: 980,
    year_built: 2005,
    owner_name: 'Maria Santos',
    parcel_number: '1952700265',
    last_sale_date: new Date('2021-03-22'),
    last_sale_price: 595000,
    tax_assessed_value: 620000,
    building_footprint_sqft: 720,
    frontage_street_ft: 30,
    frontage_alley_ft: 30,
    rent_estimate_primary: 1900,
    rent_estimate_adu: 1400,
  },
  // Profile 2: LR1 Lowrise Bellevue — larger lot, high assessed value, premium rents
  {
    lot_size_sqft: 7200,
    zoning_code: 'LR1',
    beds: 4,
    baths: 2.5,
    sqft: 2200,
    year_built: 1978,
    owner_name: 'James Whitfield',
    parcel_number: '0521049052',
    last_sale_date: new Date('2017-11-08'),
    last_sale_price: 720000,
    tax_assessed_value: 850000,
    building_footprint_sqft: 1300,
    frontage_street_ft: 60,
    frontage_alley_ft: 0,
    rent_estimate_primary: 3200,
    rent_estimate_adu: 1800,
  },
  // Profile 3: NR3 Neighborhood Residential — Renton, pre-war construction, large lot, alley
  {
    lot_size_sqft: 9600,
    zoning_code: 'NR3',
    beds: 5,
    baths: 3.5,
    sqft: 2800,
    year_built: 1928,
    owner_name: 'Patricia Nguyen',
    parcel_number: '7229800150',
    last_sale_date: new Date('2015-08-19'),
    last_sale_price: 280000,
    tax_assessed_value: 390000,
    building_footprint_sqft: 1600,
    frontage_street_ft: 80,
    frontage_alley_ft: 80,
    rent_estimate_primary: 2800,
    rent_estimate_adu: 1600,
  },
  // Profile 4: SF 7200 Redmond — large lot suburban, newer build, strong school district premium
  {
    lot_size_sqft: 7800,
    zoning_code: 'SF 7200',
    beds: 4,
    baths: 3,
    sqft: 2400,
    year_built: 2015,
    owner_name: 'David Kim',
    parcel_number: '0024069031',
    last_sale_date: new Date('2022-07-30'),
    last_sale_price: 850000,
    tax_assessed_value: 890000,
    building_footprint_sqft: 1800,
    frontage_street_ft: 70,
    frontage_alley_ft: 0,
    rent_estimate_primary: 3500,
    rent_estimate_adu: 2000,
  },
]
