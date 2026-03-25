@AGENTS.md

<!-- GSD:project-start source:PROJECT.md -->
## Project

**Real Estate Investment Analysis Platform (TBD name)**

A SaaS platform for real estate investors and wholesalers that eliminates the research legwork behind deal analysis. Enter any address and the platform automatically pulls public records, GIS, and zoning data, then runs BRRRR and DADU/ADU feasibility analysis with rent estimates — delivering a complete investment picture in under 60 seconds. Piloting in Pacific NW markets (OR/WA) where DADU/ADU activity is high and public data is accessible.

**Core Value:** Any address → complete investment analysis in under 60 seconds, without manual research.

### Constraints

- **API-first**: REST API must support web, mobile, and browser plugin from day one — do not build web-only shortcuts that break future clients
- **Variable data costs**: Live API calls (county records, Rentcast) must be metered per paid user — no unbounded free lookups
- **DADU data maintainability**: Zoning rules DB must be easy to update per market as rules change — do not hardcode zoning logic into app code
- **Market scoping**: Launch with 4 Pacific NW county-level markets (King, Snohomish, Pierce, Multnomah); data pipeline architecture must support adding new markets without code changes
- **Founder bandwidth**: Part-time build — phases should deliver working, testable features early so peer feedback can happen at each step
<!-- GSD:project-end -->

<!-- GSD:stack-start source:codebase/STACK.md -->
## Technology Stack

## Languages
- TypeScript 5.x - Entire application codebase (`app/`, `lib/`)
- JSX/TSX - React component syntax throughout
- JavaScript - Module scripts (`eslint.config.mjs`, `postcss.config.mjs`)
- CSS - Tailwind utilities and custom styles
## Runtime
- Node.js (version managed via npm)
- Browser runtime (Client and Server components)
- npm
- Lockfile: `package-lock.json` (present)
## Frameworks
- Next.js 16.2.1 - Full-stack React framework with server/client components
- React 19.2.4 - Component library
- React DOM 19.2.4 - React rendering
- Tailwind CSS 4 - Utility-first CSS framework
- Tailwind PostCSS 4 - CSS processing via PostCSS
- Geist (via `next/font/google`) - System font family from Vercel
- Geist Mono - Monospace variant
- TypeScript 5.x - Language and type checking
- ESLint 9 - Code linting
- ESLint Config Next 16.2.1 - Next.js specific rules
- PostCSS - CSS transformation pipeline
- Tailwind CSS PostCSS plugin - Processes Tailwind directives
## Key Dependencies
- next@16.2.1 - Framework (rendering, routing, SSR/SSG)
- react@19.2.4 - Core UI library
- react-dom@19.2.4 - React DOM bindings
- tailwindcss@4 - CSS framework (required for all styling)
- @tailwindcss/postcss@4 - Tailwind PostCSS plugin
- typescript@5 - Type checking
- @types/node@20 - Node.js type definitions
- @types/react@19 - React type definitions
- @types/react-dom@19 - React DOM type definitions
- eslint@9 - Linting
- eslint-config-next@16.2.1 - Next.js ESLint configuration
## Configuration
- No external environment variables required
- Mock data only (`lib/mock-properties.ts`)
- No API calls or external services
- `tsconfig.json` - TypeScript compiler options
- `next.config.ts` - Next.js configuration (minimal/empty)
- `eslint.config.mjs` - ESLint rules (Next.js core web vitals + TypeScript)
- `postcss.config.mjs` - PostCSS plugins (Tailwind CSS)
## Platform Requirements
- Node.js (version not pinned in package.json)
- npm (included with Node.js)
- Modern browser (ES2017 target)
- Node.js runtime (for Next.js server)
- Or: Static export via `npm run build` for static hosting (Vercel, Netlify, etc.)
- Modern browser support (ES2017)
<!-- GSD:stack-end -->

<!-- GSD:conventions-start source:CONVENTIONS.md -->
## Conventions

## Language & Runtime
- TypeScript with strict mode (`tsconfig.json`)
- React 19 with Next.js 16 App Router
- All component files use `.tsx` extension; data/utility files use `.ts`
## Naming Conventions
### Files
- React components: PascalCase (`DealAnalysis.tsx`, `BRRRRAnalysis.tsx`, `PropertyAnalysisClient.tsx`)
- Data/utility files: kebab-case (`mock-properties.ts`)
- Next.js route files: lowercase (`page.tsx`, `layout.tsx`)
### Variables & Functions
- camelCase for variables, functions, and hooks (`toNumber`, `currencyFmt`, `percentFmt`)
- PascalCase for types and interfaces (`DealAnalysisProps`, `SharedFinancialInputs`, `FieldDef`)
- SCREAMING_SNAKE_CASE: not observed
### Components
- Default exports for page-level and major components
- Named exports for shared types
## Code Style
### TypeScript
- Strict types with explicit prop types (`type DealAnalysisProps = {...}`)
- `type` keyword preferred over `interface`
- Form state typed as `string` fields (converted to numbers on use via `toNumber()`)
- `useMemo` for derived financial calculations
### React Patterns
- `"use client"` directive on interactive components
- Shared state lifted to parent (`PropertyAnalysisClient`) via prop drilling
- `useState` for local form inputs, `useMemo` for computed values
- No context API, no external state management
### Numeric Handling
- Inputs stored as strings in state, parsed on calculation
- `toNumber(value: string, fallback: number)` helper used across components
- `Intl.NumberFormat` for display formatting (currency and percent)
- Example:
### Imports
- React hooks imported explicitly from "react"
- Type imports use `import type` syntax
- No barrel files or index re-exports observed
## Styling
- Tailwind CSS v4 via PostCSS
- Utility-first class composition directly in JSX
- No CSS modules, no styled-components
## Error Handling
- No try/catch patterns observed in current codebase
- No error boundaries implemented
- Form inputs use fallback defaults (`toNumber(val, fallback)`)
## ESLint
- `eslint-config-next` v16.2.1
- Config in `eslint.config.mjs`
<!-- GSD:conventions-end -->

