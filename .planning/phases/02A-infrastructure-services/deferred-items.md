# Deferred Items — Phase 02A

## Pre-existing Build Failures (Out of Scope)

### enrichment.ts TypeScript Strict Type Errors

**Source:** Plan 04 (DataEnrichmentService stub implementation)
**Status:** Pre-existing — present before Plan 05 execution
**Error:** `Type 'EnrichedField<null>' is not assignable to type 'EnrichedField<number>'` (lines 342–360 in lib/services/enrichment.ts)
**Impact:** `npx next build` fails TypeScript check — but `npx tsc --noEmit --skipLibCheck` passes
**Root cause:** The stub implementation uses `makeField(null, ...)` but the EnrichedProperty type declares non-nullable field types. The Plan 04 summary notes this was intentional stub design pending Phase 5 implementation.
**Resolution:** Fix in Plan 06 or Phase 05 when enrichment.ts receives real implementation with typed field values.
**Logged:** 2026-03-28 during Plan 05 execution
