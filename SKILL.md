---
name: nextjs
description: Use this skill whenever the user asks to build, scaffold, extend, review, or debug a Next.js application (App Router). Covers the full production stack — TypeScript, Server Components/Actions, Tailwind + shadcn/ui, React Hook Form + Zod, PostgreSQL + Drizzle, Better Auth, caching/rendering strategy, SEO, accessibility, testing, monitoring, code quality, and DevOps. Trigger on mentions of "Next.js app", "new project", "add a feature/page/route", "set up auth", "add a form", "database schema", "deploy to Vercel", or any request touching a file under app/, and whenever code is written for a Next.js codebase, even without explicit invocation.
---
 
# Next.js Production Stack

Opinionated defaults for building and maintaining Next.js applications. When
scaffolding a new project or adding to an existing one, follow these
conventions unless the user's existing codebase clearly does something else
— match existing patterns over this document when they conflict, and note
the deviation briefly.

## 0. Stack at a glance

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router), TypeScript, Server Components + Server Actions |
| Package manager | pnpm |
| UI | Tailwind CSS, shadcn/ui, react-icons, Motion (motion.dev) |
| Forms | React Hook Form + Zod |
| Database | PostgreSQL + Drizzle ORM |
| Auth | Better Auth, RBAC |
| Media | Cloudinary |
| Testing | Vitest (unit/integration), Playwright (e2e) |
| Monitoring | Sentry, structured logging |
| Lint/Format | ESLint, Prettier, TypeScript strict |
| CI/CD | GitHub + GitHub Actions, Vercel, preview deployments |

Never silently swap a package from this table for an alternative (e.g. Prisma
instead of Drizzle, next-auth instead of Better Auth). If the user's project
already uses a different choice, keep using it and flag the mismatch instead
of mixing two solutions for the same job.

## 1. Project setup

- Scaffold with `pnpm create next-app@latest` — TypeScript, App Router, Tailwind, ESLint all enabled, decline the `src/` directory so `app/` stays at the project root.
- Use pnpm for every install/run command (`pnpm add`, `pnpm dlx`, `pnpm dev`). Never mix in npm/yarn lockfiles.
- Initialize shadcn/ui via `pnpm dlx shadcn@latest init`, then add components on demand (`pnpm dlx shadcn@latest add button`) rather than pre-installing the whole set.
- Baseline folder shape (no `src/` — `app/` sits at the project root):
```
app/                   # routes, layouts, error/loading/not-found boundaries
components/            # shared UI (ui/ = shadcn primitives)
lib/                   # db, auth, validations, utils, rate-limit, logger
actions/               # server actions grouped by domain
hooks/
types/
drizzle/               # migrations
```

## 2. TypeScript & code quality

- `strict: true` in tsconfig, no `any` without a comment justifying it, no `@ts-ignore` without a linked issue/reason.
- ESLint (next/core-web-vitals + typescript-eslint) and Prettier configured and passing before code is considered done; run them, don't just assume.
- Prefer explicit return types on exported functions and Server Actions.
- Keep Server Components as the default; add `"use client"` only where interactivity, browser APIs, or hooks require it, and push the boundary as low (as leaf-level) as possible.
- One responsibility per file/module; colocate a route's server actions in `actions/` or an `_actions.ts` file next to the route, not inline in huge page files.
- **Architecture conventions**: keep to one place for each kind of logic — data access in `lib/db`, mutations in `actions/`, shared UI in `components/`, cross-cutting helpers in `lib/`. Follow the project's existing naming (file casing, component naming) rather than introducing a new convention partway through.
- **Code review**: treat every non-trivial change as PR-sized — a clear diff, passing lint/typecheck/tests before requesting review, and a description of what changed and why. When reviewing (human or AI-assisted), check for missing auth checks, unhandled errors, and convention drift, not just whether it runs.

## 3. Rendering, data & performance

- **Static vs dynamic rendering**: default to static; opt into dynamic (`export const dynamic = 'force-dynamic'`, `cookies()`, `headers()`) only when the route genuinely needs per-request data.
- **Data fetching**: fetch in Server Components directly; use Server Actions for mutations, not client-side fetch-to-API-route unless the consumer is external.
- **Streaming & Suspense**: wrap slow/streamable sections in `<Suspense>` with a real skeleton fallback (not a bare spinner) so the rest of the page can render and stream in immediately — this is also what `loading.tsx` provides at the route level.
- **Caching & revalidation**: use `use cache` / `unstable_cache` (per Next version) for expensive reads; invalidate precisely with `revalidatePath` / `revalidateTag` after mutations rather than reaching for `force-dynamic` to "fix" staleness.
- **Prefetching**: prefetch links users are likely to follow — `<Link>` does this automatically; don't disable it (`prefetch={false}`) without a specific reason.
- **Lazy loading & code splitting**: lazy-load below-the-fold or rarely-used client components with `next/dynamic`; avoid large client bundles from libraries only needed on one page.
- **Image & font optimization**: always use `next/image` for raster images (explicit `width`/`height` or `fill` + sized container) and `next/font` for fonts — never raw `<img>` or a `<link>` to Google Fonts.
- **Core Web Vitals**: treat LCP, CLS, INP as a real constraint — no layout-shifting late content, no unsized media, no blocking synchronous scripts.

## 4. UI

- Tailwind for styling; shadcn/ui components as the base primitives, customized via the project's theme tokens (CSS variables) rather than one-off inline overrides scattered across files.
- react-icons for iconography (pick one icon set per project, e.g. `react-icons/lu` or `/hi2`, and stay consistent).
- Motion (motion.dev, formerly Framer Motion) for animation; keep animated components client-side and small, and respect `prefers-reduced-motion`.
- Design responsively by default (mobile-first Tailwind breakpoints); don't ship a desktop-only layout.

