# Changelog

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
