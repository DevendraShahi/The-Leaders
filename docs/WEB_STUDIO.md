# Web post Studio

## Fixture-led cricket creation

The cricket desk uses the Season III fixture image supplied by the editor on
October 26, saved at `public/studio/cricket/fixtures-season3.png`. Its 28 league
pairings are in `src/lib/post-studio/cricket-fixtures.ts`; four explicit rest days
and the November 17/18/19/21 playoff rounds are recorded separately.

Choose a Nepal calendar date, then a particular game. Double headers retain
separate match IDs, teams and times. No game is automatically chosen on a
two-match date. Teams, competition, match label, date, venue and start time are
carried into prompts and saved designs. A daily-fixtures graphic includes both
games on that date. Switching dates or games clears the previous time override.

Default league slots follow the supplied sheet's 12:30/16:30 labels, with single
evening fixtures seeded at 16:30. The source/timing section links both the sheet
and the reported 17:00 timing revision; editors can adjust or clear the selected
game's start time. The sheet's additional holder/header labels are not treated as
separate match kickoff times. Playoff times are left blank. Qualified teams are
not inferred: on a playoff date, select the confirmed participants explicitly.

Source material is a snapshot, not a live schedule feed. No score, toss, playing
XI, standings or result is filled from a fixture. Existing saved drafts keep
their own snapshots and are not rewritten when another game is selected.

Automated checks cover round-robin completeness, unique IDs, both same-day games,
Nepal date rollover, rest days, playoff labels, timing overrides, prompt/import
binding and empty scores. Desktop/mobile browser checks created and reloaded two
separate same-day drafts and a daily graphic containing both fixtures.

## Prompt creation engine (October 26, 2026)

Use **New post** in Studio or **New cricket post** in the cricket desk. Creation
has three separate screens: Request, Response and Review. Each screen has its own
scrolling content area and a persistent footer action. The main Studio page
prioritizes drafts; manual templates, book reviews and daily editions are in
secondary collapsible sections. Cricket's manual gallery is collapsed by default.

1. **Request:** describe the post and include available facts/source material.
   Cricket provides visible post content type, featured team and opponent
   dropdowns on the desk and creation form. These choices carry into the prompt;
   typing additional information is optional. The response must match the selected
   teams, and the same team cannot be selected on both sides.
   A rule-based suggestion selects the post type and displays the proposed output
   before copying. Editors can change the type, language or size in optional
   settings. **1-Click Copy Prompt** copies the instructions and data contract
   directly, while **Next: Paste AI Output** advances directly without compelling prompt copy;
   a live preview card allows inspecting or copying the prepared prompt anytime. A manual-copy fallback
   appears only when clipboard access fails.
   **Copy Post Prompt** prepares instructions for the selected post only, with a
   compact JSON example rather than the internal validation schema. Innings posts
   request score, overs and target; XI posts request names; wicket posts request
   dismissal details without bowling analysis. Dates and other match metadata are
   requested only by layouts that need them. Studio supplies omitted internal
   defaults when importing and continues to accept older complete responses.
2. **Response:** paste the AI's reply and choose **Review post**. JSON code fences
   are accepted. Omitted content and per-post fields become empty editable values,
   never gallery example scores. Explicitly invalid data and mismatched post types
   are rejected. A readable error and optional **Copy repair request** preserve the
   pasted response; technical error paths are collapsed under View details.
3. **Review:** inspect one post at a time, edit headline/supporting text and complete
   only missing essential facts. Shared fixture corrections apply to every page;
   moment scores stay separate. Missing lineups/tables have structured inputs.
   Source links are available in an expandable section. Complete posts use
   **Create post**; incomplete ones explicitly use **Save unfinished draft**.
   There is no extra review checkbox. Validation does not establish factual accuracy.
4. Studio saves the collection atomically and opens the editor. A failed save
   keeps the response and preview available for retry. Each attempt reuses its
   collection IDs so retrying cannot duplicate the same collection. Existing
   drafts are preserved. Scores remain separate snapshots for each post.

