# The Leaders mobile design system

## Single source of truth

Edit `src/theme/design-system.json`. It supplies `tokens.ts` (native styles),
`ThemeProvider` (runtime NativeWind RGB variables), and `tailwind.config.js`
(utility fonts, type sizes, semantic geometry). There is no second CSS palette.

- `brand.red`: identity and filled actions; currently `#B71C1C`.
- `brand.darkAccentMix`: blend the identity with white for readable dark-mode
  text and icons. Filled buttons retain the identity red and white labels.
- `spacing.gutter`: horizontal screen alignment everywhere. Use `px-gutter`,
  `mx-gutter`, or `spacing.gutter`; never copy the numeric value into a screen.
- `spacing.card`: panel padding (`p-panel`).
- `layout.touchTarget`: minimum control target (`min-h-touch`).
- `layout.controlHeight`: form field and primary control height.
- `layout.iconSize`, `iconSmall`, `iconLarge`: consistent icon geometry.
- `typography`: product text styles for both languages.
- `readerTypography`: article reading preferences, shared with Settings.
- `fonts`: Onest for UI and Hind for Nepali.
- `editorialFonts`: Onest for English editorial headings and article bodies, Hind for
  Nepali. Load only regular, medium, semibold and bold faces.

JSON changes update native styles through Fast Refresh. Restart Metro when changing
Tailwind's font, spacing or radius configuration; use `npm run web -- --clear`.
Persisted user choices and generated social-post artwork are independent content,
not theme values. The designer's application chrome inherits the theme; artboard
coordinates and chosen artwork colors stay with the exported design.

## Layout calculations

Use logical React Native units, not physical device pixels.

| Rule | Calculation / value |
| --- | --- |
| Base rhythm | 4-point rhythm; 4, 8, 12, 16, 24, 32, 48, 64 |
| Phone gutters | 20 per side |
| Compact feed row | available width − 2 × gutter − thumbnail width − row gap |
| At 320 width | 320 − 40 − 96 − 12 = 172 for copy |
| Minimum control | 44 × 44; fields use 48 high |
| Bottom tabs | width / 5; at 320, each tab has 64 width |
| Image | available content width / 1.85 high; no fixed phone image height |
| App content | min(available width, 840), centered on larger displays |
| Reader content | min(available width, 720), with semantic gutters |
| Headline | 32/45 editorial display; 24/32 sans page title; 20/28 compact story |
| Reader | size presets 16/26, 18/30, 21/34, 25/40 |
| Text contrast | normal text ≥ 4.5:1 on background, surface and elevated surfaces |
| Nepali | Hind; no negative letter spacing; natural line wrapping |

The reader may add language-specific leading to the selected text size. Headlines
wrap instead of being cut to make rows equal-height. Summaries may collapse with
an explicit expansion control; the article body is never truncated.

## Component ownership

- `Masthead`: Home identity, search and notification actions, language handoff.
- `PageHeader`: page title and accessible language control for other screens.
- `ArticleRow`: compact story anatomy; Home, category, search, author and related.
- `StoryCard`: lead image, headline, summary and save action.
- `TimelineRow`: Latest wraps the shared story row with save/share actions.
- `SectionHeader`: consistent section hierarchy.
- `SettingsGroup`, `SettingsRow`, `SegmentedControl`: preferences and settings.
- `Button`, `Input`: shared minimum dimensions and control geometry.
- `AppText`: explicit semantic type variant, weight and color token.
- `StateView`: shared loading/error/empty treatment.
- `StatusDot`: static status marker; no decorative infinite pulse.

New screens use semantic tokens and these components. Do not style headings with
arbitrary `text-[...]` classes. Avoid page-specific font scales and palettes.
Reserve custom geometry for charts, artwork and platform behavior.

## Editorial rules

A breaking item must have a valid, non-future timestamp within the configured
24-hour window. Older stories show calendar dates after seven days. All story
date formatting is shared. Publication dates use Nepal's timezone; they can differ
from the development computer's local date.

Only show editorial review, photo credits, schedules, trending ranks or author
roles when the API supplies evidence. Do not invent trust badges. Notification
preferences currently store local intent; push delivery is not connected.

## Validation

`npm run check` runs Expo lint and TypeScript. `npm run test:design` checks actual
text/background contrast, action contrast, brand propagation, runtime variable
coverage, small-phone geometry, timestamp rules and loaded font faces.

Browser preview review covers phone widths, tablet constraints and bilingual
rendering. It does not replace iOS/Android device testing with VoiceOver/TalkBack,
OS large text, safe areas, offline recovery, save/share and native navigation.

Visual refinement: neutral gray surfaces, exact identity red for filled actions,
measured red accent on dark surfaces, 13-point captions/metadata, and balanced
web headline wrapping. Typography is selected by semantic role, not by screen.

Current direction: contemporary sans-serif throughout English, with stronger
headline weight and tighter display tracking. Traditional serif faces are removed.

Product availability is controlled separately in `src/config/features.ts`.
Fact checks are currently disabled in Home, search results and direct deep links.
Re-enable the single flag to restore access without deleting editorial content.