<!-- GSD:architecture-start source:ARCHITECTURE.md -->
## Architecture

## Pattern Overview
- React Server Components (RSC) for page layouts
- Client-side state management with React hooks (useState, useMemo)
- Financial calculator logic encapsulated in components
- Mock data layer with type-safe property objects
- Tailwind CSS for styling with custom color scheme
## Layers
- Purpose: UI components rendering property listings and analysis tools
- Location: `app/page.tsx`, `app/property/[id]/page.tsx`, analysis components
- Contains: React components (Server and Client), form inputs, result cards
- Depends on: Data layer (mock properties), utility formatters (Intl API)
- Used by: Next.js routing system
- Purpose: Mock property data and type definitions
- Location: `lib/mock-properties.ts`
- Contains: Property type definition, MOCK_PROPERTIES array, getPropertyById function
- Depends on: Nothing (pure data)
- Used by: All pages and analysis components
- Purpose: Financial calculations for real estate investment analysis
- Location: `app/property/[id]/DealAnalysis.tsx`, `app/property/[id]/BRRRRAnalysis.tsx`
- Contains: useMemo hooks for metric calculations, input validation via toNumber()
- Depends on: Shared financial state from PropertyAnalysisClient
- Used by: Property detail page
- Purpose: Shared financial inputs across multiple analysis tools
- Location: `app/property/[id]/PropertyAnalysisClient.tsx`
- Contains: SharedFinancialInputs type, SharedFinancialSetters type, central state holders
- Depends on: Nothing
- Used by: DealAnalysis and BRRRRAnalysis components
## Data Flow
- Purchase price, rehab cost, monthly rent: Managed centrally in PropertyAnalysisClient
- DealAnalysis-specific inputs: Down payment %, interest rate, loan term, tax, insurance, expenses, vacancy %
- BRRRRAnalysis-specific inputs: Carrying costs, ARV, refinance LTV %, refinance rate, original down payment %
- Both components receive and can update shared values through sharedSetters
## Key Abstractions
- Purpose: Represents a real estate listing with investment analysis metadata
- Location: `lib/mock-properties.ts` (lines 1-21)
- Pattern: TypeScript interface with nested daduOpportunity object
- Fields: price, address, location, beds, baths, sqft, description, daduOpportunity, imageClass
- Purpose: Central contract for financial parameters across analyses
- Location: `app/property/[id]/PropertyAnalysisClient.tsx` (lines 11-15)
- Pattern: Type definition passed as props to analysis components
- Contents: purchasePrice, rehabCost, monthlyRent (strings for input compatibility)
- Purpose: Format numbers as USD currency
- Location: Used in `DealAnalysis.tsx` (line 15), `BRRRRAnalysis.tsx` (line 28)
- Pattern: `new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 })`
- Usage: Applied to loan amounts, payments, cash flow values
- Purpose: Safely parse string input to number with fallback
- Location: `DealAnalysis.tsx` (lines 43-46), `BRRRRAnalysis.tsx` (lines 34-37)
- Pattern: Pure function with isFinite check
- Why: Form inputs are strings; this prevents NaN propagation in calculations
- Purpose: Encapsulate financial formulas (mortgage, cap rate, cash-on-cash return)
- Location: useMemo blocks in DealAnalysis (lines 63-142) and BRRRRAnalysis (lines 104-172)
- Pattern: Memoized calculations dependent on input values
- Why: Prevents recalculation on every render; dependencies array ensures updates trigger recalc
## Entry Points
- Location: `app/page.tsx`
- Triggers: Client navigates to `/`
- Responsibilities: Render property grid, manage search filter, link to property details
- Location: `app/property/[id]/page.tsx`
- Triggers: Client navigates to `/property/[id]` or follows link from home
- Responsibilities: Fetch property data, render property details, mount analysis client
- Location: `app/layout.tsx`
- Triggers: On every page load (wraps all routes)
- Responsibilities: Set page metadata (title, description), inject global fonts (Geist), render HTML structure
## Error Handling
- `notFound()` called in PropertyDetailPage if property ID invalid (line 34)
- Type safety via TypeScript prevents null/undefined errors in data access
- No try-catch blocks; assumes mock data always valid
- Input validation via toNumber() fallbacks (prevents NaN, provides defaults)
- Form inputs validated implicitly (type="number" enforces numeric input)
## Cross-Cutting Concerns
- Input validation: HTML5 input type enforcement (type="number")
- Type validation: TypeScript compile-time checks
- Data validation: toNumber() fallbacks for string-to-number conversion
<!-- GSD:architecture-end -->

<!-- GSD:workflow-start source:GSD defaults -->
## GSD Workflow Enforcement

Before using Edit, Write, or other file-changing tools, start work through a GSD command so planning artifacts and execution context stay in sync.

Use these entry points:
- `/gsd:quick` for small fixes, doc updates, and ad-hoc tasks
- `/gsd:debug` for investigation and bug fixing
- `/gsd:execute-phase` for planned phase work

Do not make direct repo edits outside a GSD workflow unless the user explicitly asks to bypass it.
<!-- GSD:workflow-end -->

<!-- GSD:profile-start -->
## Developer Profile

> Profile not yet configured. Run `/gsd:profile-user` to generate your developer profile.
> This section is managed by `generate-claude-profile` -- do not edit manually.
<!-- GSD:profile-end -->