The engine supports all 28 cricket templates and breaking/explainer/quote news
posts. Book reviews retain their existing prompt/import flow. Sources persist
as optional `sourceUrls` on designs and are included in generated captions.
No API key, direct AI call, live score fetching or auto-publishing is involved.
This feature uses the existing artwork and browser-local draft storage; template
redesign and cloud project/match storage remain subsequent work.

Tests cover all cricket contracts, shared context versus moment snapshots,
invalid responses, source preservation, account isolation, retry deduplication,
guided navigation, hidden optional controls, missing-field editing, clipboard
fallback, preview invalidation and recovery from a failed write. An isolated
browser fixture verified all three screens on desktop light and mobile dark,
inline date completion, visible footer actions, no horizontal overflow, draft
creation and IndexedDB reload. Desktop verification included an actual 1080 × 1350
PNG download. This fixture does not test production authentication.
On Windows, if Vitest's temp-file rename is denied, set TEMP and TMP to a writable
workspace directory such as `.next/studio-test-temp` for the test process.

`/admin/social` is the browser counterpart of `mobile/app/(tabs)/studio.tsx`
and `mobile/src/features/post-designer/PostEditor.tsx`. The dashboard and sidebar
link to Studio; `/admin/designer` remains an alias. Existing admin authentication
and content-page permissions apply.

## Mobile parity

- Breaking, Explainer and Quote templates, with the mobile copy/defaults.
- Square 1080×1080, Portrait 1080×1350, Story 1080×1920 and Landscape 1920×1080.
- The same 360-unit reference artboard, logo, bundled Onest/Hind fonts, line
  limits, tint, spacing, position percentages, color palette and typography rules.
- Text, Layout, Media and Layers inspectors, with visibility/locks; per-layer
  font, size, spacing, shadow, colors and offsets; snapping and drag guides.
- Photo upload/replacement, preserved adjustments, fill/fit, direct drag,
  scroll ball (including Shift+wheel), zoom, tone, blur, vintage and feathering.
- Forty-step undo/redo, with one undo entry per completed slider/drag gesture.
- Draft creation, search, rename, duplicate, recoverable Trash and restore.
- Debounced autosave, visible save/error state, retry, save-before-close and
  an unsaved-changes warning when leaving before persistence completes.
- PNG export embeds bundled fonts and checks photo loading, text fit and exact
  output dimensions. Selection outlines, empty-photo controls and guides are
  preview-only. Exports download locally; nothing is published.

Pure design helpers in `src/lib/post-studio` are ported from the mobile source
and marked accordingly. Changes to mobile artwork rules should update these
ports and their parity tests. React Native view styles are translated to DOM/SVG
in `Artwork.tsx`; preview and export share that renderer.

## Storage and resource boundaries

Drafts live in IndexedDB, scoped by the verified MongoDB admin ID, independently
of mobile-device drafts. Images use durable data URLs, not expiring blob URLs.
Writes serialize per account and use Web Locks where available to coordinate
tabs. Invalid libraries and failed writes preserve the previous saved data.
This is browser-local storage, not cloud sync or encrypted shared-device storage.
Legacy web designs can be explicitly imported without deleting the original.

Studio never polls. Local draft operations and exports call no backend.
Daily editions load only on **Load editions** / **Refresh**, through
`/api/admin/studio/editions`. Caption/status changes retain optimistic concurrency
checks and enforce edit/submit/approve permissions server-side. The native API is
unchanged. Preparing a carousel imports both languages into local drafts without
overwriting existing edits; ZIP export uses those saved drafts and includes
numbered PNGs, captions and sources. No schedule or generation job is enabled.

## Verification

Root Vitest tests cover draft/account isolation, concurrent writes, failed storage,
trash recovery, carousel preservation, locked-layer edits, Devanagari typography,
gesture history and web edition permissions/concurrency. Authenticated browser
verification covered upload, autosave, rename, close/reopen/full reload, Trash and
restore, native dialog focus/Escape, manual edition loading and actual PNG downloads
at all four sizes. The temporary validation draft is in recoverable Trash.

