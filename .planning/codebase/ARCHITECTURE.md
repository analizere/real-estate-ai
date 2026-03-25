# Architecture

**Analysis Date:** 2026-03-25

## Pattern Overview

**Overall:** Next.js 16 App Router with client-side React components

**Key Characteristics:**
- React Server Components (RSC) for page layouts
- Client-side state management with React hooks (useState, useMemo)
- Financial calculator logic encapsulated in components
- Mock data layer with type-safe property objects
- Tailwind CSS for styling with custom color scheme

## Layers

**Presentation Layer:**
- Purpose: UI components rendering property listings and analysis tools
- Location: `app/page.tsx`, `app/property/[id]/page.tsx`, analysis components
- Contains: React components (Server and Client), form inputs, result cards
- Depends on: Data layer (mock properties), utility formatters (Intl API)
- Used by: Next.js routing system

**Data Layer:**
- Purpose: Mock property data and type definitions
- Location: `lib/mock-properties.ts`
- Contains: Property type definition, MOCK_PROPERTIES array, getPropertyById function
- Depends on: Nothing (pure data)
- Used by: All pages and analysis components

**Business Logic Layer:**
- Purpose: Financial calculations for real estate investment analysis
- Location: `app/property/[id]/DealAnalysis.tsx`, `app/property/[id]/BRRRRAnalysis.tsx`
- Contains: useMemo hooks for metric calculations, input validation via toNumber()
- Depends on: Shared financial state from PropertyAnalysisClient
- Used by: Property detail page

**State Management:**
- Purpose: Shared financial inputs across multiple analysis tools
- Location: `app/property/[id]/PropertyAnalysisClient.tsx`
- Contains: SharedFinancialInputs type, SharedFinancialSetters type, central state holders
- Depends on: Nothing
- Used by: DealAnalysis and BRRRRAnalysis components

## Data Flow

**Property Listing Page:**

1. User navigates to `/` (home)
2. Home component loads MOCK_PROPERTIES from `lib/mock-properties`
3. User types in search input (client-side, triggers re-render with filtered results)
4. Filtered properties displayed in grid layout
5. User clicks property card → navigates to `/property/[id]`

**Property Detail Page:**

1. Next.js resolves dynamic route parameter `[id]` from URL
2. Server component `PropertyDetailPage` fetches property via `getPropertyById(id)`
3. Returns 404 if property not found
4. Renders property metadata (address, price, beds, baths, sqft)
5. Renders DADU opportunity details (zoning, setback constraints)
6. Mounts PropertyAnalysisClient (boundary to client-side interactivity)

**Financial Analysis:**

1. PropertyAnalysisClient initializes shared state (purchasePrice, rehabCost, monthlyRent)
2. User modifies inputs in DealAnalysis or BRRRRAnalysis
3. Form onChange events update state (setters called)
4. useMemo dependencies trigger recalculation of metrics
5. ResultCard components re-render with formatted currency/percentage output
6. Shared state changes propagate to both analysis sections simultaneously

**State Management:**

- Purchase price, rehab cost, monthly rent: Managed centrally in PropertyAnalysisClient
- DealAnalysis-specific inputs: Down payment %, interest rate, loan term, tax, insurance, expenses, vacancy %
- BRRRRAnalysis-specific inputs: Carrying costs, ARV, refinance LTV %, refinance rate, original down payment %
- Both components receive and can update shared values through sharedSetters

## Key Abstractions

**Property Type:**
- Purpose: Represents a real estate listing with investment analysis metadata
- Location: `lib/mock-properties.ts` (lines 1-21)
- Pattern: TypeScript interface with nested daduOpportunity object
- Fields: price, address, location, beds, baths, sqft, description, daduOpportunity, imageClass

**Shared Financial Inputs:**
- Purpose: Central contract for financial parameters across analyses
- Location: `app/property/[id]/PropertyAnalysisClient.tsx` (lines 11-15)
- Pattern: Type definition passed as props to analysis components
- Contents: purchasePrice, rehabCost, monthlyRent (strings for input compatibility)

**Currency Formatter:**
- Purpose: Format numbers as USD currency
- Location: Used in `DealAnalysis.tsx` (line 15), `BRRRRAnalysis.tsx` (line 28)
- Pattern: `new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })`
- Usage: Applied to loan amounts, payments, cash flow values

**toNumber Helper:**
- Purpose: Safely parse string input to number with fallback
- Location: `DealAnalysis.tsx` (lines 43-46), `BRRRRAnalysis.tsx` (lines 34-37)
- Pattern: Pure function with isFinite check
- Why: Form inputs are strings; this prevents NaN propagation in calculations

**Metric Calculations:**
- Purpose: Encapsulate financial formulas (mortgage, cap rate, cash-on-cash return)
- Location: useMemo blocks in DealAnalysis (lines 63-142) and BRRRRAnalysis (lines 104-172)
- Pattern: Memoized calculations dependent on input values
- Why: Prevents recalculation on every render; dependencies array ensures updates trigger recalc

## Entry Points

**Root Page:**
- Location: `app/page.tsx`
- Triggers: Client navigates to `/`
- Responsibilities: Render property grid, manage search filter, link to property details

**Property Detail Page:**
- Location: `app/property/[id]/page.tsx`
- Triggers: Client navigates to `/property/[id]` or follows link from home
- Responsibilities: Fetch property data, render property details, mount analysis client

**Root Layout:**
- Location: `app/layout.tsx`
- Triggers: On every page load (wraps all routes)
- Responsibilities: Set page metadata (title, description), inject global fonts (Geist), render HTML structure

## Error Handling

**Strategy:** Minimal explicit error handling; relies on Next.js defaults and type safety

**Patterns:**
- `notFound()` called in PropertyDetailPage if property ID invalid (line 34)
- Type safety via TypeScript prevents null/undefined errors in data access
- No try-catch blocks; assumes mock data always valid
- Input validation via toNumber() fallbacks (prevents NaN, provides defaults)
- Form inputs validated implicitly (type="number" enforces numeric input)

## Cross-Cutting Concerns

**Logging:** None implemented (no logging framework). Development debugging via browser console only.

**Validation:**
- Input validation: HTML5 input type enforcement (type="number")
- Type validation: TypeScript compile-time checks
- Data validation: toNumber() fallbacks for string-to-number conversion

**Authentication:** Not implemented (public listing application, no auth required)

---

*Architecture analysis: 2026-03-25*
