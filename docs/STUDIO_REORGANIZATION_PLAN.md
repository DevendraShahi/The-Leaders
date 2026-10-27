# Studio reorganization proposal

Assessment date: October 26, 2026. This is a source-based assessment and implementation proposal, not a completed browser audit or a list of reproduced defects. No application behavior is changed by this document.

## Updated priority: creation engine before visual redesign

The user prioritized automatic/easy post creation before design work. The first
implementation adds a prompt → JSON → validation → preview → draft collection
pipeline for cricket and news, alongside the existing book-review prompt flow.
See `WEB_STUDIO.md` for its workflow and boundaries. Shared match facts are entered
once per import; post scores remain snapshots. This first increment does not yet
introduce persistent match workspaces, cloud projects or redesigned templates.

Continue by evaluating this creation flow with editors, refining required fields
and import feedback, and then adding reusable match/project data. Visual redesign
follows those workflow improvements.

The first long import form has been replaced following editor-experience feedback.
The entry point is New post, with Request → Response → Review screens. Optional
settings and raw technical details are collapsed, missing facts can be completed
inline, and manual tools are secondary. Browser checks now include desktop/mobile
viewport fit and footer visibility, rather than only exercising import mechanics.

## Existing structure

- `/admin/social` mounts `PostStudio`, which combines daily editions, template selection, book-review entry and a browser-local draft library.
- `/admin/social/cricket` mounts `CricketStudio`. Team, opponent, language and format feed template and coverage-pack creation.
- `PostEditor.tsx` contains more than 2,000 lines covering document state, history, gestures, tools, match editing integration, image operations, persistence and export/share flows.
- `CricketInspector` conditionally exposes fields according to template/layout, but each page owns a full `CricketData` object. Packs create separate copies rather than a shared match record.
- `shared-styles.ts` can propagate selected match context through an explicit all-pages operation. It intentionally preserves page-specific scores and events. This is useful style propagation, but it is not a match data model.
- `CricketArtwork` renders 28 presets through 10 layout families and shared visual chrome. `Artwork` dispatches between cricket and the general post renderer.
- Bundled team and player catalogs supply identities/photos. Selecting a player photo inserts an image; the handler does not also bind the post to that player's identity and performance.
- `drafts.ts` validates and serializes libraries through IndexedDB. Web Locks coordinate writes where available. Full libraries include image data URLs.
- Daily edition captions/status are server-backed; edited graphic drafts remain browser-local. Review of an edition therefore does not inherently freeze/review the exact locally edited graphic set.
- PNG generation uses the same artwork renderer, embeds bundled fonts and checks image readiness, fit and dimensions. ZIP and share paths build on this machinery.
- A separate `SocialStudio` / `social-studio/StudioEditor` implementation remains in source, but the active social route imports `PostStudio`. Audit references before retiring anything.

## Diagnoses supported by source

1. Repeated input: shared match facts are copied into page designs. Editors must manage propagation, and scores are deliberately excluded from that sharing group.
2. Starting-point friction: the workflow begins with choosing a graphic, rather than opening a reusable match workspace and choosing what happened.
3. Choice overload: match facts, text tools, visual tools, sharing scope, page operations and export controls compete in one editor.
4. Limited semantic control: the core text model has kicker/headline/supporting/footer layers. Cricket scores, names and statistical blocks reuse these roles or fixed layout structures rather than exposing independent named objects.
5. Visual repetition: many presets reuse the same layout family. A large preset count does not imply a large number of distinct compositions. Visual quality still needs rendered evaluation.
6. Disconnected data/assets: a player photo and the player name/performance are separate operations.
7. Collaboration gap: browser-local graphic drafts cannot provide a shared editorial queue or review of a single authoritative graphic version.
8. Maintenance coupling: unrelated image, save, gesture and export changes meet inside one large component. This is a regression risk, not evidence that every flow is broken.

Existing strengths to preserve: account-scoped draft recovery, valid overs calculations, schema validation, undo, bundled fonts and identities, source credits, shared preview/export renderer, and review permission/concurrency checks.

## Proposed editor experience

### Home

Show Recent work, Matches and an editorial queue, with clear entry points for Cricket, News and Book reviews. Group a coverage pack into one project card instead of presenting every slide as independent work. Display owner and save/sync state.

### Match workspace

Create or select a match once. Store teams, competition, venue, time, squads and verified sources on the match. Offer paste/import with a field-by-field confirmation preview, manual entry as a fallback, and saved reusable team/venue choices. Do not assume an arbitrary URL can supply usable data.

The workspace shows Before match, Live moments and After match actions. Matchday, Toss, Playing XI, Score, Wicket, Milestone and Result use the same match context. Show only fields needed for the selected action. Opening Wicket should ask for the dismissed player, bowler, dismissal and score update; it should not require venue, logos and colors again.

