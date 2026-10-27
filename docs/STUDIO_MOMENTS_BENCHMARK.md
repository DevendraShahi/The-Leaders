# Four, Six and Wicket benchmark

These three templates use a dedicated managed renderer. Each reserves space for the event, player portrait, player identity, post-event score, source, credit and NPL footer. Stadium backgrounds come from `/public/npl`; Editorial uses the existing paper photograph. The transparent NPL logo stays top right, and `NPL 2026 | Cricket` stays bottom right. Landscape has its own arrangement. Text fits after fonts load and exports refuse unresolved overflow.

## Event contract

The featured team is the batting side. Runs, wickets and overs describe its score immediately after this event. Match date, batter name, event score and a source URL are required. Four and Six mean batter-credited boundaries, not byes, leg-byes or overthrows. The prompt uses canonical localized event titles, plain supporting copy up to 100 characters, and a strict per-template JSON schema. It forbids invented events or scores and does not ask the AI for layout or photo URLs.

Wicket additionally requires dismissal type and details, at least one wicket lost, and a dismissed batter marked not out as false. Bowled, caught, lbw, stumped and hit-wicket require a credited bowler. Run-out, retired-out and other non-credited dismissals leave that bowler blank. The review form asks only for event facts; unrelated batter innings statistics and full bowler performance figures are not required.

Changing the match pairing or date clears event facts, provenance and portraits, including when applying shared cricket styles. Choosing a player portrait changes the subject's name, never the event's score or confirmation status.

## Player images

Imported and edited player-centric posts resolve bundled portraits using one exact normalized name and team match. Partial names, different teams and ambiguous identities never select a portrait automatically. Credits and source/license links come from the local catalog. Custom uploaded images remain editor-controlled.

Four and Six show the batter. Credited wickets default to the opposing team's bowler, with an explicit pictured label; editors can choose the dismissed batter instead. Run-outs use the dismissed batter. Missing photos use the team's crest and do not prevent export. Editors can turn portraits off. The player picker uses only photo-ready players from the subject's team. Existing batting, bowling, fifty, century, five-for, hat-trick and Player of the Match posts also receive exact-match portrait resolution and the subject-aware picker.

The player asset catalog is separate editorial material. This change does not establish that any roster, photo or illustrative match statistic is an official 2026 match fact. Sources still need editorial verification.

## Verification

- 152 focused tests across twelve suites, including exact identity, source requirements, fixture changes, run-out attribution, draft persistence schema and no-photo fallback.
- 96 browser layout states: three templates, two styles, four formats, two languages and photo/fallback versions.
- Desktop and mobile flows cover JSON import, automatic bowler photo, switching to run-out, changing player identity, choosing a portrait and turning it off.
- 24 actual PNG exports checked at 1080×1350, 1080×1080, 1080×1920 and 1920×1080 in both languages.

Reusable visual/export audit: `node scripts/studio-moment-audit.cjs`. Preview data is illustrative. Changes are local, not deployed.
