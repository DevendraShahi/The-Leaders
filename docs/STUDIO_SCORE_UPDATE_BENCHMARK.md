# Score Update benchmark

Score Update now has a dedicated managed renderer with the approved NPL identity, transparent tournament logo, `/public/npl` backgrounds, the Editorial paper option and fixed footer. Other score-family templates (powerplay, innings break, events and scorecard) continue using their existing renderers.

## Snapshot contract

The featured team is explicitly the batting side. Its score owns `runs`, `wickets`, `overs`, `batter` and `secondBatter`. `scoreInnings` is `first`, `chase` or null while unconfirmed. Production drafts start with unknown score data, not the illustrative gallery statistics.

The prompt fixes the title to `SCORE UPDATE` or `स्कोर अपडेट`, limits optional plain-text supporting copy to 100 characters, and accepts only the snapshot fields. It tells AI tools not to infer scores from fixtures, swap the editor-selected teams, invent verification times or calculate DLS targets. Calculated rates, remaining balls and result fields are not accepted from the AI.

First innings requires no target. A chase requires a positive officially supplied target. Overs use cricket notation: 14.2 means 86 legal balls. The renderer derives current run rate and chase requirements from legal balls, avoids division-by-zero output, and suppresses live chase requirements after ten wickets, the innings overs limit or target reached. These states do not invent a match winner or victory margin.

Batter slots are optional. Completely empty slots stay off the graphic. A supplied slot requires name, runs and balls; its optional boundaries must not exceed its score. Duplicate names and a combined batter score greater than the team total are rejected. An explicitly supplied not-out flag adds a star; the star does not identify the striker. No assumptions about balls faced versus legal team deliveries are made.

A match date, coherent core score, known innings phase and source URL are required before export. Source verification time is shown in Nepal time only when actually supplied. The post is not automatically labeled LIVE. Source URLs are provenance; editors still need to verify the snapshot against the scorer or scorecard.

## Layout and editor behavior

Balanced team names and crests identify batting side and opposition. The main score is dominant, with overs/current rate beneath it, optional batter lines below, and a separate chase/status strip. Source, supporting copy and footer have reserved areas. Landscape has its own arrangement rather than a compressed portrait.

Loaded-font fitting uses readable minima for each output size and appropriate Devanagari line heights. Overflow blocks export rather than truncating values or hiding names. Foreground images cannot cover protected information. Provided photo/overlay credits remain visible. Captions use the same score, optional batters, derived requirements, source URLs and completed-innings states.

The editor offers an innings dropdown and shows the target only for a chase. Optional batters can be cleared together. Changing batting side, opponent, date or a previously known innings clears the old snapshot and evidence. Shared match-context changes use the same safeguard. Selecting an initially unknown innings can preserve supplied score facts, while selecting first innings clears any target.

Review exposes missing core facts, innings selection and conditional target fields. Newly required fields remain editable after their first character is entered. Unknown and incomplete content can still be saved as an unfinished draft but cannot pass export preflight.

## Validation

Run `node scripts/studio-score-audit.cjs`. It checks 224 cases covering both treatments, all formats/languages, long copy, first innings, a chase, 0/0 at zero overs, all out, target reached, overs completed and unknown data. It checks text overflow/collisions, balanced team-name sizes, absence of NaN/Infinity and correct chase suppression. It exports all eight format/language PNGs and checks their dimensions. `STUDIO_SKIP_EXPORTS=1` reruns geometry alone.

Desktop/mobile workflows cover prompt import, changing an unknown innings to a chase, entering the newly required target, saving/reloading, first-innings reset, zero-score handling and batting-side invalidation. Unit tests cover source/fixture constraints, contradictions, optional batters, legal-ball arithmetic, completed innings, context resets, Review requirements and caption consistency. Preview names, scores and example.com source links are illustrative test data. No real NPL scores have been researched or inserted into new drafts by this work. No production deployment is included.

Local results: 140 tests passed across eleven files; all 224 geometry cases and eight format/language PNG exports passed; desktop/mobile workflows passed. TypeScript, scoped ESLint and diff whitespace checks passed.