The web changes are local until deployed. Mobile native code and releases are
unchanged. Browser and native text rasterizers can differ slightly even with
matching fonts, geometry and design values; output should be visually checked
when adding new templates or long copy.

## Organized carousel workspace (October 25, 2026)

The current editor has four tools: **Text**, **Design**, **Image**, and **Pages**.
The canvas keeps a horizontal page strip visible; the inspector scrolls independently.
On phones and tablets the canvas sits above the inspector, with preview, undo/redo,
and export available in the header. Page thumbnails use the actual artwork renderer.

Changes default to **This page**. For a carousel, **All pages** shares only the selected
style groups. Open **Options** to choose fonts/type sizes, text alignment, text/accent
colors, background/photo with its crop and effects, effects alone, or canvas size.
**Apply selected styles now** copies the current settings once without enabling
continued global editing. Effects alone preserve each page's image and crop.
Live sharing propagates only the settings changed in the current gesture, preserving
other page-specific formatting. Copy, category, byline, template, layer visibility,
and locks remain specific to each page; locked target layers keep their settings.

Shared edits and page reordering support whole-carousel undo/redo. Saves write the
carousel in one IndexedDB transaction, report storage failures, and preserve concurrent
draft renames. Explicit carousel IDs and page positions preserve grouping/order after
reload; existing ID/name-based packs are recognized when opened. Add, duplicate, and
Trash actions save pending edits first. Adding/removing pages starts a new undo history;
removed pages remain recoverable from the library's Trash.

A local fixture for this editor is available with:

```sh
npx vite --config src/test/post-editor-preview/vite.config.ts
```

It uses a separate preview account scope on `http://127.0.0.1:4176` and makes no
live editorial writes. `?theme=dark` selects the dark theme. Regression coverage for
the routed editor is in `src/test/components/post-editor.test.tsx`; style propagation
and atomic collection storage have dedicated library suites.

## NPL cricket desk

Open **Cricket desk → Open cricket templates** from the Studio library to visit the dedicated `/admin/social/cricket` page. The kit has
28 presets, eight locally bundled franchise logos/themes, English/Nepali labels,
and four output formats. Create one template or a coordinated 10-page match pack,
6-page pre-match pack, 7-page performance pack, or 5-page tournament pack.

Cricket drafts add a **Match** inspector for structured scores, legal overs, batters,
bowlers, targets, XIs, fixtures, standings, sources and Nepal-time updates. Player of
the match supports batting, bowling and all-round presentations. New drafts start with blank player/score fields; artwork and captions carry no sample labels. Scores are manual; there is no live-score polling or auto-publishing.
The **Cricket teams & match** sharing group preserves each page's event and statistics.
Exports include cricket captions rather than the news editor's political hashtags.

Research, source links, logo provenance and the coverage matrix are documented in
[NPL_CRICKET_RESEARCH.md](NPL_CRICKET_RESEARCH.md). The isolated preview is
`http://127.0.0.1:4176/admin/social/cricket`.

## Instagram sharing

The editor toolbar's **Share to Instagram** action opens an inline sharing panel.
Choose the current page or all pages, then **Prepare images**. Drafts save and each
page passes the same image/font/overflow checks as PNG export. A separate **Share
images** click invokes the device share sheet with full-resolution PNG files in
page order, preserving the browser's required user activation. Choose Instagram
when the device offers it; the editor does not claim the post has been published.
Copy the caption separately because Instagram may ignore shared text.

Browsers without file-sharing support offer a PNG download (one page) or an ordered
ZIP with caption.txt (multiple pages), plus **Open Instagram**. Extract the ZIP
before uploading its PNGs. Cancelling the share sheet retains prepared images;
editing artwork or changing the selection requires preparing them again. This
flow needs no connected Instagram account and does not auto-publish through Meta.

## Photo positioning

The Image inspector uses the original scroll-ball/gimbal thumb for dragging and
wheel panning. It also supports arrow keys (Shift for larger steps), Home to
center, and a **Center photo** button. Each drag is one undo step; visual locks
disable the control. Direct dragging on the canvas remains available.

