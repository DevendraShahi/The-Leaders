# The Leaders: core news architecture

The live product has three content domains: articles, leaders and daily briefs.
Website pages, mobile read APIs and admin CRUD share the existing MongoDB data.
Retiring a feature removes its routes and fetchers; this release never drops a
collection, deletes published content, or resets an admin account.

## Resource boundaries

- Public HTML is prerendered/ISR (six-hour fallback); content writes invalidate
  affected page paths and repository tags. Daily data has a one-hour cache.
- Successful public JSON uses browser max-age 60s, CDN s-maxage 3600s and
  stale-while-revalidate 86400s. Error responses are no-store.
- Detail routes generate on demand and cache. Listings use bounded database
  pagination (maximum 50 items, page 1000); home uses eight articles/eight briefs.
- Search queries inspect titles/excerpts/authors, not every article body. Results
  are capped. The author directory uses one cached dataset, then filters locally.
- Article/leader list payloads exclude large detail bodies and timelines.
- Public traffic has no authentication middleware or authentication SDK. Website
  admin offers Clerk and the existing database email/password login. Clerk is
  scoped to admin pages and web admin/auth APIs. Browser writes require same origin.
  Password login stores its scoped 12-hour session in an HttpOnly, SameSite=Strict
  cookie (Secure in production), and sign-out clears it before signing out of Clerk.
  An explicit native bearer takes precedence, followed by a valid password cookie,
  then Clerk. Expired password cookies fall back to Clerk. Mobile retains password/bearer
  sessions at `/api/v1/auth/*`.
  Clerk identities must match an active MongoDB admin by `clerkId`, or link once
  through their verified primary email to an existing active, unlinked account.
  New Clerk signups receive no admin access. Roles and permissions stay in MongoDB.
- Admin/private responses are never publicly cached. Authenticated writes always
  check current active-admin permissions; client caching does not authorize writes.
- The admin dashboard contains only permission-aware workspace shortcuts and makes
  no dashboard data requests. Its former `/api/admin/stats` endpoint returns an
  uncacheable HTTP 410 without database access, including for older open clients.
  Admin navigation disables prefetching; analytics loads only on its own pages.
- Mobile public queries remain fresh for 15 minutes, with no focus/reconnect
  refresh loop. Admin status has five-minute freshness; idle polling is off.
- Studio has daily drafts and the post editor. Daily drafts refresh explicitly.
  New-caption saves refresh after the write. There is no unattended suggestion feed.
- Prefetch is disabled on primary news/card links. The global animated loading
  gate and mouse cursor effect are removed. Images use WebP and a smaller set of
  variants with a one-day minimum image cache.

## Retired

Election maps, candidates, snapshots, parties, manifestos, fact checks, history,
column modules, election news/trend fetchers, Perplexity import/rollback, broad
content import, legacy server-side social source/AI/render feeds, and seed/debug
endpoints are removed. Known old URLs rewrite to a cacheable HTTP 410 response
without database access. Daily components/repository are separated from election
code. Old manifestos, candidate assets and map files are removed from deployments.
Database records and leader party-symbol assets are preserved.

The legacy news GitHub workflow and fetch script are removed. The deployment
configuration explicitly declares no Vercel cron jobs. GitHub reported
zero active repository workflows at inspection. The Codex Studio news automation
is deleted. The daily bilingual schedule remains PAUSED, as daily content is
retained; no new automation or cloud service is created by this release.

## Publishing and maintenance

Use admin article/leader/daily editors to publish; normal content writes perform
scoped invalidation. The optional `/api/revalidate` endpoint accepts POST only,
requires a configured bearer `REVALIDATE_SECRET`, and allows only retained paths
or named content tags. Old GET/query-secret calls and broad invalidations stop.

The existing GitHub main-branch → Vercel integration performs deployment. This is
an application replacement, not a new cloud project or a database migration.
Preview/release environments must supply the existing database/media settings,
JWT_SECRET (at least 32 characters). These are server configuration, not committed credentials.
Web admin additionally requires the existing Clerk application's
`NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and server-only `CLERK_SECRET_KEY` in development
and deployment settings. Use the matching production instance keys for production;
the publishable key must be present during the build. Re-enable that Clerk instance
before testing sign-in. MongoDB must also be available for admin authorization and
content access; restoring Clerk alone does not replace the database. Web password
login/logout are available at `/api/auth/login` and `/api/auth/logout`, with the
same credential validation and rate limits as native login. Neither browser method
stores tokens in localStorage. Native sessions are unchanged.
Daily ingestion is optional and requires its server-only ingestion secret.

## Verification and limits

Run the production build, root tests/lint, mobile typecheck/lint, and mobile
functional/auth/daily/editor tests. After deployment check public page/cache
headers, retained APIs, legacy 410 responses and authenticated admin operations.
Compare Vercel origin transfer, function invocations and active CPU over an
actual traffic window. No numerical savings or universal usage ceiling is
promised: traffic, bots, image sizes, cache misses and edits affect the bill.
The Vercel owner account is required to inspect project-level cron settings and
usage; repository inspection alone cannot rule out an external scheduler.

## Local development resource usage

`npm run dev` uses Webpack and a 4 GiB JavaScript old-space limit. On this Mac,
the previous Turbopack development process reached a 12.1 GiB footprint while
spending most sampled time in JSON serialization/garbage collection without
ongoing HTTP traffic. Webpack avoids that observed development path. This
workaround does not change the production bundler or impose a total-process
memory ceiling. Production-only split-chunk overrides are disabled during dev.
Tailwind scans the website `src` directory explicitly instead of the repository
root, keeping the separate Expo application out of website class detection.
