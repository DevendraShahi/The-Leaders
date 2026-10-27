# Daily Fixtures benchmark

Fixtures is now a managed daily schedule poster rather than the generic cricket card renderer. It follows the approved Matchday treatment: transparent NPL logo at top right, The Leaders identity at top left, balanced team-name font sizes, a stadium background from `/public/npl`, centered venue labels, and `NPL 2026 | Cricket` at bottom right. Editorial uses the paper treatment.

## Editor workflow

Select a Nepal date and Fixtures in the Cricket page, then choose **Create fixtures post**. The published schedule creates the complete one- or two-game day directly; editors do not need an AI response or have to choose one of the two games first. A published rest day produces a rest-day graphic without inventing participants. The optional **Use prompt instead** route remains available for a selected fixture.

Inside Match, **Fixture day · Nepal time** and **Load published games for this date** repopulate the day's rows. Each row has team dropdowns, a native Nepal-time control, and a venue. The selected background and edited facts persist with the draft. Changing a date alone does not silently rewrite existing games: loading the day is explicit, and a mixed-date post fails export preflight.

## Contract and layout

The strict prompt title is `FIXTURES` or `खेल तालिका`. Supporting copy is optional, plain text and at most 100 characters. AI output contains only the fixture list; it does not supply coordinates, design styles, scores, tosses, lineups or predictions. A selected published day makes every game, pairing, time, venue and row order literal schema values. Dropping the second game, retiming a row or substituting another match is rejected. Missing response fields may be populated from the already supplied schedule.

All rows belong to the same `matchDate`, with one or two games per page. The canonical time field is `YYYY-MM-DD · HH:mm NPT`. Unknown information remains reviewable but cannot be exported as a complete schedule. Empty lists are valid only on the supplied schedule's known rest days. Legacy drafts with more than two games are preserved but must be split into daily pages before export.

Each game has a fixed area for its own time, two crests/names and its own centered venue. Portrait, square and story stack the two games; landscape puts them alongside each other. Single games fill the available schedule area. Rest days have their own empty-state composition. Actual loaded-font measurements fit text without ellipses or clipping. All team-name slots share the same fitted font size. Images remain behind protected information areas and supplied image credits remain visible.

## Verification

`node scripts/studio-fixtures-audit.cjs` checks normal and long metadata for single games, doubleheaders and rest days, both visual treatments, four formats and both languages (96 cases). It checks overflow, collisions, balanced names, contract errors and eight real PNG exports. Artifacts are under `.next/fixtures-*`.

Local validation: 110 unit/component tests passed across eight files, all 96 browser layout cases passed, and all eight format/language PNG exports succeeded. Desktop/mobile editor checks cover direct creation, both start times, background persistence after reload, loading a single-game date, loading a rest day and returning to a doubleheader. TypeScript and scoped ESLint passed. No production deployment is included.
