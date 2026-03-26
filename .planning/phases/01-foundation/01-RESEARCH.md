# Phase 1: Foundation - Research

**Researched:** 2026-03-25
**Domain:** Auth (Better Auth), Database (Drizzle + Neon), Billing (Stripe), Email (Resend), shadcn/UI, Next.js 16
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

**shadcn Initialization**
- D-01: shadcn base style: New York
- D-02: Border radius: 6px (0.375rem) — `--radius` from UI-SPEC
- D-03: Base color: zinc
- D-04: Init command: `npx shadcn@latest init --style new-york --base-color zinc` — planner includes as explicit task; update UI-SPEC frontmatter to `shadcn_initialized: true` after running

**Email Transport**
- D-05: Email provider: Resend — native Better Auth adapter, free tier (3,000/month)
- D-06: Account not yet created — plan includes a provisioning task
- D-07: No custom domain for Phase 1 — use Resend sandbox (`onboarding@resend.dev` as sender during dev)

**External Services — All Must Be Provisioned**
- D-08: Neon Postgres — create account/project, get connection string, configure `@neondatabase/serverless` with `neon()` for serverless/edge; NOT standard `pg` driver (holds open connections, exhausts Neon's limit)
- D-09: Stripe — create account, configure test mode, create Product "Real Estate AI Pro" with monthly + annual Prices; capture Price IDs
- D-10: Stripe webhook — endpoint at `/api/v1/webhooks/stripe` (note: Better Auth's built-in stripe plugin exposes `/api/auth/stripe/webhook` — see research note on which to use); Stripe CLI for local forwarding
- D-11: Google OAuth — create Google Cloud project, enable OAuth 2.0, configure consent screen, create OAuth 2.0 client ID; two authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (dev) and `https://<vercel-url>/api/auth/callback/google` (prod)

**Environment Variables**
- D-12: Plan must produce a complete `.env.example` with all variables (see CONTEXT.md for the full list)

**Deployment**
- D-13: Vercel deployment is part of Phase 1 — phase complete only when peer investors can access a live URL
- D-14: Vercel not yet connected — plan includes: create Vercel project, connect GitHub repo, add prod env vars, trigger first deploy
- D-15: No custom domain for Phase 1 — use Vercel-assigned `.vercel.app` URL

### Claude's Discretion

- Database schema table names and column conventions (Drizzle schema design, migration naming, index strategy)
- Better Auth session configuration (session expiry duration, cookie settings)
- API route organization structure under `/api/v1/` beyond auth and billing
- Middleware vs per-route guard pattern for freemium gating — plan should follow server-enforced Route Handler pattern from STATE.md
- `next-themes` or `class` strategy for dark mode toggling (UI-SPEC specifies CSS variable approach)

### Deferred Ideas (OUT OF SCOPE)

None — discussion stayed within Phase 1 scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| AUTH-01 | User can create an account with email and password | Better Auth `emailAndPassword.enabled: true`; `signUp.email()` client method |
| AUTH-02 | User can sign in with Google OAuth | Better Auth `socialProviders.google` config; callback at `/api/auth/callback/google` |
| AUTH-03 | User receives verification email after signup; must confirm before accessing paid features | Better Auth `requireEmailVerification: true` + `sendVerificationEmail` callback with Resend |
| AUTH-04 | User can reset password via emailed link | Better Auth `sendResetPassword` callback with Resend; `requestPasswordReset` + `resetPassword` client methods |
| AUTH-05 | User session persists across browser refresh without re-login | Better Auth cookie-based sessions; 7-day default; `cookieCache.enabled: true` |
| BILL-01 | Free-tier users can run unlimited BRRRR/cash flow analyses with manual inputs | No paywall at Route Handler level for calculation endpoints; tier check only for data-pull endpoints |
| BILL-02 | Automated data pull, DADU feasibility, rent estimation gated behind paid tier | `subscription.status === "active"` check in Route Handlers before executing paid operations |
| BILL-03 | User can subscribe to paid tier via Stripe (monthly and annual) | Better Auth `@better-auth/stripe` plugin; `authClient.subscription.upgrade()` → Stripe Checkout redirect |
| BILL-04 | User can view subscription status and cancel from account settings | `authClient.subscription.list()` for status; `authClient.subscription.cancel()` for cancellation |
| BILL-05 | Each automated data lookup metered and logged per user account | `usage_log` table inserted before executing paid API call; schema includes `user_id`, `lookup_type`, `created_at` |
| BILL-06 | Free-tier user shown contextual upgrade prompt when attempting paid feature | Route Handler returns `402` with structured JSON; client reads error and renders upgrade prompt |
| API-01 | All functionality exposed via versioned REST API (`/api/v1/`) from day one | App Router Route Handlers under `app/api/v1/`; auth and billing also under `/api/v1/` where custom logic needed |
| API-02 | All external API calls made server-side only — never from client components | Route Handlers only call external APIs; client components call `/api/v1/` endpoints |
| API-03 | API design supports future mobile app and browser plugin without modification | REST conventions: JSON request/response, standard HTTP status codes, Bearer token support in headers |
| COMP-01 | Reusable component library in `/components/ui/` before any feature UI | shadcn init + custom components per UI-SPEC inventory |
| COMP-02 | Design tokens as CSS variables + dark mode from day one | `@theme inline` in `app/globals.css`; `.dark` class CSS variable switching |
| COMP-03 | Core components built before features: Button, Input, Select, Textarea, Checkbox, Radio, Card, Badge, Tooltip, Dialog, Toast, Spinner, Skeleton, EmptyState, ErrorState | shadcn provides most; Spinner, EmptyState, ErrorState are custom |
| COMP-04 | Form, layout, data display, navigation component families | FormField wrapper; PageWrapper, Section, Container, Grid, SidebarLayout; StatCard, DataTable, PropertyCard, AnalysisSummaryCard; TopNav, BottomTabBar, UserMenuDropdown, MobileMenu |
| COMP-05 | Mobile-first, tested at 375/390/768/1280px; 44×44px touch targets; no horizontal scroll | Tailwind breakpoints sm/md/lg; `min-h-[44px] min-w-[44px]` on all interactive elements |
| COMP-06 | Business logic never inside UI components | Hooks in `hooks/`; services in `lib/services/`; API in `app/api/` |
</phase_requirements>

---

## Summary

Phase 1 lays the complete infrastructure skeleton: auth, billing, database, API versioning, and the shared component library. The technology choices are all locked (Better Auth 1.5.6 + Drizzle 0.45 + Neon + Stripe + Resend). The critical discovery is that **Next.js 16 replaces `middleware.ts` with `proxy.ts`** — all route protection must use `proxy.ts` with a renamed `proxy` export function. The Better Auth Stripe plugin (`@better-auth/stripe`) handles subscription webhooks automatically at `/api/auth/stripe/webhook`, which conflicts with CONTEXT.md D-10's suggested `/api/v1/webhooks/stripe` path — the planner must choose one and document it.

The component library is large (30+ components per UI-SPEC) but shadcn provides ~10 of them via its CLI; the remaining 20+ (layout primitives, data display, navigation, custom states) must be hand-built. The metering table (`usage_log`) must be created in Wave 0 of the schema migration before any paid feature can be implemented.

**Primary recommendation:** Use Better Auth's built-in Stripe plugin webhook endpoint (`/api/auth/stripe/webhook`) rather than a custom one — it handles event parsing and signature verification automatically. The custom `/api/v1/webhooks/stripe` path from D-10 adds duplication.

---

## Standard Stack

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| better-auth | 1.5.6 | Auth framework (email/password, OAuth, session, email verification, password reset) | Native Next.js adapter, Drizzle adapter, built-in Stripe plugin; project decision from STATE.md |
| @better-auth/stripe | 1.5.6 | Stripe subscription management plugin for Better Auth | Auto-creates subscription table, handles all Stripe webhook events, exposes subscription status on session |
| drizzle-orm | 0.45.1 | ORM for Neon Postgres | Project decision; type-safe, schema-first, works with `@neondatabase/serverless` |
| drizzle-kit | 0.31.10 | Migration CLI for Drizzle | Companion to drizzle-orm; `drizzle-kit generate` + `drizzle-kit migrate` |
| @neondatabase/serverless | 1.0.2 | Neon Postgres driver for serverless environments | Required for Next.js serverless — standard `pg` driver exhausts Neon connection limits |
| stripe | 20.4.1 | Stripe Node.js SDK | Required by `@better-auth/stripe`; note: plugin requires `stripe@^20.0.0` |
| resend | 6.9.4 | Email delivery (verification, password reset) | Native Better Auth integration; free tier 3,000/month; sandbox domain for dev |
| next-themes | 0.4.6 | Dark mode provider — class strategy on `<html>` | Simplest integration with CSS variable approach specified in UI-SPEC |
| shadcn (CLI) | 4.1.0 | Component scaffolding | Generates Radix UI + Tailwind components per UI-SPEC component inventory |
| react-hook-form | 7.72.0 | Form state management | shadcn Form component depends on it; avoids controlled input re-render overhead |
| zod | 4.3.6 | Schema validation | Paired with react-hook-form via `@hookform/resolvers`; validates auth form inputs |
| @hookform/resolvers | 5.2.2 | Connects zod schemas to react-hook-form | Required adapter |
| lucide-react | 1.7.0 | Icon library | shadcn default; used throughout UI-SPEC component inventory |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| dotenv | latest | Load `.env` in Node scripts | Drizzle migration scripts only; Next.js loads env automatically |
| tsx | latest | TypeScript execution for migration scripts | Run `drizzle-kit` against TypeScript schema files |

### Installation

```bash
npm install better-auth @better-auth/stripe drizzle-orm @neondatabase/serverless stripe resend next-themes
npm install react-hook-form zod @hookform/resolvers lucide-react
npm install -D drizzle-kit tsx dotenv
npx shadcn@latest init --style new-york --base-color zinc
```

**Shadcn component installs (run after init):**
```bash
npx shadcn@latest add button input label form card alert badge separator dialog avatar tooltip select textarea checkbox radio-group skeleton toast
```

**Version verification (confirmed against npm registry 2026-03-25):**
- `better-auth`: 1.5.6 (latest stable; beta channel at 1.5.7-beta.1)
- `@better-auth/stripe`: 1.5.6
- `drizzle-orm`: 0.45.1
- `drizzle-kit`: 0.31.10
- `@neondatabase/serverless`: 1.0.2
- `stripe`: 20.4.1
- `resend`: 6.9.4
- `next-themes`: 0.4.6
- `shadcn` CLI: 4.1.0

---

## Architecture Patterns

### Recommended Project Structure

```
app/
├── api/
│   ├── auth/
│   │   └── [...all]/
│   │       └── route.ts          # Better Auth handler
│   └── v1/
│       ├── billing/
│       │   ├── checkout/route.ts # Initiate Stripe Checkout
│       │   └── portal/route.ts   # Stripe Customer Portal redirect
│       └── usage/route.ts        # Usage log endpoints
├── (auth)/
│   ├── sign-in/page.tsx
│   ├── sign-up/page.tsx
│   ├── forgot-password/page.tsx
│   ├── reset-password/page.tsx
│   └── verify-email/page.tsx
├── account/
│   └── settings/page.tsx
├── globals.css                   # Design tokens via @theme inline
└── layout.tsx                    # Root layout + providers
components/
└── ui/                           # ALL UI components live here
    ├── button.tsx
    ├── input.tsx
    ├── card.tsx
    ├── form.tsx / form-field.tsx
    ├── dialog.tsx
    ├── toast.tsx / toaster.tsx
    ├── spinner.tsx
    ├── skeleton.tsx
    ├── empty-state.tsx
    ├── error-state.tsx
    ├── page-wrapper.tsx
    ├── section.tsx
    ├── container.tsx
    ├── grid.tsx
    ├── sidebar-layout.tsx
    ├── stat-card.tsx
    ├── data-table.tsx
    ├── property-card.tsx
    ├── analysis-summary-card.tsx
    ├── top-nav.tsx
    ├── bottom-tab-bar.tsx
    ├── user-menu-dropdown.tsx
    └── mobile-menu.tsx
hooks/
├── use-auth.ts                   # Session access wrapper
└── use-subscription.ts           # Subscription status wrapper
lib/
├── auth.ts                       # Better Auth server instance
├── auth-client.ts                # Better Auth client instance
├── db.ts                         # Drizzle db instance (neon-http)
├── db-migrate.ts                 # Direct connection for migrations
└── schema/
    ├── index.ts                  # Re-exports all tables
    ├── auth.ts                   # Better Auth generated tables
    ├── usage-log.ts              # usage_log table
    └── relations.ts              # Drizzle relations
proxy.ts                          # Next.js 16 route protection (replaces middleware.ts)
```

### Pattern 1: Better Auth Server Configuration

**What:** Central auth instance in `lib/auth.ts` with all plugins configured.

```typescript
// lib/auth.ts
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { stripe } from "@better-auth/stripe";
import { db } from "./db";
import Stripe from "stripe";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-11-17.clover",
});

export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      // Do NOT await — prevents timing attacks
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: user.email,
        subject: "Verify your email",
        html: `<a href="${url}">Verify your email</a>`,
      });
    },
    sendResetPassword: async ({ user, url }) => {
      resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL!,
        to: user.email,
        subject: "Reset your password",
        html: `<a href="${url}">Reset your password</a>`,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,   // 7 days
    updateAge: 60 * 60 * 24,        // refresh after 1 day
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,               // 5-minute cache
    },
  },
  plugins: [
    nextCookies(),
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      subscription: {
        enabled: true,
        plans: [
          {
            name: "pro",
            priceId: process.env.STRIPE_PRICE_ID_MONTHLY!,
            annualDiscountPriceId: process.env.STRIPE_PRICE_ID_ANNUAL,
          },
        ],
      },
    }),
  ],
});
```

### Pattern 2: Neon Database Connection (Dual-Connection Strategy)

**What:** Two connections — pooled for application queries, direct for migrations.

```typescript
// lib/db.ts — application queries (serverless-safe)
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL!);
export const db = drizzle({ client: sql, schema });

// lib/db-migrate.ts — migrations only (direct connection)
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

const sql = neon(process.env.DATABASE_URL_UNPOOLED!);
export const dbMigrate = drizzle({ client: sql });
```

**drizzle.config.ts:**
```typescript
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL_UNPOOLED!,  // Direct for migrations
  },
});
```

### Pattern 3: Next.js 16 Proxy for Route Protection

**What:** `proxy.ts` (replaces deprecated `middleware.ts`) with lightweight cookie check.

```typescript
// proxy.ts — Next.js 16 route protection
import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

export default function proxy(request: NextRequest) {
  const sessionCookie = getSessionCookie(request);
  const { pathname } = request.nextUrl;

  const protectedPaths = ["/account"];
  const authPaths = ["/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/verify-email"];

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAuth = authPaths.some((p) => pathname.startsWith(p));

  if (isProtected && !sessionCookie) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }
  if (isAuth && sessionCookie) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/account/:path*", "/sign-in", "/sign-up", "/forgot-password", "/reset-password", "/verify-email"],
};
```

**Critical note:** Cookie presence ≠ valid session. Route Handlers and Server Components must call `auth.api.getSession({ headers: await headers() })` for authoritative session validation.

### Pattern 4: Freemium Gating in Route Handlers

**What:** Server-enforced tier check before executing paid operations. Never trust the client.

```typescript
// app/api/v1/[paid-feature]/route.ts
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // 1. Authenticate
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Check subscription tier (via Better Auth Stripe plugin)
  const subscriptions = await auth.api.listActiveSubscriptions({
    query: { referenceId: session.user.id },
  });
  const isPro = subscriptions.some(
    (sub) => sub.status === "active" || sub.status === "trialing"
  );

  if (!isPro) {
    return NextResponse.json(
      { error: "upgrade_required", message: "This feature requires a Pro subscription." },
      { status: 402 }
    );
  }

  // 3. Log usage BEFORE executing (per STATE.md requirement)
  await db.insert(usageLog).values({
    userId: session.user.id,
    lookupType: "public_records",
    createdAt: new Date(),
  });

  // 4. Execute paid operation
  // ...
}
```

### Pattern 5: Usage Logging Schema

**What:** `usage_log` table that must exist before any paid feature can execute.

```typescript
// lib/schema/usage-log.ts
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const usageLog = pgTable("usage_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  lookupType: text("lookup_type").notNull(),  // "public_records" | "rent_estimate" | "dadu_feasibility"
  propertyAddress: text("property_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Pattern 6: Better Auth Route Handler Mount

**What:** Catch-all route that mounts Better Auth in Next.js App Router.

```typescript
// app/api/auth/[...all]/route.ts
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth);
```

**This single file handles all auth routes including:**
- `/api/auth/sign-in` — email/password sign-in
- `/api/auth/sign-up` — account creation
- `/api/auth/callback/google` — Google OAuth callback
- `/api/auth/send-verification-email` — resend verification
- `/api/auth/verify-email` — verify email token
- `/api/auth/forget-password` — password reset request
- `/api/auth/reset-password` — password reset confirm
- `/api/auth/stripe/webhook` — Stripe webhook (when Stripe plugin active)

### Pattern 7: Root Layout with Providers

**What:** Wrap application with session and theme providers.

```typescript
// app/layout.tsx
import { ThemeProvider } from "next-themes";
// Better Auth does not require a context provider at root level for RSC
// Session is read per-request via auth.api.getSession()
// Client components use authClient directly (nano-store based)

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Anti-Patterns to Avoid

- **Using `middleware.ts` in Next.js 16:** Deprecated — use `proxy.ts` with `export default function proxy(...)`. The `middleware.ts` still works but generates deprecation warnings.
- **Standard `pg` driver with Neon:** Holds open connections; exhausts Neon's connection limit under Next.js serverless. Always use `@neondatabase/serverless` with `neon()`.
- **Awaiting email sends in auth callbacks:** Creates a timing attack vector. Fire-and-forget pattern: `resend.emails.send(...)` without `await`.
- **Freemium gating only in the UI:** Any client-side check is bypassable. The Route Handler is the enforcement boundary.
- **Checking subscription in `proxy.ts`:** `proxy.ts` runs on every request — a DB call here would be catastrophically slow. Cookie presence check only; full validation in Route Handlers.
- **Using `DATABASE_URL` (pooled) for Drizzle migrations:** Pooled connections drop between transactions; Drizzle `migrate` requires a persistent connection. Use `DATABASE_URL_UNPOOLED` for `drizzle-kit`.
- **Inserting usage_log after the API call:** If the paid API call fails after insertion, you still charged the user. Insert before calling. If the API call fails, the log entry documents the attempt — acceptable.
- **Hardcoding design tokens outside `app/globals.css`:** Tailwind v4 has no `tailwind.config.*` — all tokens must go in `@theme inline {}` in `globals.css`.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Session management, JWT, cookie signing | Custom session table + JWT library | Better Auth | Timing-safe comparison, CSRF protection, token rotation already handled |
| Google OAuth callback + PKCE | Custom OAuth flow | Better Auth `socialProviders.google` | OAuth 2.0 PKCE, state parameter, nonce, token exchange — all handled |
| Email verification token generation | Custom token table + cron cleanup | Better Auth `requireEmailVerification` | Token hashing, expiry, single-use enforcement |
| Password reset tokens | Custom reset token flow | Better Auth `sendResetPassword` | Same as above; also prevents user enumeration via timing |
| Stripe webhook signature verification | Custom HMAC verification | `@better-auth/stripe` plugin or `stripe.webhooks.constructEvent()` | Replay attack protection, signature verification — non-trivial to get right |
| Subscription status caching | Custom subscription table | `@better-auth/stripe` plugin | Creates `subscription` table, syncs all lifecycle events automatically |
| shadcn component CSS | Custom component CSS from scratch | `npx shadcn@latest add [component]` | Radix UI handles ARIA, keyboard navigation, focus trapping — months of work |
| Form validation | Custom regex + error state | `zod` + `react-hook-form` | Async validation, nested objects, array fields, type inference |
| Dark mode system preference | Custom `prefers-color-scheme` listener | `next-themes` | SSR flash prevention, system preference sync, class toggling on `<html>` |

**Key insight:** Auth and billing are security-critical code paths where DIY attempts reliably miss edge cases (timing attacks, CSRF, replay attacks, token leakage). The entire stack (Better Auth + Stripe plugin + Resend) is designed to work together — the integration cost is low and the correctness benefit is high.

---

## Common Pitfalls

### Pitfall 1: Next.js 16 Middleware/Proxy Naming

**What goes wrong:** Developer writes `middleware.ts` with `export default function middleware(...)` — this still compiles but generates deprecation warnings and may break in a future Next.js version.

**Why it happens:** All Next.js docs before October 2025 reference `middleware.ts`. Training data predates this change.

**How to avoid:** Create `proxy.ts` at project root with `export default function proxy(request: NextRequest)`. Rename the export to `proxy`.

**Warning signs:** Console warning "middleware.ts is deprecated, rename to proxy.ts"

### Pitfall 2: Neon Connection Limit Exhaustion

**What goes wrong:** App works fine locally but crashes in production with "too many clients" error.

**Why it happens:** Standard `pg` driver keeps connections open. Next.js serverless creates a new function instance per request, each opening a new connection. Neon's free tier has a connection limit.

**How to avoid:** Use `neon()` from `@neondatabase/serverless` and `drizzle-orm/neon-http`. This sends queries over HTTP — no persistent connections.

**Warning signs:** "too many clients already" in Neon logs; works in dev, breaks in production after moderate traffic.

### Pitfall 3: Using Pooled Connection for Migrations

**What goes wrong:** `npx drizzle-kit migrate` hangs or fails with "prepared statement does not exist" or session-level setting errors.

**Why it happens:** Neon's connection pooler (PgBouncer in transaction mode) returns connections to the pool after each transaction. Drizzle migrations require a persistent session-level connection.

**How to avoid:** Set `drizzle.config.ts` to use `DATABASE_URL_UNPOOLED` (direct connection string, no `-pooler` in the hostname). Keep this separate from the pooled `DATABASE_URL` used by the app.

**Warning signs:** Migration hangs indefinitely; "connection reset" errors during `drizzle-kit migrate`.

### Pitfall 4: Awaiting Email Sends in Better Auth Callbacks

**What goes wrong:** Users can measure response time differences between registered and unregistered emails, enabling user enumeration.

**Why it happens:** If `sendVerificationEmail` is awaited, the response time varies based on email delivery latency.

**How to avoid:** Call `resend.emails.send(...)` without `await` in all auth callbacks. The Better Auth docs explicitly warn against this.

**Warning signs:** No immediate error — it's a security issue only detectable by measuring response times.

### Pitfall 5: Better Auth Stripe Plugin vs. Custom Webhook Handler

**What goes wrong:** CONTEXT.md D-10 specifies `/api/v1/webhooks/stripe` as the webhook endpoint, but the `@better-auth/stripe` plugin automatically creates its webhook at `/api/auth/stripe/webhook`. If the plan creates a custom handler at `/api/v1/webhooks/stripe` without disabling the plugin's built-in webhook, events may be processed twice.

**Why it happens:** D-10 was written before research confirmed the plugin's built-in webhook behavior.

**How to avoid:** Use the plugin's built-in webhook endpoint `/api/auth/stripe/webhook` and point the Stripe Dashboard + Stripe CLI to that URL. Do not create a duplicate handler at `/api/v1/webhooks/stripe` for subscription lifecycle events.

**Warning signs:** Subscription status updates appear to fire twice; database constraint violations on duplicate inserts.

### Pitfall 6: Forgetting `usage_log` Must Precede Paid API Calls

**What goes wrong:** A paid API call executes but the usage log insertion fails → user gets service without a record; costs accrue without billing attribution.

**Why it happens:** Developers insert usage log after a successful API call response to confirm the call happened.

**How to avoid:** Per STATE.md: "metering table must exist before any live API call." Insert the usage log row first. Wrap both in a transaction if strong consistency is needed, but an optimistic pre-insert is acceptable for MVP.

**Warning signs:** Usage log shows fewer records than Stripe billing events.

### Pitfall 7: Tailwind v4 Token Declaration Location

**What goes wrong:** Developer creates `tailwind.config.ts` to declare custom colors/spacing — shadcn components don't pick up the tokens; design tokens are ignored.

**Why it happens:** Tailwind v4 no longer uses `tailwind.config.*` for token declaration. Tokens live in `app/globals.css` under `@theme inline {}`.

**How to avoid:** All custom design tokens (colors, border radius, shadows) go in `app/globals.css` using the `@theme inline` block. CONTEXT.md code_context explicitly states this.

**Warning signs:** Custom colors don't appear on components; `tailwind.config.ts` is created and appears to work in IDE but not at runtime.

### Pitfall 8: `async params` in Next.js 16 Route Handlers

**What goes wrong:** Route handler crashes with "params.id is not defined" or TypeScript error because `params` must be awaited.

**Why it happens:** Next.js 16 breaking change: dynamic route `params` are now async and must be awaited.

**How to avoid:** In all Route Handlers with dynamic segments: `const { id } = await params;` — not `params.id` directly.

**Warning signs:** TypeScript error on `params.id` access; "Cannot read property of undefined" at runtime.

---

## Code Examples

### Better Auth Client Instance

```typescript
// lib/auth-client.ts
// Source: https://www.better-auth.com/docs/integrations/next
import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client";

export const authClient = createAuthClient({
  plugins: [stripeClient({ subscription: true })],
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  resetPassword,
  requestPasswordReset,
  sendVerificationEmail,
} = authClient;
```

### Server-Side Session Access in Route Handler

```typescript
// Any Route Handler or Server Component
// Source: https://www.better-auth.com/docs/integrations/next
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const session = await auth.api.getSession({
  headers: await headers(),
});
// session is null if unauthenticated
// session.user.id, session.user.email available if authenticated
```

### Resend Email Send Pattern

```typescript
// Source: https://resend.com/docs/send-with-nextjs
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Fire-and-forget (no await) in auth callbacks
resend.emails.send({
  from: "onboarding@resend.dev",  // dev sandbox
  to: user.email,
  subject: "Verify your email",
  html: `<p>Click <a href="${url}">here</a> to verify your email.</p>`,
});
```

### Drizzle Schema with Better Auth Tables

```typescript
// Run: npx auth@latest generate
// Then: npx drizzle-kit generate && npx drizzle-kit migrate
// Better Auth generates: user, session, account, verification tables
// Add to lib/schema/usage-log.ts:
import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const usageLog = pgTable("usage_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  lookupType: text("lookup_type").notNull(),
  propertyAddress: text("property_address"),
  status: text("status").notNull().default("success"),  // "success" | "failed"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
```

### Upgrade Redirect via Better Auth Stripe Plugin

```typescript
// Client component — initiate Stripe Checkout
import { authClient } from "@/lib/auth-client";

async function handleUpgrade() {
  await authClient.subscription.upgrade({
    plan: "pro",
    successUrl: `${window.location.origin}/account/settings?upgraded=true`,
    cancelUrl: `${window.location.origin}/account/settings`,
  });
  // Redirects to Stripe Checkout automatically
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| `middleware.ts` / `export function middleware()` | `proxy.ts` / `export default function proxy()` | Next.js 16 (Oct 2025) | Must use new filename and export name; `middleware.ts` deprecated |
| `tailwind.config.ts` for tokens | `@theme inline {}` in `globals.css` | Tailwind v4 (2024) | No config file; all tokens in CSS |
| `experimental.dynamicIO` in next.config | `cacheComponents: true` | Next.js 16 | Config key renamed |
| `experimental.ppr` | Removed; replaced by Cache Components | Next.js 16 | Do not use |
| Sync `params`, `cookies()`, `headers()` | Must `await` all of these | Next.js 16 | Breaking change; TS error if not awaited |
| `next lint` command | Removed; use ESLint directly | Next.js 16 | Run `npx eslint .` instead of `next lint` |
| `stripe@<16` API version | `stripe@^20.0.0` required by `@better-auth/stripe` | `@better-auth/stripe` 1.5.x | Must use `stripe@^20.0.0` |
| Custom Stripe webhook handler | `@better-auth/stripe` plugin auto-creates at `/api/auth/stripe/webhook` | better-auth 1.x | Plugin handles all lifecycle events automatically |

**Deprecated/outdated:**
- `middleware.ts`: Deprecated in Next.js 16; rename to `proxy.ts`
- `revalidateTag(tag)` single argument: Deprecated; now requires second `cacheLife` arg
- `serverRuntimeConfig` / `publicRuntimeConfig` in `next.config`: Removed; use `.env` files

---

## Open Questions

1. **Stripe webhook endpoint conflict (D-10 vs plugin auto-endpoint)**
   - What we know: CONTEXT.md D-10 specifies `/api/v1/webhooks/stripe`; Better Auth Stripe plugin auto-creates `/api/auth/stripe/webhook`
   - What's unclear: Does the user want a custom endpoint in addition to the plugin's, or should we just use the plugin's built-in endpoint?
   - Recommendation: Use the plugin's built-in endpoint (`/api/auth/stripe/webhook`) — point Stripe CLI to that URL. Document the discrepancy with D-10 in the plan for user awareness. This avoids duplicate event processing.

2. **`usage_log` transaction atomicity**
   - What we know: STATE.md requires usage log inserted before paid API call; HTTP-mode Neon driver is optimized for single non-interactive transactions
   - What's unclear: Whether to wrap usage_log insert + paid API call in a single DB transaction (API call is external, cannot be rolled back)
   - Recommendation: Pre-insert usage_log row with `status: "pending"`, execute paid API call, update row to `status: "success"` or `status: "failed"`. Two round trips but gives full auditability.

3. **Better Auth Stripe plugin subscription tier naming**
   - What we know: Plugin plan `name` must match across `authClient.subscription.upgrade({ plan: "pro" })` and the plans array in `auth.ts`
   - What's unclear: Whether "pro" is a reserved name or arbitrary
   - Recommendation: Use `name: "pro"` (matches UI-SPEC copy "Pro plan") — arbitrary string, no reserved names.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Everything | ✓ | v24.14.1 | — |
| npm | Package installation | ✓ | 11.11.0 | — |
| git | Version control | ✓ | 2.50.1 | — |
| Stripe CLI | Local webhook forwarding | ✗ | — | Cannot test webhooks locally without it; plan must include install step |
| Vercel CLI | Deployment automation | ✗ | — | Manual Vercel dashboard deploy is acceptable (D-14 notes browser steps) |
| Neon CLI | Database provisioning | ✗ | — | Manual Neon dashboard provisioning acceptable; documented in plan |
| Neon Postgres account | Database | ✗ | — | Must be provisioned; no fallback — blocking |
| Stripe account | Billing | ✗ | — | Must be provisioned; no fallback — blocking |
| Resend account | Email | ✗ | — | Must be provisioned; no fallback — blocking |
| Google Cloud project | OAuth | ✗ | — | Must be provisioned; no fallback — blocking |

**Missing dependencies with no fallback (blocking):**
- Neon Postgres account — plan must include provisioning task with step-by-step instructions
- Stripe account + Product + Prices — plan must include provisioning task
- Resend account + API key — plan must include provisioning task
- Google Cloud OAuth credentials — plan must include provisioning task with both redirect URIs

**Missing dependencies with fallback:**
- Stripe CLI — install via `brew install stripe/stripe-cli/stripe` (macOS); plan includes install step; alternatively test webhook handling via `stripe trigger` command after CLI install

---

## Validation Architecture

### Test Framework

| Property | Value |
|----------|-------|
| Framework | None installed — Wave 0 must add |
| Config file | none — see Wave 0 |
| Quick run command | `npx jest --testPathPattern=<file> --no-coverage` (after install) |
| Full suite command | `npx jest --coverage` |

**Recommended framework:** Jest + `@testing-library/react` for component tests; no E2E in Phase 1 (too early, no user-facing feature UI beyond auth forms).

### Phase Requirements → Test Map

| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| AUTH-01 | Email/password account creation returns session | unit | `jest tests/auth.test.ts -t "sign up"` | ❌ Wave 0 |
| AUTH-02 | Google OAuth callback completes (mock) | unit (mocked) | `jest tests/auth.test.ts -t "google oauth"` | ❌ Wave 0 |
| AUTH-03 | Verification email is sent on sign-up | unit (mocked Resend) | `jest tests/auth.test.ts -t "verification email"` | ❌ Wave 0 |
| AUTH-04 | Password reset email sent; token redeemable | unit (mocked Resend) | `jest tests/auth.test.ts -t "password reset"` | ❌ Wave 0 |
| AUTH-05 | Session cookie persists; `getSession` returns user | unit | `jest tests/auth.test.ts -t "session persistence"` | ❌ Wave 0 |
| BILL-03 | Upgrade route returns Stripe Checkout URL | unit (mocked Stripe) | `jest tests/billing.test.ts -t "upgrade"` | ❌ Wave 0 |
| BILL-04 | Subscription status endpoint returns correct tier | unit (mocked DB) | `jest tests/billing.test.ts -t "subscription status"` | ❌ Wave 0 |
| BILL-05 | Usage log row inserted before paid operation | unit | `jest tests/usage-log.test.ts` | ❌ Wave 0 |
| BILL-06 | Paid Route Handler returns 402 for free tier | unit | `jest tests/gating.test.ts -t "402 free tier"` | ❌ Wave 0 |
| API-01 | `/api/v1/` routes return JSON with correct Content-Type | smoke | `jest tests/api-smoke.test.ts` | ❌ Wave 0 |
| COMP-01 | All shadcn components render without error | unit (RTL) | `jest tests/components/*.test.tsx` | ❌ Wave 0 |

### Sampling Rate

- **Per task commit:** `npx jest --testPathPattern=<changed-file-tests> --no-coverage`
- **Per wave merge:** `npx jest --coverage`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps

- [ ] `jest.config.ts` — Jest configuration with TypeScript + Next.js support
- [ ] `jest.setup.ts` — `@testing-library/jest-dom` setup
- [ ] `tests/auth.test.ts` — AUTH-01 through AUTH-05
- [ ] `tests/billing.test.ts` — BILL-03, BILL-04
- [ ] `tests/usage-log.test.ts` — BILL-05
- [ ] `tests/gating.test.ts` — BILL-06
- [ ] `tests/api-smoke.test.ts` — API-01
- [ ] `tests/components/` — COMP-01 component render tests
- [ ] Framework install: `npm install -D jest @testing-library/react @testing-library/jest-dom jest-environment-jsdom ts-jest`

---

## Project Constraints (from CLAUDE.md)

These directives are MANDATORY across all plans and implementation:

1. **API-first:** REST API (`/api/v1/`) must support web, mobile, and browser plugin — no web-only shortcuts
2. **Variable data costs:** Live API calls must be metered per paid user — no unbounded free lookups; usage_log table required
3. **TypeScript strict mode:** All code passes strict TS checks (`tsconfig.json` already set)
4. **React 19 + Next.js 16 App Router only:** No Pages Router; all Route Handlers in `app/api/`
5. **Tailwind v4 via PostCSS:** No `tailwind.config.*`; tokens in `@theme inline` in `globals.css`
6. **Component library:** ALL UI in `/components/ui/` — no one-off styled components anywhere
7. **Business logic separation:** Hooks (`hooks/`), services (`lib/services/`), API (`app/api/`) — never inside UI components
8. **Naming conventions:** React components PascalCase `.tsx`; data/utility files kebab-case `.ts`; routes lowercase
9. **Geist font:** Already loaded in `app/layout.tsx` via `next/font/google` — do not add again
10. **No `try/catch` pattern observed:** Current codebase uses `toNumber()` fallbacks; new async code should handle errors explicitly via response status codes
11. **AGENTS.md enforcement:** Read `node_modules/next/dist/docs/` before writing any Next.js code — breaking changes from prior versions exist
12. **GSD workflow:** All edits through GSD commands (`/gsd:execute-phase`) — no direct repo edits outside workflow

---

## Sources

### Primary (HIGH confidence)

- [Better Auth official docs — Installation](https://www.better-auth.com/docs/installation) — env vars, Next.js App Router setup, Drizzle adapter
- [Better Auth official docs — Email/Password](https://www.better-auth.com/docs/authentication/email-password) — sign up/in, verification, password reset
- [Better Auth official docs — Session Management](https://www.better-auth.com/docs/concepts/session-management) — cookie config, expiry, cookieCache
- [Better Auth official docs — Next.js Integration](https://better-auth.com/docs/integrations/next) — proxy.ts pattern, server-side session, client setup
- [Better Auth official docs — Drizzle Adapter](https://better-auth.com/docs/adapters/drizzle) — schema generation, CLI commands
- [Better Auth official docs — Stripe Plugin](https://www.better-auth.com/docs/plugins/stripe) — subscription config, webhook events, database columns
- [Resend official docs](https://resend.com/docs/send-with-nextjs) — send() signature, sandbox addresses, API key pattern
- [Neon official docs — Connection Pooling](https://neon.com/docs/connect/connection-pooling) — pooled vs unpooled, when to use each
- [Drizzle ORM official docs — Neon setup](https://orm.drizzle.team/docs/get-started/neon-new) — neon-http driver, migration commands
- [Next.js 16 release blog](https://nextjs.org/blog/next-16) — proxy.ts breaking change, async params, removed features

### Secondary (MEDIUM confidence)

- [npm registry — all package versions](https://www.npmjs.com/) — verified 2026-03-25; all versions confirmed current
- WebSearch: Better Auth Next.js middleware/proxy pattern — confirmed proxy.ts approach from multiple sources

### Tertiary (LOW confidence)

- None — all critical claims verified against official sources

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified against npm registry; all library integrations verified against official docs
- Architecture: HIGH — patterns drawn from official Next.js 16 blog and Better Auth integration docs
- Pitfalls: HIGH — Next.js 16 breaking changes from official release notes; Neon pooling from official docs; auth timing attack from Better Auth docs
- Component library: HIGH — shadcn component list from UI-SPEC; installation from shadcn official docs

**Research date:** 2026-03-25
**Valid until:** 2026-04-25 (stable libraries; Next.js 16 released Oct 2025 so API is settled)