Photos render at their intrinsic aspect ratio, scaled for Fill frame or Fit image.
Panning and zoom apply to the complete source before clipping to the final canvas;
feather masks stay at the frame edges. Export waits for intrinsic photo bounds to
load so preview and PNG use the same framing. Pan travel supports wide and tall
originals beyond the former 90px limit.

## Canvas space

Artwork scales to the measured canvas surface rather than subtracting a fixed
allowance for controls. Narrow portrait screens give the canvas 60% of the main
workspace, with compact header controls and a scrollable inspector below. A
single-page draft shows a compact Add page action instead of a redundant thumbnail
strip. Short landscape screens put the inspector alongside the canvas.

**Expand** hides the inspector and lets the canvas fill the workspace. **Show
controls** restores the same tool and inspector state. Carousel navigation and
export remain available while expanded.

## Team player photo library

In a cricket draft, open **Image → Player photos**. The picker starts with the
draft's featured team and offers all eight teams, name/role search, photo previews,
and **Use photo**. Insertion loads the bundled image into the browser-local draft
as a data URI, respects visual locks and the current carousel style scope, and
returns to the photo positioning tools. Player names and match statistics stay
unchanged. Photo credit travels with the image and appears in cricket captions;
replacing the photo clears the previous credit.

The catalog now contains 166 canonical players with 166 available portraits.
Turn off **Photos ready** to browse the full roster; **Find photo** opens the
existing image search if a local image fails to load. Source links, credits and
license notes are retained per image, including user-supplied replacements.

Cricket templates resolve full names, recorded aliases (including the existing
Nepali names), punctuation and initial forms such as `D.S Airee`, `DS Airee` and
`Dipendra Airee`. Matching ranks the full catalog before applying the post team's
scope, so a full name from the other side cannot silently select someone else.
Initials that match multiple teammates (for example `S. Patel` in Kathmandu) stay
unmatched; choose the full name in **Player portrait**. First names, surnames and
unrecorded misspellings alone do not trigger automatic portrait guesses.

The same resolution applies to pasted JSON, team-side reconciliation, both
partnership portraits, all-round awards and duplicate-player checks. Changing
only a player's name format preserves their confirmed figures and portrait.
Custom uploaded images and visual locks are preserved. Tracked library URLs
refresh to the catalog's current version when the portrait is applied again.
Prompts request full published names, but confirmed initials are accepted.

See `public/studio/cricket/players/catalog.json` for name aliases and photo
provenance. Full images are optimized transparent WebP files with separate small
thumbnails. User-supplied replacements have versioned filenames and are maintained
from the supplied assets; roster assignments still require a separate source review.

## Today in History

Open `/admin/social/history` from **Studio → Other creation tools → Open History desk**,
or choose **Today in History** in New post. There is one design: a main cover followed
by paragraph pages only when the story needs them. English/Nepali copy and all four
canvas sizes are supported. Previous topic-based drafts remain readable.

**New history post** prepares a web-research JSON prompt for one Nepal event and one international event, each in both languages. The JSON contains four editions in this order: National-Nepali, National-English, International-English, International-Nepali. Choose the Gregorian publication
date in the Nepal editorial calendar; keep the original event year separate. No image attachment is expected. The AI chat must have web search enabled. For the national event it first verifies the publication day’s Bikram Sambat equivalent, then researches an anniversary on that Nepali month/day. The international event uses the Gregorian month/day. Both require source-page verification, and the national sources include the calendar-conversion reference. Each response story contains a cover, its own `sources` URLs and an optional `paragraphs` array. Studio saves all four editions in one carousel, in the requested order, with each cover immediately followed by its own optional paragraph pages. The total is limited to twenty pages, including all four covers. Sources remain attached to the appropriate event. It does not force additional pages or different topic templates.

**Start blank story** creates one empty main page. Use **Event** for its date, year,
subject and short cover context; use **Text** for the headline and byline. **Add page**
creates a paragraph page with the same event identity and an empty body. Edit its
prose in **Event → Paragraph content**. Add or remove continuation pages as needed.
The watermark and the angled **TODAY IN HISTORY** seal appear on every page; the
seal sits at the top right. Source URLs and update timestamps stay off the artwork.

