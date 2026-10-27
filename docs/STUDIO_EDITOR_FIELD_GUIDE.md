# Studio editor field guide

Open `/studio/template-guide/index.html` from Studio or the Cricket desk’s **Editor field guide** link. The guide contains 38 illustrative examples: all 28 cricket templates, the additional bowling/all-round award modes, three news templates and five book-review slides. The remaining cricket redesigns can also be compared in `/studio/template-guide/gallery.html`.

Each example includes the actual rendered artwork, section highlights, a map from every response field to its destination, a complete downloadable JSON response, and notes explaining team ownership and automatic calculations. Fields that are not printed on the artwork are grouped separately. Photos, logos, bylines and styling stay in Studio controls, outside the AI response contract.

**Every match statistic, result, lineup, standing and announcement in this guide is training data. Real player names do not make these examples factual. Replace the example data before publishing.** Example images and their bylines identify them as training material.

## Redesigned remaining templates

| Family | Templates | Main content |
| --- | --- | --- |
| Innings | Innings break | Batting side’s total, overs, run rate, official target and optional batter lines |
| Chase | Target, revised target/DLS | Official target, allotted overs, remaining requirements from a known snapshot |
| Status | Rain/interruption, qualification | Confirmed status text and team identity; no guessed restart or qualification |
| Batting | Fifty, century, batter spotlight | Named batter, innings runs, balls, fours/sixes and calculated strike rate |
| Bowling | Bowler spotlight, five-for, hat-trick | Bowler’s figures and economy; opposition innings in the score strip |
| Award | Player of the match | Batting, bowling and all-round modes; all-round figures belong to one player |
| Results | Result, champions | Featured side, confirmed outcome and both innings scores |
| Tables | Scorecard, points table | Same-innings batters/opposition bowlers; official ordered standings |

All 16 use managed sections, bounded text fitting, reserved footer space and the same renderer for previews/exports. English/Nepali, portrait, square, story, landscape, Stadium and Editorial styles are supported. Milestone thresholds, player-team ownership, table arithmetic and incomplete required data are checked before export. A template selection alone is not evidence that an achievement happened.

## Editor workflow

1. Select the actual fixture and post type. A fixture identifies the two teams; each post chooses its own batting/performance side.
2. Copy a fresh Studio prompt and attach the actual game image/photo in the AI chat. The AI should extract only the visible snapshot. It may search for sources only when no image is attached.
3. Paste the returned response into Studio. Check the batting/featured side, dismissed batter versus opposing bowler, official targets, and every displayed figure.
4. Fill only confirmed missing details. Unknown nullable counts stay `null`, text stays `""`, and unavailable lists stay `[]`. Zero is an actual confirmed zero.
5. Preview and export. Rates are calculated from legal balls; `14.2` means 86 balls. Do not enter strike rate/economy/required rate as extra JSON properties or guess a DLS target.

## Rebuilding the guide

Sample definitions and mappings live in `src/lib/post-studio/template-examples.ts`. They are checked through the response schema, importer, design schema and template validators.

```sh
node --import tsx scripts/generate-studio-field-guide.ts
node scripts/render-studio-field-guide.cjs
node scripts/check-studio-field-guide.cjs
```

The browser scripts use an isolated local Vite preview at port 4187. They do not write editor drafts, contact a database or publish posts. The render audit checks all formats, both languages and both visual styles, and verifies full-resolution PNG output dimensions. The interface audit checks every example link, preview, field list, JSON download, section control and responsive widths.

The guide uses representative examples; arbitrary copy and images can still require editorial review. Export preflight blocks invalid or clipped content instead of silently cropping it.
