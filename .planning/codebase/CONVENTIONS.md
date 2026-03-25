# Code Conventions

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
  ```ts
  const currencyFmt = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });
  ```

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