Lora is bundled under the SIL Open Font License for English; Hind handles Nepali.
PNG exports embed the fonts and preserve the paper background. Run
`node scripts/check-history-studio.cjs` for the cover/paragraph checks, long-copy and
photo cases, eight PNG exports, and dropdown checks on desktop/mobile in both themes.
Reports and sample PNGs are written to `/tmp/history-studio-audit.json` and `/tmp/`.

History-only echo11 preview: a reserved promotional footer uses `/studio/echo11-logo.svg`, “Powered by echo11”, and a clearly labeled web-development advertisement. The editorial content fits above it. Cricket posts use a separate compact publisher credit, described below.

History batches previously saved with separate national/international carousel IDs are recovered together when either main draft is opened. Saving normalizes their shared carousel ID; no draft content is removed or regenerated.

Captions use the authored headline and content rather than carousel counts. Copy this post’s caption and single-page mobile exports use the selected page only. Sharing all selected pages or exporting a ZIP builds a content-based combined caption without slide lists or forced swipe text. History captions include the event date/year and context; cricket captions include relevant match/player figures. Generic news, quotes and book posts use their own copy and relevant tags rather than a fixed political hashtag list. Captions are limited to 2,200 characters.

Cricket artwork includes a dedicated echo11 footer with a small **POWERED BY** eyebrow, the supplied logo, **Your vision. Built for the web.**, and website/email links. This credits The Leaders’ publishing output and is separate from the NPL and team branding. Managed layouts reserve the bottom strip and refit their content above it; compact Nepali score text can shrink within its slot. Run `node scripts/check-cricket-credit.cjs` to check all cricket examples across formats, languages and Stadium/Editorial styles.

The full echo11 bar is agency branding: it contains no “The Leaders posts” wording or NPL sponsorship claim. Contact links point to `https://echo11.tech/` and `mailto:echo11.labs@gmail.com`. History uses the same branding content, with Nepali copy on Nepali editions.

### The Leaders photo & video overlays

Open **Studio → Photo & video overlays** (`/admin/social/overlays`). This separate visual desk uses The Leaders logo and watermark; it does not add NPL or echo11 branding.

- Upload a photo or video. Choose **Signature**, **News lower third**, or **Editorial**. Headlines, labels, and attribution are optional; English and Nepali fonts are loaded locally.
- Keep original proportions (maximum 1920 px on the longer edge) or use square, portrait, story, or landscape. Fill crops the frame; Show full frame letterboxes it. Framing sliders choose which edge to preserve.
- Adjust the logo corner and size, watermark opacity, and text backdrop. Signature intentionally hides the headline and label, while retaining their values if another overlay is selected.
- Export photos as PNG. Video is rendered locally at 30 fps with source audio, using MP4 when the browser supports its encoder, otherwise WebM. Recording takes the clip's duration; keep the tab open. The source preview starts muted independently of exported audio. Export starts at the beginning regardless of preview seeking.
- Download a transparent overlay PNG for use on a separate timeline in a video editor. It contains branding, text and shading without the photo or footage.
- Files and edits are kept only for the current session; they are not uploaded or saved as Studio drafts. Download results before navigating away. Cancelling an export keeps the current media and controls available.

Verification: `npm run test:run -- src/test/lib/media-overlay.test.ts` and `node scripts/check-overlay-studio.cjs`. The browser check uses a generated test clip with audible tone to verify duration, dimensions, retained audio, cancellation, transparent PNG alpha, photo output, and mobile layout.

### News desk

Open `/admin/social/news` from Studio. Daily News uses a paper editorial layout, Hot News a full-photo layout, and News Report a distinct photo-and-copy layout. All three support Nepali/English, square/portrait/story/landscape, empty new drafts, uploaded photos, photo credits, and editable labels/bylines. The existing post editor saves and exports them; `newsStyle` is preserved through draft storage and JSON import without changing older breaking-news posts.

