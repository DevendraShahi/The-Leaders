# Web post Studio

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

The dated catalog contains 145 players and 83 available portraits: Biratnagar 6,
Chitwan 10, Janakpur 5, Karnali 17, Kathmandu 1, Lumbini 15, Pokhara 16, and
Sudurpaschim 13. Turn off **Photos ready** to browse the full roster; **Find photo**
opens the existing image search with that player's name. Source links, owner
credits, and licenses are retained per image. Earlier-season/national kits are
possible; the Kathmandu archive portrait is explicitly labeled.

See `public/studio/cricket/players/catalog.json` for the reviewed roster and photo
provenance. Full images are WebP at up to 1600px, with separate small thumbnails
and preserved transparency. Run `node scripts/sync-npl-player-photos.mjs` to restore
missing assets or add `--refresh` to re-fetch reviewed URLs. This command does not
update squad assignments; roster changes require source review.
