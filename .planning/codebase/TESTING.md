# Testing

## Current State
**No test framework is configured.** There are no test files, no test scripts in `package.json`, and no testing dependencies installed.

## Gaps
- `DealAnalysis.tsx` — financial calculations (mortgage payment, NOI, cap rate, cash-on-cash) untested
- `BRRRRAnalysis.tsx` — BRRRR math (ARV, refinance proceeds, equity, ROI) untested
- `lib/mock-properties.ts` — data structure untested
- No snapshot tests for any UI components
- No integration or E2E tests

## Recommended Setup (if tests are added)

### Unit Testing
- **Vitest** — fast, TypeScript-native, compatible with Next.js
- **React Testing Library** — for component interaction tests

### Key Test Targets
1. `toNumber()` helper — edge cases (NaN, empty string, negative values)
2. Financial calculation logic in `DealAnalysis` and `BRRRRAnalysis`
3. Formatting helpers (`currencyFmt`, `percentFmt`)

### Suggested Structure (if adopted)
```
__tests__/
  lib/
    mock-properties.test.ts
  components/
    DealAnalysis.test.tsx
    BRRRRAnalysis.test.tsx
```

## CI
No CI configuration exists (no `.github/`, no `Dockerfile`, no CI YAML).
