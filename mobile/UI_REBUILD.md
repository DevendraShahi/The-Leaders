# Structured mobile rebuild

## Completed: foundation and main reading flow

One canonical design source now feeds native styles and NativeWind. The duplicate
CSS and compatibility palettes are removed. Shared typography, gutters, radii,
control targets, icon sizes, light/dark colors and responsive width constraints
apply across the application. Utility-screen geometry has begun migrating to the
same semantic tokens instead of repeated literal values.

Home now has a restrained masthead, balanced lead summary, fixed story rows,
readable dates and expiring breaking labels. Latest uses the same compact row
anatomy with real pagination controls. Explore inherits the page header and shared
controls; its article listing no longer claims unsupported trending metrics.
Saved inherits the shared header and theme. Profile is rebuilt from settings
primitives with English/Nepali parity and functional theme/text-size choices.

The article reader uses explicit type variants, shared reading preferences,
collapsible summaries, accurate bylines/dates, save/share actions, responsive
reading width, missing-translation handling and a working progress preference.
Fabricated editorial-review badges, author roles, photo credits and inactive
listen/comment actions were removed from the reader.

## Continue in this order

| Stage | Scope | Completion criterion |
| --- | --- | --- |
| 1 | Shared foundation and main reader | Tokens, shared controls, five tabs, reader; lint/typecheck/design contract checks |
| 2 | Discovery and saved-reading flows | Search/categories/authors, follow persistence, full saved-copy behavior; validate results/error/empty/offline flows |
| 3 | Specialty content | Brief, fact check, leader/candidate, history, parties, manifestos, charts; migrate remaining page-specific geometry to semantic patterns |
| 4 | Creator and audio tools | Designer control chrome and radio, keeping output-artwork geometry separate; verify export/playback and reduced motion |
| 5 | Native accessibility and release review | Actual iOS/Android builds, large fonts, screen readers, safe areas, keyboard, offline recovery, navigation, performance |

Specialty routes already inherit the unified theme and relevant shared components.
They have not all received a complete screen-specific visual and native-device
audit. The remaining work is explicit rather than hidden behind a claim that the
full application is production-ready.

## Rules for every stage

1. Inspect the actual API/storage contract before changing behavior.
2. Solve repeated layout requirements in a shared component or token first.
3. Keep English/Nepali and light/dark together in the same implementation.
4. Preserve real publishing metadata; remove invented claims and inactive controls.
5. Check loading, empty, retry and missing content before considering a screen done.
6. Validate at 320 phone width, a modern phone width, and tablet width.
7. Run lint/typecheck and relevant contract tests before handing off a stage.
8. Update this document with actual validation and remaining native work.

## Validation completed in this change

- Expo lint and strict TypeScript.
- Six design contract tests: semantic contrast, brand propagation, utility variable
  coverage, phone geometry, timestamp boundaries and loaded font faces.
- Browser review of Home, Latest, Explore, Profile and reader at phone widths.
- Profile reviewed in Nepali/light and English/dark at 320 width.
- Settings preferences restored after visual review.
- iOS and Android Hermes bundle exports completed successfully.
- Article reader reviewed at 320 phone width and 1024 tablet width.

Native simulator/device verification remains pending.

Saved is now a library route opened from Explore, with a dedicated return control.
Readers have Home, Latest, Explore and Profile tabs; server-verified active admins
also have Studio in the former Saved position. Native sign-in remains to be wired.

## Functionality follow-up

Discovery, full saved copies, author follows, brief routing and the radio player
have now been repaired. The player uses flat station rows, clear identity, one
primary playback control and actual connection state. Shared button geometry
includes a token-driven player size. See `FUNCTIONAL_FIXES.md` for the verified
flows and setup-dependent work. This does not complete the native release audit.
