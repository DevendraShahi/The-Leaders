# Toss, Playing XI and Team spotlight

The next pre-match group uses the approved managed template system: transparent NPL branding at top right, The Leaders at top left, stadium images from `/public/npl`, the Editorial paper treatment, protected content areas, source lines and `NPL 2026 | Cricket` at bottom right. `PrematchArtwork` shares the surrounding frame while giving each post a different information layout.

## Toss update

`cricket.toss` contains `winnerId` and `decision` (`bat` or `bowl`). Both can be null while unconfirmed. The winner must be one of the selected teams; it is never assumed to be the featured team. The template places the winner’s crest and full name above a large BAT FIRST/BOWL FIRST decision, with both participants and the match date in a separate context slot. Editors use dropdowns instead of a free-text result sentence.

A source and match date are required before export. Reversing the same pair preserves the actual winner’s ID. Changing the match date or selecting another pairing clears the old toss and its evidence. Legacy result text remains stored but is not interpreted as a confirmed toss result.

## Playing XI

The template uses an identity header and a protected two-column, numbered eleven-player list, with shared fitted player-name sizes. Names remain in the supplied order. `(c)` and `(wk)` markers remain attached to their players. Exactly eleven distinct confirmed starters are required for export; duplicate identities and multiple captain markers are rejected. A squad roster is not a confirmed starting XI and is never automatically converted into one.

The generated schema requests exactly eleven names or an empty list when unavailable. Import keeps partial lists reviewable instead of inventing missing names; Review shows the list for correction. The editor supports one name per line. A source and selected match date are required for export. Changing the featured team, opponent or date clears the old XI and its evidence. Very long names that cannot fit above the readable minimum are blocked by export preflight rather than truncated; a taller format should be used.

## Team spotlight

The existing Team template remains a franchise profile. `cricket.teamProfile` contains `captain`, `headCoach` and `homeCity`. At least one confirmed detail and a source are needed for a finished post. Unknown facts stay empty and are omitted from the artwork. The design emphasizes the franchise crest and full name, then gives each provided fact its own labeled area.

Editors enter these named fields rather than arbitrary statistic rows or announcement prose. Review lets editors supply any one or more of the missing profile details. Choosing a different featured franchise clears the old profile and its evidence; changing only an opponent preserves franchise-level details. Legacy statRows/result text remain stored without being inferred into new facts.

## Prompt, typography and captions

Each prompt uses a canonical template title, an optional plain-text summary of at most 100 characters, and only the fields its layout accepts. Extra result/statistic fields and an unrelated toss winner are rejected. Fixture data supplies match identity but cannot establish toss results, starters or franchise staff. AI tools are instructed to leave unverified information empty and cite actual official updates or other supporting evidence.

Loaded-font measurements fit content in reserved areas with readable minimum sizes. English and Devanagari use appropriate fonts and line heights. No text truncation or clipping workaround is used. Photos and overlays remain behind protected information; provided image credits are retained. Captions carry the same structured facts and source URLs. Standalone team-profile captions omit an unrelated opponent and fixture venue.

## Validation

`node scripts/studio-prematch-audit.cjs` runs 192 normal/long-copy, known/unknown, language, format and treatment cases. It checks overflow, text collisions and incomplete-data safeguards, and exports all 24 combinations of three templates, four formats and two languages at their actual PNG dimensions. Set `STUDIO_SKIP_EXPORTS=1` to repeat geometry without repeating completed exports. Images and reports are under `.next/prematch-*`.

Local validation: 129 unit/component tests passed across ten files; all 192 layout cases and all 24 PNG exports passed. Desktop and mobile flows cover prompt import, missing-fact correction in Review, saved facts/backgrounds after reload, toss reversal and clearing stale facts when match/team context changes. TypeScript and scoped ESLint passed. Preview names, people and sources are illustrative test data, not researched NPL confirmations. No production deployment is included.
