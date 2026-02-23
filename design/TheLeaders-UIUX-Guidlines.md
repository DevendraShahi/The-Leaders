1. Executive Summary

The Editorial Dark design system defines a desktop‑first, editorial interface for The Leaders, combining traditional print journalism aesthetics with modern digital brutalism. It prioritizes content clarity, calm density, and high credibility using near‑black surfaces, strong contrast, and a disciplined grid. The system is optimized for long‑form political and news content, with responsive rules for tablet and mobile while preserving the brand’s quiet, authoritative feel.xmethod+4

2. Core Design Principles

Content centricity

UI chrome must visually recede; typography and imagery carry the hierarchy.

No decorative clutter: icons, badges, and borders exist only when they convey meaning.

Quiet density

Use 1 px hairline borders, subtle shadows, and spacing to compartmentalize information instead of heavy boxes.

Layout supports high information density without feeling crowded.

Typographic tension

Serif for editorial headlines, Sans‑Serif for UI and body copy.

Maintain strong contrast between expressive headlines and neutral interface text.

Infinite depth

Near‑black backgrounds (not pure black) to prevent eye strain while letting foreground content “float” above.toptal+2

Gradients and controlled shadows signal elevation.

Accessibility first

All text must meet or exceed WCAG 2.1 AA contrast: 4.5:1 for normal text, 3:1 for large text.accessibilitychecker+3

Motion and color usage must never be the only carriers of information.

3. Grid, Layout & Rhythm

3.1 Macro layout (desktop)

Viewport reference: 1440 px width; max container: 1320 px.

Global grid: 12‑column asymmetric editorial grid with 24 px gutters.

Column allocation (desktop ≥ 1200 px):

Left navigation rail: 2 columns (sticky).

Hero / main feed: 7 columns.

Right featured / carousel: 3 columns.

3.2 Baseline rhythm (8 px system)

All vertical spacing snaps to an 8 px baseline.

Standard vertical spacing:

Section to section: 80 px.

Card to card: 32 px.

Text block to text block: 16 px.

Label → title: 8 px.

Title → summary: 12 px.

3.3 Responsive behavior

Tablet (768–1024 px)

Grid: 8 columns, 24 px gutters.

Hero becomes full‑width (spans all 8 columns).

Secondary cards arranged 2 per row where possible.

Left sidebar collapses into a horizontal filter bar below the top nav.

Mobile (<768 px)

Layout order: Hero → Featured → Trending → Categories → Subscription.

Categories remain visible as a horizontally scrollable pill list; no hamburger‑only navigation for primary sections.

CTAs stack vertically with 16 px spacing.

Cards become full‑width single‑column items with generous vertical spacing (24–32 px).

4. Navigation & Information Architecture

4.1 Top navigation bar

Height: 72 px fixed.

