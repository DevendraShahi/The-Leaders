# Changelog

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
