# Head to Head benchmark

Head to Head now has a dedicated managed comparison layout using the approved Matchday/Fixtures identity: a transparent NPL logo at top right, The Leaders brand at top left, `/public/npl` stadium backgrounds or the Editorial paper treatment, balanced team-name sizes and `NPL 2026 | Cricket` at bottom right.

## Record contract

`cricket.headToHead` stores `played`, `teamWins`, `opponentWins`, `ties`, `noResults` and `asOf`. Each count is a nonnegative integer or null when unknown. A confirmed zero is distinct from an unknown value. The scope is all completed NPL meetings between the selected two franchises, across all NPL seasons; recent form, other competitions and overall season records are excluded.

The left-side wins belong to `teamId`; the right-side wins belong to `opponentId`. Ties here are matches without a winner. A Super Over-decided match counts as a win for its winner. The two win counts, ties and no results must add up to matches played. A source URL and historical record cutoff are required for export. For a selected fixture the cutoff must precede its date.

The AI prompt uses the same schema, fixes the title to `HEAD TO HEAD` or `आमनेसामने`, limits optional plain-text supporting copy to 100 characters, and accepts only the structured record. It instructs the AI to leave unverified counts null, cite actual evidence, and not infer history from the fixture sheet. Arithmetic contradictions, invalid counts, future-to-fixture cutoffs and extra statistic fields are rejected. Missing facts remain correctable in Review. A supplied URL is provenance; editors still need to verify that its record covers the complete requested scope.

Production drafts start with unknown counts. Ambiguous legacy `statRows` remain stored but are not converted into paired wins or treated as verified history. The dedicated editor offers five numeric fields, a cutoff date and a source URL. Reversing the same team pair swaps win counts while retaining its evidence; selecting an unrelated pair clears its record and sources. Sharing teams across pages applies the same safeguard, including retained history on a page temporarily using another cricket template.

## Composition and export

Crests and full team names have protected, symmetrical columns. Each large win number sits directly beneath its own team. Played, tied-with-no-winner and no-result counts occupy a separate aligned row. Cutoff and source are visible below the statistics. Landscape has a dedicated arrangement with the comparison on the right.

Actual loaded-font fitting uses shared sizes for team names, paired wins and secondary numeric cells. Unknown values display dashes. Text that still cannot fit blocks export; no values are truncated or replaced with zero. Photos and overlays stay behind protected facts; provided image credits remain visible. Captions carry the paired record, cutoff and source URLs.

## Reusable validation

Run `node scripts/studio-head-to-head-audit.cjs` from the repository root. It exercises normal and long metadata, known records, confirmed zero meetings and unknown records, both treatments, all formats and both languages (96 base cases), then every distinct team pairing with four-digit records (448 additional cases). It checks overflow, text collisions, shared name sizes, missing-fact safeguards and eight real PNG dimensions. Set `STUDIO_SKIP_EXPORTS=1` to rerun geometry after PNG exports have already passed. Results are saved under `.next/head-to-head-*`.

Browser workflow checks cover prompt import, record/background persistence after reload, reversing sides, Nepali titles and clearing an old record when an opponent changes on desktop and mobile. Unit tests cover exact data contracts, arithmetic, dates, unknown versus zero, legacy preservation, shared-team invalidation and caption consistency. Preview numbers and example.com links are explicitly illustrative test data, not researched NPL results. No production deployment is part of this work.

Local results: 117 unit/component tests passed across nine files, all 544 browser geometry cases passed, all eight PNGs exported at their expected dimensions, and both desktop/mobile workflow checks passed. TypeScript and scoped ESLint passed.
