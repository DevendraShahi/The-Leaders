# Changelog

## [1.6.0] - 2026-02-28

### Added
- District panel party color intelligence powered by `public/map/parties.json`, including Nepali/English/wiki alias matching and normalization for cross-source party naming differences.
- FPTP candidate metadata in district panel now includes `Education` (mapped from ECN `details.qualification`) with safe fallback when missing.
- Dedicated District profile cache/query schema versioning to invalidate stale panel payloads after contract changes.
- Legacy source-label normalization path so previously cached "Local district profile dataset" labels are migrated at read time.

### Changed
- Reordered district panel sections to place **Party Wins (FPTP 2022)** below **FPTP Candidates (2082)**.
- FPTP candidate ordering in district panel now prioritizes official party rank from `src/data/political-parties2026.json` with fallback to district-level party-win ordering.
- District source labels standardized to **The Leaders Findings** (including 2021 census label variants).
- Last Election Results rows now apply party color accents for winner/runner-up context, matching panel-wide party visual language.

### Fixed
- Resolved stale district panel rendering paths where old cached source labels persisted after local label updates.
- Removed temporary candidate card dependence on `Votes` and `Rank` fields in district panel to align with current UI requirement.

## [1.5.0] - 2026-02-21

### Added
- End-to-end FPTP 2082 candidate data pipeline with fetch script (`npm run data:candidates:fptp2082`), normalized dataset exports, and lookup metadata.
- New FPTP candidate explorer with advanced filtering (party/province/district/gender/constituency), district-first ordering, party-rank-aware sorting, and candidate profile links.
- Candidate detail slug page at `/election-2026/profiles/[slug]` with expanded personal/candidacy/education/experience sections.
- Election timeline section with reusable timeline components and structured timeline datasets.
- Shared ranking/data helpers (`candidate slug`, `candidate data summary`, `fptp candidate data`, `party rank index`) for consistent candidate rendering across pages.

### Changed
- Profiles experience upgraded to dual-mode browsing (FPTP + PR) with updated summary cards and dataset context.
- PR candidate viewer redesigned to collapsible grouped cards (by party/district), with improved filtering and stable group controls.
- PR and FPTP candidate viewers now use collapsible interaction patterns with expand/collapse controls as primary navigation.
- Pagination removed from PR and FPTP candidate grids to prioritize direct grouped exploration.
- Party ordering for PR now follows the same updated party ranking source used across candidate pages.

### Fixed
- Candidate profile page now shows correct Party Rank from computed official/fallback rank index instead of inconsistent source field values.
- PR district filter handling now safely clears stale cross-page map-district selections that previously caused empty/incorrect result states.

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
