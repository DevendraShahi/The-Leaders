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