Each “Create with AI prompt” action prepares one selected post. The prompt uses attached evidence first, otherwise internet research, and returns only the existing news JSON contract. It limits headline/context to 120/240 characters and rejects oversized responses; it does not invent breaking urgency or request unrelated post data. Photo placement remains an editor action. Captions use the actual story content.

Verification: `src/test/lib/news-studio.test.ts`, Next CSS Modules purity tests, prompt contract tests, and `node scripts/check-news-studio.cjs` (48 layout cases, three PNG samples, desktop/mobile desk checks).

The shared echo11 banner rotates through eight approved English/Nepali message pairs (`echo11-copy.ts`). New drafts receive a random `echo11Variant` once, including AI/batch imports; editing, reopening and repeat imports preserve it. Existing drafts use their stable draft ID to pick a message until the next save persists that choice. Language switches select the matching translation of the same pair. Live artwork renders use a deterministic fallback, never a render-time random call. The banner fits longer lines into its reserved slot and retains the agency logo, website and email.

Cricket artwork no longer prints the bottom sports-desk byline/footer row. The shared `CricketTournamentMark` places `NPL 2026 | Cricket` directly below the top-right tournament logo in every cricket renderer, including classic/broadcast layouts. The echo11 agency banner remains a separate reserved section at the bottom. Draft author values remain stored for captions and compatibility.

The echo11 image slot now uses eight original SVG service illustrations, one for each saved ad variant, replacing screenshot/device mockups. Storefront, launch, bespoke layout, social-to-website, planning, online store, business growth, and contact motifs are drawn directly from SVG primitives with no image-generation service. The illustration itself links to the contact email and keeps the existing headline/subtext pairing. The banner retains its three-column arrangement; wrapping uses word boundaries and balanced lines.

### Reliable exports and download options

The PNG button still downloads the current page directly. Its adjacent arrow opens **Export options**, grouping the current PNG (with page number and pixel dimensions), all-pages ZIP (numbered PNGs plus caption.txt), and current-post caption. Export preparation reports saving, image embedding and rendering status; batch status identifies the page being rendered. Duplicate clicks are locked while exporting. Validation messages replace the options panel rather than stacking dialogs.

Before capture, `export-assets.ts` builds an isolated snapshot and embeds verified image bytes for HTML photos, SVG images, CSS backgrounds, masks, and pseudo-element images. Exact URLs, including query strings, are kept distinct. Network failures retry once; failures are not cached across exports and prevent incomplete downloads. Rendering resets offscreen logical and physical offsets and removes the snapshot after success or failure. The live artwork is not modified. ZIP export rejects incomplete page sets.

Checks: `scripts/check-studio-export.cjs` inspects PNG pixels for image/background types, query variants, transient failures and recovery; `scripts/check-studio-export-ui.cjs` exercises desktop/mobile controls and downloaded PNG/ZIP files. Existing cricket and History export checks cover actual templates.

### Standalone Instagram preview

The editor's Preview button saves the current draft and navigates to `/admin/social/preview?draft=…` in the same tab. The authenticated preview reads only the signed-in account's local drafts, preserves the originating desk, and restores the selected page when returning to the editor. Page changes replace the preview URL, so refresh/deep links retain the selection without filling browser history with carousel clicks. Save failures keep the editor open.

The preview is a scrolling page rather than a modal or fixed phone shell. Artwork scales to its measured container and retains its original aspect ratio, including tall Story pages. Sticky previous/next controls and a page picker support the full collection; horizontal swipes change pages while vertical gestures remain scrolling. Arrow keys navigate outside form fields. Current-page captions use the shared caption builder; fabricated engagement counts, timestamps, and promotional claims were removed. PNG and ZIP downloads use the verified export pipeline.

Verification: `scripts/check-instagram-preview.cjs` checks 48 size/language/format cases at phone, landscape-phone, tablet and desktop sizes, plus swipe/keyboard boundaries, returning to the selected edit page, and a PNG download. Preview/editor tests cover pending-save persistence and save failures.


## Knowledge and curiosity templates

