# Technology Stack

**Analysis Date:** 2026-03-25

## Languages

**Primary:**
- TypeScript 5.x - Entire application codebase (`app/`, `lib/`)
- JSX/TSX - React component syntax throughout

**Secondary:**
- JavaScript - Module scripts (`eslint.config.mjs`, `postcss.config.mjs`)
- CSS - Tailwind utilities and custom styles

## Runtime

**Environment:**
- Node.js (version managed via npm)
- Browser runtime (Client and Server components)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- Next.js 16.2.1 - Full-stack React framework with server/client components
  - App Router (pages in `app/` directory)
  - File-based routing
  - Server components by default (e.g., `app/property/[id]/page.tsx`)
  - Client components where needed (marked with `"use client"`)

**UI & Styling:**
- React 19.2.4 - Component library
- React DOM 19.2.4 - React rendering
- Tailwind CSS 4 - Utility-first CSS framework
- Tailwind PostCSS 4 - CSS processing via PostCSS

**Fonts:**
- Geist (via `next/font/google`) - System font family from Vercel
- Geist Mono - Monospace variant

**Development:**
- TypeScript 5.x - Language and type checking
- ESLint 9 - Code linting
- ESLint Config Next 16.2.1 - Next.js specific rules

**Build/Dev:**
- PostCSS - CSS transformation pipeline
- Tailwind CSS PostCSS plugin - Processes Tailwind directives

## Key Dependencies

**Critical:**
- next@16.2.1 - Framework (rendering, routing, SSR/SSG)
- react@19.2.4 - Core UI library
- react-dom@19.2.4 - React DOM bindings

**Styling:**
- tailwindcss@4 - CSS framework (required for all styling)
- @tailwindcss/postcss@4 - Tailwind PostCSS plugin

**Development:**
- typescript@5 - Type checking
- @types/node@20 - Node.js type definitions
- @types/react@19 - React type definitions
- @types/react-dom@19 - React DOM type definitions
- eslint@9 - Linting
- eslint-config-next@16.2.1 - Next.js ESLint configuration

## Configuration

**Environment:**
- No external environment variables required
- Mock data only (`lib/mock-properties.ts`)
- No API calls or external services

**Build:**
- `tsconfig.json` - TypeScript compiler options
  - Target: ES2017
  - Strict mode enabled
  - Path aliases: `@/*` maps to project root
- `next.config.ts` - Next.js configuration (minimal/empty)
- `eslint.config.mjs` - ESLint rules (Next.js core web vitals + TypeScript)
- `postcss.config.mjs` - PostCSS plugins (Tailwind CSS)

## Platform Requirements

**Development:**
- Node.js (version not pinned in package.json)
- npm (included with Node.js)
- Modern browser (ES2017 target)

**Production:**
- Node.js runtime (for Next.js server)
- Or: Static export via `npm run build` for static hosting (Vercel, Netlify, etc.)
- Modern browser support (ES2017)

---

*Stack analysis: 2026-03-25*
