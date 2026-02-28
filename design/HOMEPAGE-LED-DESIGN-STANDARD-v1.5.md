# The Leaders Homepage-Led Design Standard (v1.5)

Status: Active standard  
Owner: Product + Frontend  
Applies to: All user-facing pages in this repository (`/`, `/election-2026/*`, `/leaders*`, `/history*`, `/articles*`, `/about`, `/contact`, future pages)

## 1. Purpose

This document makes the current homepage design system the canonical UI/UX reference for the whole project.

If any future page conflicts with this document, this standard wins.

Goals:
- Keep a single visual language across all pages.
- Reuse homepage tokens, typography, spacing, and motion rules.
- Prevent color drift and generic template styling.
- Give clear implementation rules for Tailwind + shadcn/ui + existing components.

## 2. Design Direction (Canonical)

Aesthetic name: Editorial Civic Command  
Primary tone: Editorial + Institutional  
Differentiation anchor: Strong serif editorial hierarchy over a structured black/red/white civic UI system.

DFII (from `frontend-design` framing):
- Aesthetic Impact: 4
- Context Fit: 5
- Implementation Feasibility: 5
- Performance Safety: 4
- Consistency Risk: 2
- Score: 16 -> Execute fully

## 3. Non-Negotiables

1. Color family is restricted to black shades, red shades, and white shades only.  
2. No blue, cyan, indigo, purple, teal, or unrelated accent colors in UI surfaces, overlays, shadows, focus rings, or badges.  
3. Use semantic tokens from `src/app/globals.css`; do not hardcode random palette values in page components.  
4. Preserve editorial typography contrast: serif-led headlines + sans body/UI.  
5. Every new page must be responsive and preserve hierarchy on mobile first.

## 4. Color System and 60/30/10 Ratio

## 4.1 Ratio rule (per viewport, approximate)
- 60%: Black/charcoal structure (ink, overlay, rails, depth, frame contrast).
- 30%: White/off-white surfaces (cards, content planes, readable body areas).
- 10%: Red accents (primary CTA, active states, key highlights, focus moments).

## 4.2 Token source of truth
Use these existing tokens/classes from `src/app/globals.css`:
- `--home-bg`, `--home-card`, `--home-muted`, `--home-border`
- `--home-foreground`, `--home-muted-foreground`
- `--home-canvas`
- `--home-image-overlay-strong`, `--home-image-overlay-soft`, `--home-image-overlay-neutral`
- `.home-image-base`
- `.home-kicker`, `.home-title-xl`, `.home-title-lg`, `.home-title-md`, `.home-body`, `.home-meta`
- `.homepage-shell` semantic remapping (`--primary`, `--secondary`, `--accent`, `--ring`, etc.)

## 4.3 Accent usage limits
- One dominant red CTA per primary panel.
- Secondary actions use border + neutral background + red hover/focus.
- Avoid stacking many red-filled blocks in the same fold.

## 5. Typography Standard

## 5.1 Font roles
- Editorial/display: `var(--font-editorial)` (serif)
- Body/UI: `var(--font-sans)` (Manrope/Hind mapping by language)
- Meta labels: mono style already standardized in component classes

## 5.2 Type behavior
- Headings should remain editorial and high-contrast.
- Body copy must remain readable (`line-height` ~1.6+).
- Preserve Nepali-specific handling (`body.lang-ne` mappings already in `globals.css`).

## 6. Layout Standard

## 6.1 Container and rhythm
- Respect homepage container behavior (`.homepage-shell .container { max-width: 1340px; }`).
- Use section framing with borders (`border-border/80`) and layered background planes.
- Prefer spacing rhythm using 4/8/12/16/24/32 multiples.

## 6.2 Page composition model
Use one of these canonical compositions:

1. Hero + companion rail  
2. Feature split + secondary cards  
3. Data panel + module cards  
4. Editorial list + highlighted lead item  
5. Narrative section + utility sidebar

Do not introduce unrelated composition languages per page.

## 6.3 Geometry language
- Rectangular/clean edges preferred.
- Border-first separation over heavy rounded cards.
- Use overlays and hairline borders for depth, not large decorative gradients.

## 7. Component Standards

## 7.1 Buttons and links
- Primary button: red-led semantic primary.
- Secondary button: neutral with border, red hover/focus.
- Tertiary/text links: low-noise, red on hover.
- Touch target >= 44px on mobile.

