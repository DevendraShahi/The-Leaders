# Mobile Production Readiness

## Design direction

The Leaders is an editorial civic product, not a generic feed. The mobile system
uses a restrained newsroom character: Onest for UI and English editorial text, Hind for
Nepali, brand red as the action colour, and consistent
44-point minimum hit areas. Light and dark schemes come from one semantic token
source in `src/theme/design-system.json`, shared with NativeWind. See
`DESIGN_SYSTEM.md` for calculations and `UI_REBUILD.md` for staged work.

## Audit: current state and next work

| Area | Current state | Status | Required next step |
| --- | --- | --- | --- |
| Navigation | Expo Router tabs, stack, deep-link scheme | Ready | Validate deep links on Android and iOS devices. |
| Notifications | Real recent-news inbox with refresh/retry and honest empty state | Push pending | Link Expo project, register device tokens and implement server delivery. |
| Visual system | Shared color, type, space, radius tokens; theme provider; native button primitives; a compatibility facade routes legacy text through the same token system | Ready | New screens must import `@/ui/primitives/AppText` directly. |
| Bundle performance | Only the font faces loaded by the design system are imported | Ready | Keep this direct-import pattern for any new font face; validate bundle size before release. |
| Accessibility | Many interactive elements have labels and roles; dynamic type limits are present | Partial | Audit every screen with TalkBack and VoiceOver; add labels/hints/states to remaining controls and verify 44-point targets. |
| Motion | Reanimated and native feedback are in place; radio observes Reduce Motion | Partial | Centralize reduced-motion behavior for all loops and press animations. |
| Content states | Network toast, state views, saved-story persistence and local-reader fallback, React Query cache | Partial | Test slow/offline/retry flows against the production API and verify saved-copy coverage on physical devices. |
| Web storage | Native uses SQLite; web uses a synchronous local-storage adapter for saved stories | Ready | Include browser saved-story persistence in release QA; do not migrate the browser path to alpha SQLite without end-to-end validation. |
| Localization | English/Nepali provider and Hind font support | Partial | Complete copy parity and test long Devanagari strings on every screen. |
| Code quality | TypeScript and Expo lint are configured | Passing | `npm run check` passes without warnings. |
| Automated tests | Nine functional tests, six design tests and live API smoke checks | Partial | Add native device flows for saved copies, search, reader, radio and offline recovery. |
| Release builds | EAS development, preview, and production profiles are configured | Ready to configure | Link the Expo project and create signing credentials before the first cloud build. |
| OTA updates | `expo-updates` is installed | Not configured | Run `npx eas-cli@latest update:configure`, then use preview/production update branches only after device validation. |
| Observability | Opt-in first-party daily event counts and root render recovery | Partial | Configure detailed crash reporting, release tags and alert ownership; counts do not provide per-user retention. |
| Security & privacy | Secure Store is installed; public API base is environment-driven | Partial | Verify auth token storage, server-side authorization, privacy manifest, permission copy, and data-retention policy. |
| Store readiness | App identifiers and icons are present | Partial | Provide final store metadata, screenshots, support URL, privacy URL, age rating, and legal contacts. |

## Standards applied

- **Human-centred design:** user research, task-based usability testing, and a
  design review of the actual iOS and Android builds.
- **Accessibility:** WCAG 2.2 AA as the baseline, plus iOS VoiceOver and Android
  TalkBack validation. Do not rely on colour alone; announce state changes and
  respect text scaling and reduced motion.
- **Platform conventions:** Apple Human Interface Guidelines and Material 3 for
  navigation, feedback, safe areas, sheets, typography, permissions, and system
  bars.
- **Release safety:** a development build for engineering, an internal preview
  for design/QA, then a store production build. Production releases require
  quality checks, real-device smoke testing, staged rollout, monitoring, and a
  rollback owner.

## Build sequence

1. Install dependencies and run `npm run check` from `mobile/`.
2. Set the real `EXPO_PUBLIC_API_URL` in EAS environments for `development`,
   `preview`, and `production`. This is public client configuration, never a
   secret.
3. Authenticate the release owner with Expo, then run
   `npx eas-cli@latest build:configure` once. It links this app to an Expo
   project and manages platform signing credentials.
4. Configure OTA updates with `npx eas-cli@latest update:configure` after the
   project is linked. Review the generated project ID and update URL before
   committing them.
5. Create a real-device development build: `npm run build:development`.
6. Ship a QA build: `npm run build:preview`. Run the smoke matrix below on both
   platforms.
7. Only after approval, build with `npm run build:production` and submit through
   the relevant stores.

## Minimum device smoke matrix

- iOS and Android: light/dark, English/Nepali, large system text, screen reader,
  cold launch, deep link, back navigation, portrait safe areas.
- Network: online, slow connection, request failure, reconnect, saved-library
  persistence, offline saved-copy fallback, cancelled request.
- Editorial: reader, search, save/remove, share, disabled fact-check routes, radio playback,
  and post designer export.
- Release: fresh install, upgrade from the previous build, API base for the
  correct environment, crash-free launch, and privacy/permission prompts.

See `FUNCTIONAL_FIXES.md` for current repairs. Deploy the matching public API
changes before release. Radio background playback configuration requires a new
native build and physical-device testing; successful bundle exports are not
device-level playback verification.
