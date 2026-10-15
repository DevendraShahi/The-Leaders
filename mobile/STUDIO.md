# Admin post editor and local drafts

Studio now starts with post drafts rather than shortcuts. Admins can create a
Breaking, Explainer or Quote design, search by name/headline, reopen, rename,
duplicate, move to Trash and restore. Each draft retains format, image, text,
position, tone, hidden layers and locked layers. The previous single local design
can be imported explicitly; its original saved value is preserved.

Drafts are versioned, validated and stored under the verified admin account ID.
Writes are serialized per account to prevent overlapping autosave/rename actions
from discarding one another. Invalid libraries and failed storage writes are
reported without overwriting saved data. Storage is local to the device/browser,
not encrypted account storage or cloud sync. Shared-device admins should use their
own operating-system/browser profile for private work.

The editor opens a specific draft, autosaves and shows actual save state. Its close
control waits for a successful save. Normal navigation flushes the latest state;
abrupt process termination can still interrupt the debounce or pending write.
Existing undo/redo, layer controls, image selection and export remain available.

The account endpoint returns a minimal local workspace ID for active admins;
signed-out/disabled/unprovisioned users get no workspace. Browser admin sign-in is
available from Profile; native Clerk sign-in remains unconnected. The previous
website Social Studio is unchanged. Cloud drafts, publishing and approvals are
not implemented in this local editor.

Verification: seven local draft lifecycle tests, six account-gating tests, Expo
lint and TypeScript. An authenticated live editor session and physical-device
export/storage testing are still required before release.

`/studio-preview` is a development-only visual preview of the same editor, using
an isolated sample workspace. It accesses no admin API or account drafts. Release
builds redirect this route to Profile. The real designer route retains its admin
check. Preview sample changes save locally under a separate workspace key.

The editor uses a dedicated scrolling inspector below the canvas on phones and
beside it on wider screens. Its breakpoint, inspector sizing and maximum preview
scale come from shared layout tokens. Artwork renders at the export reference
size and scales uniformly to fit the measured stage; image dragging converts back
to artwork coordinates. Fields have direct selectors, normal readable labels and
44-point controls. Undo/redo are separated from the primary header action. The
offscreen export artwork is excluded from native accessibility navigation.

Text → select Headline, Summary, Kicker or Byline → Position provides independent
horizontal/vertical percentage offsets, one-percent directional steps and reset.
Offsets are relative to the template location, persist with each draft and use the
same transform helper in preview/export. Older drafts default to zero offsets.
Locks prevent movement; undo/redo include positioning changes.

Position and headline-size sliders update while dragging. Custom tracks, tick
marks, thumbs and value readouts retain the platform slider's input behavior.
“Reposition on canvas” enables direct dragging of the selected text. Background
image dragging also updates live. Each completed interaction adds one undo step,
and no-op gestures add none. Draft writes remain debounced during continuous edits.

Vertical position uses an upright track: the top moves text upward, the centre is
the original template position, and the bottom moves text downward. It updates
live, includes up/down buttons and native accessibility adjustment actions, and
keeps the same percentage offsets used by saved drafts and export.

Media includes a fixed-centre image scroll ball. Dragging across it moves the
image live in either axis; mouse/trackpad wheel scrolling is supported, with
Shift + wheel for sideways movement. The grip rolls while the ball stays centred.
Arrow buttons provide fine adjustments. Locks and visibility disable movement.
Image zoom runs live from 100% to 300%, shares the draft/undo system, and renders
identically in preview and export. Existing drafts keep their previous 108% scale.

Image effects provide independent 0–100% Blur, Vintage, and Feather edges controls.
Blur softens only the photo; vintage interpolates a faded sepia color grade;
feathering fades the photo's edges into the canvas and moves with its position/zoom.
A shared SVG photo renderer is used by both artboards, keeping text and branding
sharp. Effects save with drafts, respect image locks/visibility, support one undo
step per gesture, and can be reset together without changing the crop or tone.
Older drafts default to zero effects. Web interaction and draft tests pass; native
filter rendering and exported captures still need a physical-device check.

Text has independent font colors for Headline, Summary, Kicker (including category),
and Byline (including the date). The Font color control offers ten named swatches
and valid 3- or 6-digit custom hex entry. Apply commits a custom color; Reset
restores the template's original color/opacity. Preview and export use the same
color helper. Choices save per layer, respect locks, and support undo/redo. Older
drafts retain their original template colors until a color is explicitly chosen.

