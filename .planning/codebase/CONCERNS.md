# Concerns

## Tech Debt

### Hardcoded Mock Data
- `lib/mock-properties.ts` is the only data source — no database, no API
- All property data is static; adding/editing properties requires code changes
- Properties hardcoded for Oregon only

### Duplicated Financial Logic
- `currencyFmt` and `percentFmt` formatters defined independently in both `DealAnalysis.tsx` and `BRRRRAnalysis.tsx`
- `toNumber()` helper duplicated in both files
- No shared `lib/formatters.ts` or `lib/calculations.ts`

### String-Based Form State
- All numeric inputs stored as `string` in `useState` and converted on use
- No input validation or range clamping — user can enter negative rates, 200% vacancy, etc.

## Known Bugs

### Division by Zero Risk
- Cash-on-cash return calculation divides by total cash invested — if user sets down payment to 0, denominator is 0
- No guard in place

### Inconsistent Shared Defaults
- `monthlyRent` initialized as `0.7%` of purchase price (`initialPurchasePrice * 0.007`) — not surfaced to user as a formula
- Rehab cost hardcoded to `$15,000` (`DEFAULT_REHAB_COST`) regardless of property size or condition

## Security

### No Input Sanitization
- Form inputs fed directly into calculations — no bounds checking
- No XSS risk (no server rendering of user input) but bad UX for nonsensical values

### No Environment Config
- No `.env` files, no secrets management — acceptable now (no API keys), but will need setup before any backend integration

## Performance

### Redundant Formatter Instantiation
- `Intl.NumberFormat` objects created at module level (not inside components) — this is fine, but pattern should stay consistent if more are added

### O(n) Client-Side Search
- `app/page.tsx` filters all properties on every keystroke via `useMemo`
- Works fine for mock data size; will not scale to thousands of properties

## Fragile Areas

### State Coordination
- `PropertyAnalysisClient` passes shared state (purchase price, rehab cost, monthly rent) to both `DealAnalysis` and `BRRRRAnalysis` via prop drilling
- Adding a third analysis tab requires threading new props through the client wrapper
- No context or state management library — will become unwieldy at scale

### Floating Point Math
- All financial calculations use native JS floats — potential for floating point drift in edge cases (e.g., very large/small mortgage amounts)

### `imageClass` Field
- Properties in mock data use a `imageClass` string for gradient backgrounds (e.g., `"from-blue-400 to-purple-500"`)
- Tailwind v4 purges unused classes at build time — dynamic class names like this can break if not allowlisted

## Missing Features (Scope Gaps)

- No property image upload or real photo support
- No favorites / saved properties
- No comparison view (side-by-side properties)
- No export to PDF or spreadsheet
- No mobile-optimized layout for the analysis tabs
- No filtering by beds/baths/price range on listing page

## Dependencies at Risk

| Package | Version | Risk |
|---------|---------|------|
| `next` | 16.2.1 | Very new (breaking changes from v15) — see `AGENTS.md` warning |
| `react` | 19.2.4 | Very new — some ecosystem packages not yet compatible |
| `tailwindcss` | v4 | Major API changes from v3 — PostCSS config differs |

## No Tests
- Zero test coverage — see `TESTING.md`
- Financial calculation bugs will be silent until manual QA