Player selection should attach identity and available portrait together. Populate verified statistics only when they exist; highlight missing data instead of inventing it. Compute run rate, strike rate and chase equations deterministically.

### Design workspace

Use a stable canvas with a compact page strip and three main areas: Content, Design and Assets. Keep advanced object controls in an expandable area. Selection on canvas opens the relevant controls directly.

Provide named objects such as player portrait, score, player name, team crest, headline and stat strip. Support move, resize, crop, alignment, stacking, visibility, locks and reset where the template allows. Provide explicit scopes: this object, this page, or project style. Show which scope will change before applying a bulk edit.

A Quick mode provides content, approved visual variants, portrait and export. Advanced controls remain available for experienced editors. Template constraints protect brand elements while clearly explaining what is locked.

### Review and export

Use one preflight panel for missing required facts, stale source data, missing assets and overflow. Identify the page/object and provide a direct fix action. Separate true export blockers from advisory warnings.

Use a shared project version for review. Approval attaches to a specific content/design version; changes after approval require review again. Export a saved revision with clear progress, retry and original output preservation. Exported/live-event posts retain their original match snapshot unless an editor explicitly updates them.

## Data and code boundaries

Proposed model:

`Team / Player / Asset -> Match -> MatchSnapshot / Event -> Project -> Pages -> Template + ObjectOverrides -> Render -> Export`

- Match: reusable source facts, provenance, verification time and revision.
- Snapshot/event: innings and moment data, preserving historical meaning as the live match advances.
- Project: ownership, languages, brand/style choice, review state and revision.
- Page: semantic purpose, snapshot binding, template version and explicit overrides.
- Template: distinct composition, named slots, required data, constraints, format-specific layouts and text-fit policies.
- Asset: reusable image reference, crop metadata, credits and readiness. Store blobs separately from document JSON; avoid duplicating full image payloads throughout a library.

Keep one shared domain schema and calculation layer for web/mobile. Platform renderers and gesture implementations can differ. Split the web implementation into project state/history, match data/import, inspectors, template registry, asset library, persistence and export services. Avoid merely dividing the large component into files while leaving all state coupled.

Use the existing MongoDB/auth/media infrastructure for shared projects if team collaboration is adopted, with revision checks and recoverable local caching. Debounce writes, load data on demand and avoid continuous background polling. A future score provider belongs behind an adapter with verified provenance, refresh controls and an explicit cost decision.

## Visual direction

Start with six strong composition families and prove them with real content:

1. Matchday: opposing crests, clear team contrast, stadium/action image and concise fixture strip.
2. Score: dominant score, compact innings context and readable player/chase details.
3. Player milestone: prominent cutout/portrait, oversized milestone number and a compact statistics row.
4. Wicket: distinctive dismissal composition with batter, bowler and event hierarchy.
5. Result: clear winner, result margin, both innings and celebration image.
6. Lineup: readable roster grid with captain/wicketkeeper labels and optional headshots.

Give each family deliberate portrait, square and story compositions; support landscape only after its own layout is validated. Variants should change composition, rather than only colors. Use solid brand typography, clear contrast and safe text zones. Missing portraits should trigger a designed crest-led alternative.

## Delivery sequence and completion criteria

1. Baseline and stabilization: reproduce create/edit/reopen/export failures with representative editor projects; repair the test runtime; establish browser checks for persistence, undo, image loading, Nepali text and real PNG output. Record confirmed defects separately from design limitations.
2. One complete pilot: build one match workspace with matchday, score, milestone and result posts, shared facts, player selection, guided fields, approved visuals and dependable export. Preserve existing drafts and keep the current route available during evaluation.
3. Template/object architecture: extract the registry and named object controls, add all format layouts, reusable assets and consistent preflight behavior. Extend only after the pilot works for editors.
4. Team workflow: introduce shared project storage, versioned review, ownership and local-draft import with preview, backup and duplicate handling.
5. Extend to daily editions/books, validate mobile parity, then retire superseded paths after reference and migration checks.

Pilot acceptance targets, to measure rather than assume:

- Enter fixture context once and reuse it across the project's posts.
- Generate the four pilot posts without retyping teams, venue or date.
- Create a subsequent score update in under one minute from an existing match, subject to editor testing.
- Preserve exported historical scores after later match updates.
- Reload and recover the latest saved content; clearly expose failed saves and conflicts.
- Produce actual PNGs at declared dimensions without clipped English/Nepali text or missing assets.
- Allow a second editor to review the same saved version when shared storage is enabled.
- Have two editors complete a realistic coverage session and use their observed friction to decide the next scope.

## Open implementation decisions

The plan can begin with confirmed manual match data and paste/import. Live score integration requires a chosen, permitted provider and is not promised by this proposal. The first pilot should target web Studio; mobile changes need a separate parity pass. Exact bugs, visual failures and performance limits still require runtime reproduction. This assessment does not claim that the existing test suites pass: the prior attempt stopped before execution due to a Windows temporary-file permission error.