Background: solid near‑black (#0E0E0F–#121212), 95–100% opacity.blog.logrocket+2

Position: sticky at top, spanning viewport width.

Contents (left to right):

Brand: “The Leaders” logotype or icon, left‑aligned with main content.

Primary categories: Sport, World, Politics, Business, Science, Health, Arts, Books, Style, Food, Traveling, Magazine, Weather (configurable).

Spacing: 24 px between items; use an overflow “More” menu on smaller widths.

Optional: Search icon, profile/login, theme toggle on far right.

States:

Default nav item: Sans‑Serif, 14–15 px, medium gray text (#A1A1AA).

Hover: text transitions to white.

Active: white text with 2 px bottom underline or bottom border using accent color.

4.2 Left sidebar (section navigation)

Width: 2 columns (~176–200 px including padding).

Behavior: sticky from top nav down; remains visible during scroll on desktop.

Contents:

Top: compact mark (globe or “TL” monogram) + “The Leaders”.

Vertical filter labels (text only):

“Trend.”, “International.”, “National.”, “Local.” (configurable).

Stacked with 16–24 px spacing.

Active state:

White text (#FFFFFF).

2–3 px left indicator bar in accent red (#B71C1C).

Inactive state:

Medium gray text (#6B7280).

Tablet/mobile:

Converts into a horizontal segmented filter below the hero, with the same wording and active states.

5. Visual Style & Theming

5.1 Color palette

Backgrounds

Page base: #0E0E0F / #121212.lovable+3

Card surfaces: #111111 / #18181B.

Elevated overlays: #1F2933 with subtle shadow.

Text

Primary: #FFFFFF.

Secondary: #A1A1AA.

Muted/meta: #6B7280.

Accents & borders

Accent primary: #B71C1C (deep red), used for:

Active filters, critical tags, error states, and key CTAs.

Hard limit: 3–5 uses per viewport to avoid visual noise.

Dividers & hairlines: #262626 for 1 px borders.

Shadows & elevation

Card default: 0 10px 30px rgba(0, 0, 0, 0.35).

Card hover: 0 16px 40px rgba(0, 0, 0, 0.55).

5.2 Imagery & gradients

Hero images: cinematic city or political imagery with strong direction and depth.

Overlay for hero and large cards:

linear-gradient(90deg, rgba(0,0,0,0.75), rgba(0,0,0,0.25)) to protect text contrast.

Photography provides most of the color; UI chrome remains monochromatic.

6. Typography System

6.1 Typefaces

Primary serif (editorial): Playfair Display, Libre Baskerville, Canela, or equivalent.

Used for article titles, hero headlines, and key section headers.

Line-height: 1.1–1.2 for display sizes.

Secondary sans‑serif (UI): Inter, Source Sans 3, or equivalent.

Used for navigation, metadata, body text, controls.

Line-height: 1.5–1.7 for body text.xmethod+1

6.2 Type scales

Level 1 – Hero headline

Size: 56–64 px.

Weight: 600–700.

Typeface: serif.

Level 2 – Featured headline

Size: 28 px.

Weight: 600.

Typeface: serif.

Level 3 – Article titles (cards)

Size: 20–22 px.

Weight: 600.

Typeface: serif.

Body text

Size: 15–16 px.

Weight: 400.

Typeface: sans‑serif.

Metadata (labels, time, category pills)

Size: 12–13 px.

Weight: 500.

Uppercase or small caps; letter spacing 0.08–0.12 em.

7. Component Library & Hierarchy

7.1 Visual hierarchy levels

Level 1 – Hero story

Dominant headline + cinematic image spanning 7 columns.

Includes category label, headline, summary line (optional), and CTAs.

Level 2 – Featured story

Large card in right column or below hero.

Includes category, headline, summary (2–3 lines), and reading time.

Level 3 – Trending cards

Smaller cards with title only or title + one‑line context.

Optimized for quick scan.

Level 4 – Subscription / promo block

Visual “palette cleanser” with simplified copy and a prominent CTA.

7.2 Hero section spec

Layout:

Left: text cluster within hero (max width 480 px).

Right: hero image with gradient overlay.

Content:

Category label (sans, small caps, accent if needed).

Hero headline (L1).

Optional one‑sentence deck.

CTAs:

Primary: “Play Video” or “Read Story”.

Secondary: “View Coverage”, “All Stories”.

CTAs:

Primary button:

Background: white, text black.

Border radius: 999 px (pill).

Icon: 16 px play or arrow icon.

Secondary button:

Transparent background, 1 px white alpha border, white text.

7.3 Content cards

Required elements:

Category label.

Title (L2 or L3).

Optional summary (1–3 lines).

Reading time (e.g., “5 min read”).

Layout pattern:

Category label → 8 px → Title → 12 px → Summary → 8 px → Meta row.

Restrictions:

No author avatars, reaction counts, or comment badges on homepage cards.

Social proof content belongs inside article detail pages to keep homepage quiet.

7.4 Right featured column / carousel

Supports:

Featured story with summary and reading time.

Optional carousel with Prev/Next controls and dots.

Accessibility:

Keyboard navigable; arrow keys cycle stories.

ARIA roles for region, list, and buttons.

7.5 Subscription block

Visual style:

Centered or full‑width block on dark background with slightly lighter card.

Copy focuses on value promise: “Providing high‑quality digital content every day”.

Elements:

Short heading, one‑line explainer, email field, primary CTA.

8. Micro‑Interactions & States

8.1 Hover

Cards & images:

Scale: 1.00 → 1.04.

Shadow: default → hover token.

Duration: 250 ms.

Easing: cubic-bezier(.22, .61, .36, 1).

Navigation links:

Color shift from gray (#A1A1AA) to white.

Optional 2 px bottom border with fade‑in animation (150–200 ms).

8.2 Focus & active states

Focus:

2 px outline using accent red (#B71C1C) or high‑contrast white ring.

Always outside the element, not inset, to remain visible.

Active (pressed):

Reduce scale to 0.98, reduce shadow to imply “press”.

Short duration (120–150 ms) on release.

8.3 Motion discipline

Avoid large parallax or continuous looping animations.

Respect prefers-reduced-motion; when enabled, disable scale and complex transitions, leaving only opacity changes.designstudiouiux+1

9. Content, Copy & Data Rules

9.1 Tone & headlines

Tone: calm, authoritative, analytic; no clickbait or sensational phrasing.

Headlines:

Clear subject + impact; avoid unnecessary adjectives.

Length: 60–90 characters optimal for desktop hero.

9.2 Reading time calculation

Reading time must be programmatically generated as:

time_minutes = ceil(total_words / 220).omnicalculator+2

Display as “X min read” with metadata.

9.3 Category labels & tags

Consistent naming, capitalization, and slug usage (e.g., “International”, “National”).

Trailing periods (e.g., “Trend.”) used only in the sidebar filters as a brand signature.

Critical tags (e.g., “Breaking”, “Exclusive”) may use accent red but must be limited to protect hierarchy.

10. Accessibility & Semantics

10.1 Color contrast

All text vs background must achieve:

Normal text (<24 px non‑bold): contrast ≥ 4.5:1.

Large text (≥24 px or ≥19 px bold): contrast ≥ 3:1.dequeuniversity+3

UI components and icons: contrast ≥ 3:1 against adjacent surfaces.

10.2 Semantic structure

Page structure:

<header>: global navigation and logo.

<nav>: primary nav and sidebar filters.

<main>: hero, feeds, subscription, and main content.

<article>: each story or long‑form content block.

<section>: group related cards (Trending, Featured, Categories).

<footer>: site links, social icons, legal copy.

Screen readers:

Hero story marked as landmark region with aria‑label (e.g., “Top Story”).

Carousels use ARIA roles and announced slide counts (e.g., “Story 2 of 5”).

11. Implementation & Tokenization

11.1 Design tokens (examples)

Color tokens:

--bg-page: #121212;

--bg-surface: #18181B;

--border-subtle: #262626;

--text-primary: #FFFFFF;

--text-secondary: #A1A1AA;

--text-muted: #6B7280;

--accent-primary: #B71C1C;

Typography tokens:

--font-serif: 'Playfair Display', 'Libre Baskerville', serif;

--font-sans: 'Inter', system-ui, sans-serif;

Size variables for each level (--font-size-h1, --font-size-body, etc.).

Spacing tokens:

--space-2: 8px;

--space-3: 12px;

--space-4: 16px;

--space-5: 20px;

--space-6: 24px;

--space-8: 32px;

--space-10: 40px;

--space-20: 80px;

11.2 CSS & component architecture

Architecture:

Use CSS custom properties at :root for core tokens and theme overrides.

Component library organized as:

TopNav, SideNav, HeroStory, StoryCard, FeaturedCard, TrendingList, SubscriptionBlock, Footer, Carousel.

Agentic usage:

Design agents can reference tokens and component names directly when generating new layouts.

Engineering agents must:

Enforce 8 px spacing scale.

Use semantic HTML tags and ARIA roles as defined.

Apply reading‑time calculation algorithm on all article lists.

12. Production Quality Checklist

Before shipping any new page or component under The Leaders – Editorial Dark system, agents and humans must verify:

Grid alignment follows 12‑column (desktop) or 8‑column (tablet) rules; spacing adheres to the 8 px baseline.

No more than 3–5 uses of accent red are present in any viewport.

Text and UI contrast meet WCAG 2.1 AA thresholds using a contrast checker.testparty+3

Cards include required fields (category, title, optional summary, reading time) and omit author avatars and engagement stats on the homepage.

Navigation and filters remain visible and usable on mobile without relying solely on a hamburger menu.

Motion respects prefers-reduced-motion and all interactive elements have focus states.
