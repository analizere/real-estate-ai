# Directory Structure

## Overview

```
real-estate-ai/
├── app/                          # Next.js App Router — all routes live here
│   ├── layout.tsx                # Root layout (HTML shell, global styles)
│   ├── page.tsx                  # Home page — property listing with search
│   └── property/
│       └── [id]/                 # Dynamic route for individual property detail
│           ├── page.tsx          # Server component — data fetch + page shell
│           ├── PropertyAnalysisClient.tsx  # Client wrapper — shared state
│           ├── DealAnalysis.tsx  # Buy & Hold calculator tab
│           └── BRRRRAnalysis.tsx # BRRRR calculator tab
├── lib/
│   └── mock-properties.ts        # In-memory property data (temporary fixture)
├── public/                       # Static assets (currently empty/default)
├── .planning/                    # GSD planning documents (not shipped)
├── CLAUDE.md                     # Claude Code project instructions
├── AGENTS.md                     # Agent instructions (referenced by CLAUDE.md)
├── eslint.config.mjs             # ESLint configuration
├── next.config.ts                # Next.js configuration
├── postcss.config.mjs            # PostCSS/Tailwind configuration
├── tsconfig.json                 # TypeScript configuration
└── package.json                  # Dependencies and scripts
```

## Key Locations

| Purpose | Path |
|---------|------|
| Property listing page | `app/page.tsx` |
| Property detail route | `app/property/[id]/page.tsx` |
| Shared financial state | `app/property/[id]/PropertyAnalysisClient.tsx` |
| Deal analyzer | `app/property/[id]/DealAnalysis.tsx` |
| BRRRR analyzer | `app/property/[id]/BRRRRAnalysis.tsx` |
| Mock data | `lib/mock-properties.ts` |
| Global layout | `app/layout.tsx` |

## Routing

- `/` — Home: property grid with search
- `/property/[id]` — Detail: property info + financial analysis tabs

## Naming Conventions by Location

- `app/**` — Next.js reserved names (`page.tsx`, `layout.tsx`) or PascalCase components
- `lib/**` — kebab-case data/utility files
- Dynamic segments — `[id]` bracket notation per Next.js convention

## What's Missing

- No `src/` directory (files live at root)
- No `components/` shared component library
- No `hooks/` directory
- No `types/` or `utils/` shared modules
- No API routes (`app/api/`)
- No middleware
- No test directories
