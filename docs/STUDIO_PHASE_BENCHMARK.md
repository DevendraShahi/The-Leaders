# Powerplay and Partnership benchmark

Both templates use a dedicated managed composition, the established transparent NPL logo and footer, the user-supplied TU stadium backgrounds, and the Editorial paper option. Fixed text regions protect the headline, balanced team names, phase statistic, supporting facts, provenance and credits. Landscape has a separate arrangement. Font fitting runs after fonts load; incomplete content and unresolved overflow prevent export.

## Powerplay

The featured team is the batting side. The post contains its score at the confirmed end of the powerplay. `powerplayOvers` uses cricket notation and must be positive, fit within the innings limit and equal the snapshot's `overs`. A shortened match's powerplay must come from the actual match source. Production drafts never assume six overs. The renderer calculates run rate using legal balls; 3.2 overs means 20 balls.

The generated prompt fixes the headline to `POWERPLAY COMPLETE` / `पावरप्ले समाप्त`, restricts the JSON to `runs`, `wickets`, `overs` and `powerplayOvers`, and asks for no target or player scorecards. The editor omits those unrelated fields. Editors enter the powerplay duration once; it also sets the snapshot overs. Changing an established duration clears the previous score and provenance. A custom photo can be used as a background; the template does not guess an individual player for a team phase update.

## Partnership

Two different batters from the batting team share the composition, alongside the sourced stand runs and balls. The team score and overs are explicitly a snapshot at that moment. The stand cannot exceed the team total. The system never derives stand figures by adding the batters' innings scores or labels a stand unbeaten without source evidence. Individual batting innings statistics are not required by the editor or missing-fields review.

Each portrait resolves independently from an exact normalized player name and the batting team. Available portraits retain separate credits and source/license details. An unknown or unavailable photo uses the team's crest. The main portrait picker fills the first batter's name, and a separate picker fills the second batter's name. These selections do not supply match facts. The portrait visibility toggle applies to both players. Captions retain both credits.

The generated prompt fixes the headline to `THE PARTNERSHIP` / `साझेदारी`, caps plain supporting copy at 100 characters and returns only the approved fields. It forbids guessed images, layout fields, unsupported scores and inferred stand figures. Partial responses can be completed in Review; contradictory confirmed values are rejected.

## Context and verification

Both posts require a match date, core score, phase facts and a source before export. Changing the date or teams clears old phase facts, names, images and provenance. The same rule applies in import review and shared cricket styles.

- 162 focused tests across thirteen suites.
- 96 visual states covering both templates, both styles, four formats, both languages, sourced/fallback data and incomplete drafts.
- Geometry checks cover fitted text and collisions between reserved text regions.
- Desktop and mobile browser flows cover JSON import, two-player matching, save/reload, portrait visibility, duplicate partners, fixture-date reset and reduced-powerplay controls.
- 16 full PNG exports checked at 1080×1350, 1080×1080, 1080×1920 and 1920×1080 in both languages.

Run `node scripts/studio-phase-audit.cjs` for the repeatable browser/export audit. Preview statistics are illustrative. Work is local and has not been deployed.

## Partnership visual revision

Partnership now uses its own portrait-led renderer rather than the shared phase grid. Two large player images and balanced names lead into one grouped stand statistic and a compact team-score strip. The duplicate crest row and repeated explanatory labels have been removed. Artwork shows concise photo-owner attribution; full individual credits, sources and licenses remain in the generated caption and saved design data.

The shared stand is centered across both player columns: a `PARTNERSHIP` label above one `76 RUNS · 48 BALLS` line (localized for Nepali). Runs and balls are never separated into columns beneath individual players. The audit checks canvas boundaries as well as text fit and collisions.

Portrait and Story are the editor's priority formats. Story enlarges the portrait framing and reserves additional top/bottom space for interface overlays. The revised renderer was visually inspected in both languages; 24 portrait/story cases pass text-fit and collision checks, with four full-size PNG exports. Other sizes remain available but are not the focus of further design work.

Focused audit: set `STUDIO_TEMPLATES=partnership` and `STUDIO_FORMATS=portrait,story`, then run `node scripts/studio-phase-audit.cjs`.