The News desk includes **Do You Know?** (warm paper, question label and photo strip)
and **Interesting Facts** (warm paper background, gold accents and an optional side photo).
Both support English/Nepali and square, portrait, story and landscape output. Blank
posts start without example claims. The existing editor, local draft storage, PNG
export and source-aware captions apply. The AI prompt flow requests one verified
fact with context and primary-source URLs; it does not automatically verify claims.


## Studio home organization

The Studio home exposes News, Cricket, History and Photo/video desks together,
followed by Do You Know?, Interesting Facts and Book Review cards. Section links
jump to creation, browser-local drafts and daily editions. Drafts support name
search and newest/oldest/name sorting in both the active library and recoverable
Trash. Basic layouts and legacy imports remain under Blank templates & imports;
daily editions still load only on explicit request. The home layout has its own
CSS module so artwork and editor layouts keep their existing styles.

## Research-first news and facts

News, Do You Know? and Interesting Facts prompts are available with no typed
request. Copy the prompt into an AI chat with browsing enabled: it requests a
recent Nepal-related story for news, or a verified evergreen fact for curiosity
posts, together with consulted source URLs. Your request is an optional collapsed
section for narrowing the topic or adding source material. The existing attachment
evidence rules, JSON import, review and local draft workflow still apply. Studio
prepares these instructions; it does not execute a web search or AI request itself.


News and curiosity prompts use a dedicated copy contract without cricket fields or
match terminology. Fact posts focus on one claim, omit labels already printed by
the template, preserve approximate dates, and require consulted URLs that directly
support the claim. The JSON example explicitly includes sources, while retaining
Studio’s internal breaking template key for news and fact artwork.


All Studio creation and repair prompts request one fenced `json` code block so
chat applications can offer a code-copy button. JSON examples use the same format.
Source links must be plain URL strings rather than Markdown links. Existing raw
JSON and fenced JSON imports remain supported.


## Editorial safeguards and portable drafts

- Research creation offers independent region (automatic, Nepal, international)
  and topic controls. Up to 40 unique recent local draft headlines, including
  Trash, are sent as an explicitly untrusted exclusion list in the copied prompt.
  Similar-headline warnings also appear during response review and in the editor;
  matching is a local text heuristic, not semantic or cross-language proof.
- Response cleanup previews HTML-entity decoding, line-ending backslash removal,
  Markdown underscore escapes and Markdown-wrapped source links. It never writes
  a draft until the editor accepts the cleanup and validates the resulting JSON.
  Incomplete or ambiguous JSON is not guessed.
- Text → Sources & fact check records per-copy-section evidence links, notes and
  a human review status. Verification requires selected saved evidence or a
  descriptive supplied-evidence note. Source links alone are not verification.
  Changes to the copy, structured facts, language, sources or printed metadata
  invalidate the review; purely visual edits preserve it.
- A publication checklist is shown in export options, Instagram preview and share
  preparation. Direct editor downloads with outstanding checks first open the
  checklist. It is an editorial review aid: the editor may continue deliberately.
  Existing hard checks for text fit, fonts, unavailable images and malformed
  structured artwork remain in force. Known layout errors now fail before font
  downloads. The checklist does not claim to read or validate external sources.
- Text → Series identity adds an optional topic label and issue number to the
  news/fact masthead. It remains specific to the page and survives draft backups.
- Studio home → Back up & restore exports up to 500 selected recent drafts to a
  versioned JSON file with embedded raster photos, image layers, page grouping,
  sources, review notes and optional Trash. Images are fetched only for an explicit
  backup; failed images stop the download. Individual remote images are capped at
  20 MB and the complete backup at 60 MB. Fixed artwork assets/fonts ship with Studio.
  Restore validates and previews the file, then atomically adds new-ID copies;
  existing drafts are never overwritten. Retrying a failed restore reuses IDs.

Verification includes automated review invalidation, duplicate detection, JSON
cleanup, atomic restore and image-embedding checks, plus a browser flow through
research settings, malformed-response cleanup, duplicate warning, review reset,
series rendering, actual PNG download, backup download/restore and mobile layout.
Disposable browser verification drafts are in recoverable Trash.
