# Matchday benchmark

Matchday has a dedicated renderer and managed content areas. Other cricket graphics continue using their existing renderers. Old Matchday drafts open in the rebuilt layout without rewriting their stored facts. Existing custom text positions are superseded by the managed composition.

## Content contract

The generated prompt and Zod importer share the same content schema:

- AI title is exactly `MATCHDAY` in English or `आजको खेल` in Nepali. An empty title is accepted only as an unfinished draft for correction in Review.
- Optional supporting sentence: at most 120 characters, plain text without markup or line breaks. Empty is the default.
- `matchday.data` is an empty object. Scores, player statistics, XIs and results do not belong in a pre-match announcement.
- Teams are catalog IDs, validated against the editor's selections. Names and crests come from the catalog, never generated text.
- Competition, match label, venue, ISO date and 24-hour Nepal time stay in separate match fields. Selected fixture facts are enforced as literals. Two games on one date remain separate fixtures.
- Unknown facts remain empty; no fabricated timestamps, sources or sample statistics. Drafts can be saved incomplete, but export requires competition, headline, venue, date and valid time.

Editors may replace the standard headline with their own copy of up to 48 characters. The prompt contract deliberately remains stricter than manual editing. Longer existing headlines are preserved and flagged for correction, not truncated.

## Composition

Portrait, square and story reserve independent areas for The Leaders brand and the top-right NPL logo, match label/title, the two team identities, date/time, venue, supporting copy and byline/credit. The venue is centered with its label above it. The bottom-right label is `NPL 2026 | Cricket`. Landscape has its own arrangement, placing teams to the right and the venue below both columns. It is not a compressed portrait.

The Stadium treatment now uses the five editor-supplied images under `public/npl`, selectable through the Matchday Stadium background dropdown. Portrait, square and story default to `TU-ground-5.png`; landscape defaults to `TU-ground-1.png`. The Editorial treatment retains its paper texture. Uploaded background photos and overlays retain supplied credits in a separate footer line. No external fetch is required for built-in artwork during export. These backgrounds are design assets, not verification of a live match or venue condition.

Crests use `object-fit: contain` within fixed image areas. Logo scale is bounded; full team names always remain visible. Placed images remain behind the information areas so stickers cannot cover essential copy.

Text is measured using the actual loaded fonts in its actual reserved area. A bounded search chooses a fitting size, with a readable minimum. English and Devanagari use different line heights. No ellipsis, line clamp, text truncation or hidden-overflow workaround is used. Content that still cannot fit fails export preflight. Manual text transforms, alignment and decorative theme splits are intentionally replaced by the managed Matchday layout.

## Verification

Run the unit/component contract tests and `node scripts/studio-matchday-audit.cjs` from the repository root. The browser benchmark starts the isolated Vite preview and uses installed Edge through Playwright. Results and preview/export PNGs are written under `.next/`.

The benchmark checks all four formats, both languages, both new treatments and legacy style routing; normal and long headlines; every distinct team pairing; maximum-length metadata; full names; logo scaling; slot overflow; slot collisions; and real PNG export dimensions. Contract tests cover missing facts, hidden headlines, invalid times, extra data, source/fixture preservation, strict AI titles and other-template isolation. This validates local Studio behavior, not production authentication or deployment.

Use the same sequence for later templates: define the content contract, reserve the layout regions, fit loaded-font text within readable bounds, then test geometry and actual exports before expanding the catalog.

Validated locally on 26 October 2026: 107 unit/component tests passed; 496 browser geometry cases passed with no overflow or slot collisions; desktop/light and mobile/dark fixture creation, import, save and reload passed; all eight format/language PNG exports have the expected dimensions. TypeScript and scoped ESLint checks passed. The whole application has not been deployed as part of this change.