## 7.2 Cards
- Default card shell: border + subtle background layer + restrained shadow.
- Image cards should use:
  - `.home-image-base`
  - one of `home-image-overlay-*` classes
- Metadata stays mono/compact; headline stays editorial.

## 7.3 Navigation
- Top-level nav should keep restrained contrast and precise active state.
- Sidebar/section navigation should be informative, not decorative.
- Active states should use red and structural border change.

## 7.4 Data and stats
- For data cards, keep metric-first hierarchy:
  1. label
  2. value
  3. hint/source
- No chart colors outside black/red/white family.

## 8. Motion Standard

Motion philosophy: meaningful and editorial, never playful/noisy.

Rules:
- Use 150ms-300ms for micro-interactions.
- Use transform/opacity over layout-thrashing properties.
- Keep reveal motion subtle (`y` small offset + opacity).
- Respect `prefers-reduced-motion`.
- Continuous loops must be slow, calm, and optional.

Reference implementation:
- `src/components/home/HomeScrollEffects.tsx`
- `src/components/home/ElectionCountdown.tsx`
- `src/components/home/ElectionSpecial.tsx`

## 9. Responsive and Mobile Rules

1. No horizontal overflow for content blocks.
2. CTAs stack cleanly on small viewports.
3. Typography scales down without collapsing hierarchy.
4. Dense desktop modules convert to clear single-column or 2-column tablet layouts.
5. Hover-only affordances must have mobile/tap equivalent.

## 10. Accessibility and Internationalization

Minimum standards:
- WCAG AA contrast (4.5:1 text baseline).
- Visible focus styles (`:focus-visible`) using red semantic ring.
- Keyboard-operable interactions.
- Proper alt text for meaningful images.
- Keep EN/NE parity in hierarchy, not just literal translation.
- Avoid rigid fixed-width text containers that break Nepali length.

## 11. shadcn/ui + Design System Integration Rules

Using `ui-design-system` and `shadcn-ui` principles:

1. Prefer semantic tokens + utility classes over hardcoded colors.
2. Extend component variants via `cva` where needed; avoid one-off class sprawl.
3. Keep components composable:
   - Base primitives in `components/ui`
   - Project variants/wrappers in feature folders
4. Do not fork visual language per feature area.
5. Keep accessibility attributes and keyboard behavior intact when customizing.

## 12. Page Blueprint Templates (Mandatory Mapping)

Every page must map to one blueprint:

## Blueprint A: Hub page
Use for: Home-like entry pages  
Structure: Hero -> Feature module -> Profiles/content grid -> Supporting narrative -> Timeline/footer action

## Blueprint B: Collection/List page
Use for: Articles, leaders lists, archives  
Structure: Header block -> lead card -> card/list grid -> filter/sort controls -> pagination/load-more

## Blueprint C: Detail page
Use for: Article detail, leader detail  
Structure: immersive header -> metadata rail -> readable body -> contextual related content -> next actions

## Blueprint D: Data/utility page
Use for: Election snapshot/map/metrics  
Structure: heading + context -> metric/data grid -> source links -> hub/back navigation

## 13. Implementation Checklist (Before Merge)

Use this checklist for each UI PR:

1. Uses homepage token system from `globals.css`.
2. Complies with black/red/white palette and 60/30/10 balance.
3. Preserves editorial typography hierarchy.
4. Mobile layout is clean (no clipped, misaligned, overflowed content).
5. Focus states, keyboard navigation, and reduced-motion behavior work.
6. CTA hierarchy is clear and consistent.
7. No dummy/fake labels or stale button text.
8. No visual style drift from homepage language.

## 14. Frontend Code Review Gate

For UI PRs, run the frontend review gate with `frontend-code-review` criteria:
- Code quality
- Performance behavior
- Business-logic correctness (UI state/action correctness)

Review output should prioritize urgent regressions first.

## 15. Adoption Plan for Existing/Future Pages

When upgrading any page:

1. Map page to one blueprint (A/B/C/D).
2. Replace local ad-hoc colors with semantic tokens.
3. Align typography with editorial/body roles.
4. Normalize CTA and card patterns.
5. Add/verify responsive and accessibility behavior.
6. Validate against the checklist in Section 13.

## 16. Versioning

Standard version: 1.5 baseline  
Source release: `v1.5.0` + post-release callback hotfix (`95f3070`)  
Last update: 2026-02-23