## 5. Forms & validation

- Define one Zod schema per form/data shape; reuse the same schema for client validation (via `@hookform/resolvers/zod`) and server-side validation inside the Server Action — never trust client-only validation.
- React Hook Form (`useForm`) drives client state; on submit, call a Server Action, surface field errors from the action's structured return value (not thrown exceptions that dead-end in a generic error).
- Validate `process.env` itself with a Zod schema at startup (a `lib/env.ts`) so missing/malformed config fails fast instead of at first use.

## 6. Database (PostgreSQL + Drizzle)

- Schema lives in `lib/db/schema.ts` (or split per domain), migrations generated via `drizzle-kit generate` and applied via `drizzle-kit migrate` — never hand-edit generated migration files.
- Use a pooled connection (e.g. via the driver's pool or a provider like Neon/Supabase pooling) in serverless/edge contexts; don't open a new client per request without pooling.
- **Query optimization & N+1 prevention**: use Drizzle's relational queries (`db.query.x.findMany({ with: {...} })`) or explicit joins instead of looping and querying per row; select only the columns you need instead of `select *`-style full-row fetches; paginate/limit any query that can return an unbounded result set.
- Index columns used in `WHERE`/`ORDER BY`/joins; add them in the schema, not as an afterthought.
- Keep a backup/restore story documented for production databases (managed provider snapshots at minimum) — call this out if the user's setup has none.

## 7. Auth & security

- Better Auth for authentication (sessions, OAuth providers, email/password as needed); never hand-roll password hashing or session tokens.
- RBAC: model roles/permissions explicitly (a `role` column plus a small permission-check helper), and enforce authorization **in the Server Action / data-access layer**, not just by hiding UI — a hidden button is not access control.
- Rate limit sensitive endpoints (auth, form submissions, anything expensive) — e.g. via Upstash Redis or an equivalent token-bucket/sliding-window limiter.
- Set security headers (via `next.config.js` headers or middleware): `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, `Strict-Transport-Security`.
- Cookies: `httpOnly`, `secure`, `sameSite: 'lax'` (or `'strict'` where workable) on all auth/session cookies.
- Validate every external input (form data, query params, webhook payloads) with Zod at the boundary before it touches business logic or the database.
- Never log secrets, tokens, or full request bodies containing credentials.

## 8. SEO

- Use the Metadata API (`generateMetadata` / static `metadata` export) per route — title, description, Open Graph, Twitter card.
- Provide `app/sitemap.ts` and `app/robots.ts` generated from real route data, not a hardcoded stale list.
- Set canonical URLs via metadata `alternates.canonical`, especially on any route reachable through multiple query-string variants.
- Add JSON-LD structured data for content types that benefit (articles, products, breadcrumbs, organization) using a script tag with `type="application/ld+json"`.

## 9. Accessibility

- Semantic HTML first (`button`, `nav`, `main`, `header`, `label`) — reach for ARIA only to fill a real gap semantic HTML can't cover.
- Everything reachable and operable by keyboard alone; visible focus states (don't strip `:focus-visible` outlines without replacing them).
- Every image has meaningful `alt` (empty `alt=""` only for genuinely decorative images).
- Every form input has a real associated `<label>` (not just a placeholder).
- Check color contrast against WCAG AA at minimum for text and interactive elements.

## 10. Error handling & loading states

Every route segment that can fail or take time should have:
- `error.tsx` — segment-level error boundary with a retry action.
- `global-error.tsx` — top-level fallback for errors `error.tsx` can't catch.
- `not-found.tsx` — for 404s, including `notFound()` calls from data lookups.
- `loading.tsx` — Suspense fallback; make it a real skeleton matching the eventual layout, not a bare spinner.

## 11. Testing

- Vitest for unit tests (pure functions, schema validation, utility logic) and component tests (React Testing Library) — colocate as `*.test.ts(x)` or under `__tests__/`.
- Playwright for end-to-end flows: auth, critical user journeys, form submissions. Run against a preview deployment or local build, not against production.
- New Server Actions and validation schemas should ship with at least a basic test; don't let critical business logic go untested by default.

## 12. Monitoring & logging

- Sentry for error tracking on both client and server (instrumentation file + `sentry.client.config` / `sentry.server.config`), with source maps uploaded on deploy.
- Structured logging (JSON logs with request id, route, user id where available) instead of ad hoc `console.log`.
- Track Core Web Vitals in production (Vercel Analytics or Sentry Performance) and set up uptime monitoring on the deployed URL.

## 13. DevOps

- Git with conventional, scoped commits; protected `main` branch.
- GitHub Actions CI on every PR: install → lint → typecheck → unit tests → build (add e2e for larger changes).
- Deploy on Vercel; every PR gets a preview deployment before merge.
- Environment variables managed per-environment in Vercel, validated at boot via the Zod env schema from §5.

## 14. Media

- Cloudinary for user-uploaded/dynamic media: upload via signed, server-issued upload params (never expose the API secret client-side), and serve through Cloudinary's transformation URLs instead of re-implementing resizing.

## 15. Working conventions for Claude

When asked to add a feature in a project using this stack:
1. Check existing schema/actions/components before creating new ones — extend, don't duplicate.
2. New DB fields → update `schema.ts`, generate a migration, don't hand-edit SQL.
3. New form → Zod schema → RHF form → Server Action with server-side re-validation and an authorization check.
4. New route → decide static vs dynamic deliberately; add `loading.tsx`/`error.tsx` if missing; add metadata.
5. After a mutation, revalidate the specific path/tag affected — don't blanket-revalidate the whole app.
6. Run lint/typecheck mentally against strict mode before presenting code; flag any `any`, unchecked input, or missing auth check rather than shipping it quietly.
