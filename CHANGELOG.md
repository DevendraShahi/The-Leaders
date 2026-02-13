# Changelog

## [1.4.3] - 2026-02-13

### Added
- Production-oriented analytics stack: route view tracking API, audience/region breakdowns, and dedicated admin analytics pages (overview/content/election/audience) with collapsible sidebar groups.
- Email verification flow for newsletter subscription with OTP send/verify/resend endpoints and two-step subscribe UI.
- Structured data enhancements: global `Organization` + `WebSite` JSON-LD and detail-level JSON-LD for articles, leaders, election analyses, daily briefs, and fact checks.
- SEO audit automation via `npm run seo:audit` to catch missing metadata and schema on routes.

### Changed
- Sitemap coverage expanded and corrected for election sections and published dynamic content entries.
- Metadata quality upgraded with canonical URLs, richer descriptions, OG article/profile typing, and noindex handling for missing detail pages.
- Public leader data queries now restrict to published profiles only.
- Loader consent action buttons aligned in one row and loader overlay made scrollable on mobile.

### Fixed
- Subscribe verification sending now supports Gmail SMTP-first behavior and clearer error reporting paths.
- Resolved misleading fallback behavior where SMTP failures surfaced unrelated Resend domain errors.

## [1.4.1] - 2026-02-13

### Added
- Admin content preview for all content types (articles, election articles, leaders, history, briefs, and fact checks) with in-page related section and back-to-list flow.
- Admin content language switching improvements for headings, labels, tabs, dialogs, and table/action text.

### Changed
- Admin table UX on small screens: horizontal swipe scrolling, sticky selection column, and mobile guidance text in shared `DataTable`.
- Admin layout and custom tables updated to preserve horizontal scrolling on mobile (`content`, `users`, and `access matrix` pages).

### Removed
- Manifesto section archive background layer on homepage.

## [1.3.0] - 2026-02-07

### Added
- Multi-layout Daily Brief page with query-param preview (grid/stack/timeline) and updated editorial header.
- Redesigned Fact Checks experience with premium cards and dossier-style detail view.
- New GSAP-based premium cursor for global interaction polish.

### Changed
- Image presentation standardized for election content cards and detail pages (square hero for fact checks).
- Election analysis detail layout refined for readability and hierarchy.
- ESLint configuration tuned to reduce hard failures while preserving warnings.
- Chart tooltips refactored to avoid render-time component creation warnings.

### Removed
- Deleted temporary scripts and draft data folders (`temp_scripts`, `temp_districts`) and old merge helper.

### Fixed
- Unescaped entity lint failures across multiple pages.
- Bundle analyzer import adjusted to ESM in `next.config.ts`.

## [1.1.0] - 2026-02-03

### Fixed
- Resolved Next.js serialization error when passing `ObjectId` from Server Components to Client Components in `getSettings`.
- Fixed build error in `BilingualRichText` component due to incorrect prop name (`content` -> `value`).
- Fixed build error in `HistoryForm` due to missing `ImageIcon` import.
- Resolved `setState` in `useEffect` warnings in `PremiumLoader` and `TopProgressBar` components.
- Removed debug console logs from production code.

### Optimized
- Improved code quality by addressing linting issues.
- Optimized performance settings in `next.config.ts`.

### Changed
- Standardized imports in Admin components.
