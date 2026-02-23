Design a premium, abstract editorial news interface for “The Leaders” that strictly follows the Editorial Dark design system and its light‑mode counterpart. The UI must feel calm, authoritative, and cinematic rather than glossy or playful.xmethod+3

1. Overall style and layout

Desktop‑first layout on a 12‑column asymmetric grid (1320 px container, 24 px gutters).

Column allocation: sticky left rail (2 columns), main editorial feed and hero (7 columns), right featured / carousel (3 columns).

Enforce an 8 px spacing system for all vertical rhythm (8/16/24/32/80).

Composition should be content‑centric: typography and imagery dominate; chrome is minimal and functional.

2. Theme system (dark & light)

Produce a paired design: one dark theme and one light theme, sharing the same semantic tokens.

Dark theme: near‑black surfaces, soft off‑white text, subtle hairline borders and muted accents.uxdesign+2

Light theme: soft light neutrals, dark ink‑like text, equivalent contrast levels using like‑for‑like token swaps.[uxdesign]​

Use semantic color tokens (e.g., surface-primary, surface-raised, text-primary, accent-primary, border-subtle) so the visual style can be flipped between dark/light without structural changes.designsystemscollective+2

Always meet WCAG AA contrast in both themes (4.5:1 for body text, 3:1 for large text and UI).wildnetedge+5

3. Typography and hierarchy

Typographic tension:

Serif for editorial headlines (hero, featured, article titles).

Neutral sans‑serif for navigation, metadata, and body copy.

Type scale:

Hero headline: 56–64 px, bold serif, tight line‑height (≈1.1).

Featured titles: 28 px serif.

Article titles: 20–22 px serif.

Body: 15–16 px sans‑serif, line‑height 1.5–1.7.

Metadata and labels: 12–13 px, uppercase/small caps sans‑serif.

4. Components and shapes (no rounded elements)

Use strictly rectangular geometry for all components:

Buttons, cards, inputs, and tags have 0–4 px corner radius only (no pills or circles).

Avoid any round or pill‑shaped buttons and cards.

Core components to generate:

Top navigation bar with logo and primary categories.

Sticky left sidebar with text‑only filters (Trend., International., National., Local.).

Hero story module (image + overlay + label + headline + summary + CTAs).

Featured story card and vertical story list.

Trending grid cards.

Subscription/sign‑up block.

Footer with social links and secondary navigation.

5. Buttons, controls, and states

Buttons:

Rectangular, high‑contrast, with clear hierarchy: primary, secondary, tertiary.

Primary: filled (accent or high‑contrast neutral), rectangular, medium weight text.

Secondary: outlined or ghost, rectangular, clear border.

States:

Provide default, hover, active, disabled, and focus states for all buttons and key controls in both themes.

Hover: subtle elevation or color shift, no exaggerated animations (200–250 ms, cubic‑bezier easing).

Focus: clearly visible 2 px outline with an accessible color (often accent) that works in both dark and light.

6. Multilingual and internationalization support

Layout must gracefully support multilingual content including long word lengths and varying text density.smartling+3

Requirements:

Avoid text tightly constrained in fixed‑width chips; allow flexible width and extra whitespace for translations.

Ensure all key layouts work with right‑to‑left (RTL) languages (mirroring sidebars and carousels where appropriate).

Provide a clear, accessible language switcher in the top navigation, with rectangular toggle or dropdown.

Use short, unambiguous labels for navigation and actions to ease localization.rubric+1

7. Motion and interaction philosophy

Interaction style is subtle and editorial, not gamified:

Card hover: slight 1.02–1.04 scale, refined shadow change, optional soft color temperature shift in imagery.

Navigation hover: typography contrast shift and underlines, no heavy background blocks.

Respect prefers-reduced-motion: if set, disable scaling animations and rely on color/contrast changes only.wildnetedge+1

8. Content rules and data elements

Each article card should show: category, title, optional 1–3 line summary, reading time (calculated as ceil(words / 220)), and optional date.

Avoid showing avatars, reaction counts, and noisy social metrics on the main layout to maintain a quiet, premium editorial feel.

Headlines should remain concise and information‑rich; design must favor readability over decoration.smartling+1

9. Multiplatform and responsiveness

Desktop is the primary reference, but designs must include tablet and mobile layouts:

Tablet: 8‑column grid; hero spans full width; cards in 2‑column layout where possible.

Mobile: single column, order Hero → Featured → Trending → Categories → Subscription; filters become a horizontal scrollable segment bar, not a hidden hamburger.

10. Deliverables for agents

Produce:

A complete design system palette for both dark and light themes using semantic tokens.

Component variants (buttons, cards, navigation, filters, inputs) in both themes and both directions (LTR and RTL) where layout changes.

Example pages: Home (editorial hub), Article list, Article detail, and Subscription/landing.

Ensure all outputs are consistent, abstract, and reusable, so frontend and design agents can generate pixel‑perfect, premium UIs that obey this system automatically.