Layout includes Landscape (16:9, 1920 × 1080) alongside Square, Portrait, and Story.
Its shorter canvas uses a compact text scale and line limits in both preview and
export. The format choices wrap into two rows on phones. Artwork accent shares
the font-color palette/custom hex control, applies to the top rule and brand
mark, and resets to Leaders red. Format and accent choices persist with drafts.

Typography settings are saved separately for every text layer: Auto/Onest/Hind,
size (60–160%), line spacing (90–180%), and shadow strength (0–100%). Auto detects
Devanagari text for Hind. Both artboards use the same font, size, line-height and
shadow helper. The existing headline scale is preserved for older drafts.
Reposition mode shows centre crosshairs and an inset safe-margin guide only in
preview. Optional snapping returns offsets within 1.5 percentage points of zero
to the template position; it does not snap object bounds to the canvas centre.
Guides never render in export. Sliders, locks, autosave and undo remain shared.

Media now supports non-destructive Fill canvas / Fit whole photo modes. Changing
mode centres the photo at 100% zoom; the scroll ball and zoom refine the crop.
Picking images no longer forces a device-side crop, preserving the selected photo
for later format changes. Replacement keeps crop, tone and effects by default;
turning off “Keep adjustments on replace” resets them for the replacement.
Reset all image adjustments restores Fill, centred offsets, 108% zoom, Ink tone,
and zero effects in one undo step. Replacement, removal, fit and reset respect
image-layer locks. Browser fit/reset/undo and draft replacement tests pass; the
native photo picker still needs a physical-device check.

Artwork branding uses the bundled Leaders app icon (`assets/logo-Rbg.png`)
in both preview and export, replacing the typed wordmark and decorative diamond.
The icon retains its original colors and uses a smaller size for Landscape.
Artwork accent still colors the top rule.

Wrap-up checks: text-position arrow buttons have been removed from both the main
inspector and the vertical slider; native accessibility adjustment actions remain.
Typography, font color, position and image effects use collapsible sections.
Unclamped offscreen headline/summary probes measure the current font and width,
show an overflow notice, and warn before native export when line limits are exceeded.
This detects line truncation; moved-layer overlap or out-of-canvas placement still
needs visual review. Hidden text layers do not trigger the notice.
Native photo picks are copied asynchronously to `Paths.document/studio-images`
before draft updates; existing local references migrate when accessible. Browser
blob references convert to data URLs. Expired/missing references preserve the draft,
show a replacement notice and disable export. Copied assets are retained for undo,
duplicate drafts and recovery; no automatic image deletion is performed.
Validation: 26 Studio tests, lint/typecheck, browser overflow/undo and arrow-free
position controls. The current sample photo has an expired blob reference and must
be selected again. Profile has no verified admin session; authenticated end-to-end
Studio and physical iOS/Android export capture remain unverified.

Web export now uses a browser-specific DOM-to-PNG capture and download path rather
than calling Skia's native makeImageFromView without its required web callback.
The browser capture embeds the bundled Onest/Hind fonts, waits for loaded images,
and checks exact output dimensions. Offscreen logo images load eagerly, and empty
placeholder images are excluded from decode waits. Export errors and success are
shown inline on web. Native export retains Skia capture and platform sharing.
Validated an actual 1080 × 1920 Story download with photo, icon and bundled fonts;
27 Studio tests cover all four web output dimensions. Lint/typecheck pass.

Final validation update (2026-10-13): the authenticated admin flow now passes
save, close, reopen, full reload and an actual 1080 × 1080 PNG download. Saves
update the query cache, and the designer waits for fresh storage data before
mounting; this fixes reopening an older cached version. Browser export uses a
static platform-specific module so mixed web/native Metro sessions do not rely
on a stale dynamic-import module ID.

iPhone 17 / iOS 26 Simulator in Expo Go exported and opened the native share
sheet for Square (1080 × 1080), Portrait (1080 × 1350), Story (1080 × 1920) and
Landscape (1920 × 1080). The generated PNGs were inspected for dimensions and
visible photo, effects, text and Leaders icon. The sample was returned to Square
without replacing its photo or text. Native managed-image ownership now
normalizes trailing directory slashes, preventing repeated copying of a photo
already in durable storage. Successful migration also clears a previous copy
error. Existing copied assets remain retained for draft recovery and undo.

All 28 Studio tests, Expo lint and TypeScript pass. The temporary authenticated
validation draft was moved to recoverable Trash. These results supersede the
earlier missing-admin/expired-photo validation notes above. Physical iPhone and
Android photo picking, export and receiving-app sharing remain pending; simulator
sharing was dismissed after verifying output and did not send artwork elsewhere.
