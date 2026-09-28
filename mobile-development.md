# THE LEADERS — MOBILE NEWS APPLICATION

Act as a **principal mobile frontend engineer, product designer, UI/UX architect, and design-system engineer with 20+ years of product experience**.

Design and build a production-quality mobile application for **The Leaders / The-LeadersNP**, a modern Nepal-focused digital news and editorial platform.

The application must feel like a serious modern newsroom product — credible, fast, editorially sophisticated, calm, highly readable, and premium.

This is NOT a generic AI-generated news app.

Avoid:
- random gradients
- unnecessary cards
- meaningless badges
- excessive rounded containers
- excessive icons
- glassmorphism everywhere
- oversized headings
- fake statistics
- decorative UI without purpose
- excessive shadows
- duplicated metadata
- cluttered layouts
- TikTok-style gimmicks unless specifically appropriate
- generic bootstrap-style news grids
- placeholder lorem ipsum
- fabricated API endpoints
- fabricated breaking news

The experience should combine the editorial discipline of major international publications with a distinctly modern Nepali identity.

---

# 1. PRODUCT VISION

The Leaders should feel like:

**A premium digital newsroom built for Nepal, designed for readers who want clarity rather than noise.**

Core characteristics:

- editorial
- authoritative
- modern
- highly readable
- information-dense without being crowded
- fast
- bilingual
- personalized
- visually sophisticated
- trustworthy
- optimized for long-form reading
- equally strong for breaking news and deeper analysis

The experience should prioritize content over decoration.

The application must support:

- English
- Nepali
- bilingual editorial content
- breaking news
- latest news
- national news
- politics
- economy
- business
- technology
- world
- sports
- culture
- opinion
- editorials
- columns
- explainers
- daily brief
- saved articles
- search
- topic following
- notification preferences
- offline reading

---

# 2. TARGET PLATFORM

Build using:

```text
React Native
Expo
TypeScript
Expo Router
```

Prefer Expo unless there is a technical requirement that absolutely requires bare React Native.

Use stable, actively maintained packages only.

Architecture should remain compatible with future iOS and Android native builds through EAS.

Recommended foundations:

```text
React Native
Expo
Expo Router
TypeScript
TanStack Query
Zustand
React Native Reanimated
Expo Image
Expo Notifications
Expo SecureStore
AsyncStorage or MMKV where justified
React Hook Form
Zod
```

Do not install unnecessary dependencies.

For styling, use either:

```text
NativeWind
```

or a carefully structured React Native StyleSheet/token system.

Choose whichever results in the cleanest maintainable implementation.

Do NOT recreate web CSS patterns incorrectly in React Native.

---

# 3. BACKEND INTEGRATION

The Leaders already operates around a structured editorial/news pipeline.

Assume articles can contain bilingual structures resembling:

```ts
type LocalizedString = {
  en: string;
  ne: string;
};

type Article = {
  id: string;
  slug: string;

  title: LocalizedString;
  summary?: LocalizedString;
  content: LocalizedString;

  category: {
    id: string;
    name: LocalizedString;
    slug: string;
  };

  author?: {
    id: string;
    name: string;
    avatar?: string;
  };

  image?: {
    url: string;
    alt?: LocalizedString;
    caption?: LocalizedString;
    credit?: string;
  };

  publishedAt: string;
  updatedAt?: string;

  readingTime?: number;

  tags?: Array<{
    id: string;
    name: LocalizedString;
    slug: string;
  }>;

  isBreaking?: boolean;
  isFeatured?: boolean;

  source?: {
    name: string;
    url?: string;
  };
};
```

Do not invent a backend API.

Create a clean API adapter architecture such as:

```text
src/
  api/
    client.ts
    articles.ts
    categories.ts
    search.ts
    users.ts
    notifications.ts
```

Use environment configuration:

```text
EXPO_PUBLIC_API_URL=
```

If actual API routes are unavailable, keep repository methods typed and ready for connection.

Do not silently fabricate production endpoints.

---

# 4. INFORMATION ARCHITECTURE

Primary application navigation:

```text
Home
Latest
Explore
Saved
Profile
```

Use a bottom tab bar.

Recommended structure:

```text
Home
Latest
Explore
Saved
Profile
```

Do not put every section into bottom navigation.

Categories should live primarily inside Explore and contextual navigation.

Article pages should open above the tab hierarchy.

---

# 5. NAVIGATION ARCHITECTURE

Example Expo Router structure:

```text
app/
  _layout.tsx

  (tabs)/
    _layout.tsx
    index.tsx
    latest.tsx
    explore.tsx
    saved.tsx
    profile.tsx

  article/
    [slug].tsx

  category/
    [slug].tsx

  topic/
    [slug].tsx

  author/
    [id].tsx

  search/
    index.tsx

  notifications/
    index.tsx

  settings/
    index.tsx
    appearance.tsx
    language.tsx
    notifications.tsx
    reading.tsx

  onboarding/
    index.tsx
```

Support proper deep linking.

Example:

```text
theleaders://article/article-slug
```

---

# 6. DESIGN LANGUAGE

The Leaders should look editorial rather than app-template driven.

Visual personality:

```text
Serious
Editorial
Contemporary
Calm
Precise
Premium
Nepal-aware
Minimal
Content-first
```

Think in terms of:

- print-editorial typography
- intelligent whitespace
- strong information hierarchy
- restrained colors
- photography-led stories
- subtle motion
- consistent grids

Avoid making every item a floating card.

Use separators, spacing, typography, photography and layout hierarchy instead.

---

# 7. COLOR SYSTEM

Build semantic tokens rather than hard-coded component colors.

Suggested foundation:

## Light

```text
Background        #F7F7F4
Surface           #FFFFFF
Surface Secondary #F0F0EC

Text Primary      #111111
Text Secondary    #626262
Text Muted        #8B8B87

Border            #DEDEDA
Border Strong     #C7C7C1

Brand Red         #B62025
Brand Red Dark    #88181C

Breaking          #C82025
Success           #337A4A
Warning           #A66A17
```

## Dark

```text
Background        #0C0C0C
Surface           #151515
Surface Secondary #1C1C1C

Text Primary      #F6F6F3
Text Secondary    #B0B0AC
Text Muted        #7A7A76

Border            #292929
Border Strong     #3A3A3A

Brand Red         #D33A3F
```

The brand red should appear intentionally.

Use it for:

- active navigation
- breaking news
- important editorial accents
- selected controls

Do not flood the interface with red.

---

# 8. TYPOGRAPHY

Typography is one of the most important parts of this product.

Create separate editorial roles:

```text
Display
Headline
Subheadline
Body
Body Strong
Caption
Metadata
Label
Navigation
```

English typography should feel editorial and modern.

Nepali typography must properly support Devanagari.

Never assume English font metrics will work for Nepali.

Allow increased line-height for Nepali.

Example scale:

```text
Display       36–42
Hero headline 30–34
H1            28
H2            24
H3            20
Body Large    18
Body          16
Small         14
Metadata      12–13
```

Article content:

```text
font-size: approximately 18
line-height: approximately 29–31
```

Provide user-adjustable article font size.

At minimum:

```text
Small
Default
Large
Extra Large
```

---

# 9. SPACING SYSTEM

Use a strict spacing scale:

```text
4
8
12
16
20
24
32
40
48
64
```

Default screen horizontal padding:

```text
16–20px
```

Use consistent optical alignment.

Avoid arbitrary margins such as:

```text
17
23
29
```

unless genuinely required.

---

# 10. HOME SCREEN

The Home screen must feel curated by an editorial desk.

Do NOT simply render an infinite list.

Structure it into meaningful editorial sections.

Recommended hierarchy:

```text
Top App Header

Breaking News Strip — conditional

Lead Story

Top Stories

Latest

Nepal

Politics

Economy & Business

World

Technology

Sports

Opinion / Columns

Editor's Picks

Daily Brief
```

Do not necessarily show every section every time.

The feed should be API-driven.

---

# 11. APP HEADER

Home header should contain:

Left:

```text
THE LEADERS
```

or official logo.

Right:

```text
Search
Notifications
```

Optionally include compact EN / ने language control.

Do not overcrowd.

Header behavior:

- transparent/normal at top
- becomes compact after scrolling
- remains readable
- does not consume excessive vertical space

---

# 12. BREAKING NEWS

Breaking news should only render when:

```ts
article.isBreaking === true
```

Design:

```text
BREAKING
headline
timestamp
```

Use strong red editorial treatment.

Possible presentation:

```text
thin red accent
BREAKING label
single scrolling/current headline
```

Do not make it look like a stock ticker.

Tap opens article.

---

# 13. HERO STORY

The lead article receives strong visual hierarchy.

Recommended composition:

```text
Large 16:9 image

Category
Headline
Short summary

Published time • Reading time
```

Headline should dominate.

Avoid placing five metadata icons underneath.

Use typography rather than decoration.

---

# 14. TOP STORIES

Use one primary story followed by secondary editorial rows.

Example:

```text
Primary
large image + headline

Secondary
headline                     thumbnail

Secondary
headline                     thumbnail

Secondary
headline                     thumbnail
```

Avoid repeating giant cards.

---

# 15. STANDARD ARTICLE ROW

Create a reusable:

```text
<ArticleListItem />
```

Structure:

```text
Category
Headline
Metadata                     Image
```

Image:

```text
120 × 85 approximate ratio
```

Use subtle separator between stories.

Do not surround every row in a card.

---

# 16. EDITORIAL FEATURE CARD

For high-priority content:

```text
Large image
category
headline
summary
author/time
```

Use sparingly.

---

# 17. LATEST SCREEN

Purpose:

Provide a true chronological stream.

Layout:

```text
LATEST
Updated just now

All
Nepal
Politics
Business
World
Sports
Technology
```

Horizontal filter row.

Below:

```text
09:42
Article title
Category
thumbnail

────────────

09:28
Article title
Category
thumbnail
```

Chronological timestamps matter more here.

Support pull-to-refresh.

Implement infinite pagination.

---

# 18. EXPLORE SCREEN

Explore is discovery, not another feed.

Sections:

```text
Search

Browse Topics

Categories

Trending Topics

Featured Series

Authors / Columnists
```

Category grid should remain restrained.

Example:

```text
Nepal
Politics
Economy
Business
World
Technology
Sports
Culture
Opinion
```

Use typography and subtle dividers.

Avoid colorful icon tiles unless they have a real semantic purpose.

---

# 19. SEARCH

Search must feel extremely fast.

Screen structure:

```text
Search field

Recent searches

Trending searches

Results
```

Search across:

```text
article titles
article content
categories
tags
authors
```

Support debounce.

Example:

```ts
300ms
```

Results should highlight query matches where practical.

Search filters:

```text
All
Latest
Articles
Columns
Authors
```

Show clear empty state.

---

# 20. ARTICLE READING EXPERIENCE

The article screen is the most important screen in the entire product.

Design this with exceptional care.

Structure:

```text
Category

Headline

Summary / deck

Author
Published date
Updated date if applicable
Reading time

Hero image

Caption
Photo credit

Article content

Inline media

Tags

Sources

Author information

Related stories
```

---

# 21. ARTICLE HEADER

Example:

```text
POLITICS

Major article headline goes here and may span multiple lines

A concise editorial summary giving important context.

By Author Name
26 September 2026 • 8 min read
```

Do not clutter headline area.

---

# 22. ARTICLE CONTENT

Long-form readability is critical.

Use:

```text
18px body
comfortable line height
strong paragraph separation
proper Nepali typography
```

Support content elements:

```text
paragraph
heading
subheading
blockquote
image
caption
list
table
embedded media
related article
pull quote
```

Design these as structured rich-content blocks.

Do NOT render arbitrary HTML dangerously without sanitization.

---

# 23. ARTICLE TOOLBAR

Provide:

```text
Save
Share
Text size
Language
```

Possible implementation:

sticky compact toolbar or contextual article menu.

Avoid permanently occupying too much screen space.

---

# 24. LANGUAGE SYSTEM

The Leaders is bilingual.

Support:

```text
English
नेपाली
```

Language switching must work:

- globally
- inside an individual article

If an article contains:

```ts
title.en
title.ne
```

switch instantly without reloading.

Persist preference locally.

Do not translate navigation through machine translation at runtime if proper UI translations exist.

Use structured translation files:

```text
locales/en.json
locales/ne.json
```

---

# 25. SAVED ARTICLES

Saved page:

```text
Saved Articles

Recently Saved
Offline Available
```

Allow:

```text
save
unsave
download for offline reading
```

Keep UX simple.

Support swipe gesture only if discoverable and safe.

---

# 26. OFFLINE READING

Users should be able to download selected articles.

Cache:

```text
title
summary
content
image
metadata
```

Clearly display:

```text
Available offline
```

Never pretend content is current while offline.

When offline:

```text
You're offline
Showing downloaded stories
```

---

# 27. PROFILE

Keep profile useful rather than social.

Structure:

```text
Profile

Reading Preferences

Saved Articles

Followed Topics

Notification Preferences

Language

Appearance

Text Size

Offline Downloads

Privacy

About The Leaders
```

Authentication may be optional for basic reading.

---

# 28. NOTIFICATIONS

Notification center should distinguish:

```text
Breaking
Daily Brief
Topics you follow
Editorial picks
```

Preferences:

```text
Breaking News
Morning Brief
Evening Brief
Politics
Business
Technology
Sports
Opinion
```

Users should explicitly control these.

Do not request push permission immediately on first launch.

Ask after demonstrating value.

---

# 29. DAILY BRIEF

The existing The Leaders editorial system includes daily briefing content.

Make this a premium product feature.

Design:

```text
THE DAILY BRIEF

Saturday
26 September

5 stories you should know today
```

Each story:

```text
01
headline
2–3 sentence explanation
Read full story →
```

It should feel like an editor prepared a concise briefing.

---

# 30. OPINION / COLUMN ARTICLES

Opinion content must be visually distinguishable from reporting.

Display:

```text
OPINION

Author portrait

Author Name
Column title
Headline
```

Never visually blur reporting and opinion.

---

# 31. AUTHOR PAGE

Structure:

```text
Portrait
Author Name
Role
Short biography

Latest Articles
Columns
```

Follow author capability can be added if backend supports it.

---

# 32. CATEGORY PAGE

Example:

```text
POLITICS

Major lead story

Latest Politics

Analysis

Opinion
```

Do not simply reuse Home unchanged.

Category pages should have their own editorial hierarchy.

---

# 33. TRENDING

Trending should be data-driven.

Never generate fake trending numbers.

Possible presentation:

```text
01 Article headline
02 Article headline
03 Article headline
04 Article headline
05 Article headline
```

Use typography rather than cards.

---

# 34. MEDIA

Use Expo Image.

Requirements:

```text
responsive dimensions
cached images
placeholder state
progressive loading where possible
correct contentFit
error fallback
```

Never distort editorial photography.

Standard ratios:

```text
Hero      16:9
Feature   4:3
Thumbnail 4:3
Portrait  1:1
```

---

# 35. IMAGE CAPTIONS

Images should support:

```text
caption
credit
```

Example:

```text
Prime Minister addressing parliament on Friday.
Photo: The Leaders / Photographer
```

Render captions smaller and visually secondary.

---

# 36. TAB BAR

Bottom tabs:

```text
Home
Latest
Explore
Saved
Profile
```

Design:

- approximately 64px
- safe-area aware
- minimal icons
- labels visible
- active state using brand accent
- restrained background

Do not create a giant floating pill navigation unless usability clearly improves.

---

# 37. MOTION SYSTEM

Motion should communicate hierarchy and navigation.

Use React Native Reanimated.

Recommended:

```text
screen transitions       180–260ms
button feedback           100–160ms
image transitions         200–300ms
article toolbar reveal    spring
tab transitions           subtle
```

Avoid excessive bounce.

Use motion for:

- header compression
- bookmark feedback
- article image transitions
- tab state
- filter switching
- modal presentation
- pull-to-refresh feedback

Do not animate every element when scrolling.

---

# 38. MICROINTERACTIONS

Good examples:

Bookmark:

```text
outline bookmark
→ subtle scale
→ filled bookmark
```

Language toggle:

```text
crossfade article text
```

Like/follow controls:

```text
tiny tactile scale
```

Pull refresh:

custom minimal Leaders loading indicator.

---

# 39. LOADING STATES

Build dedicated skeleton components:

```text
HeroSkeleton
ArticleRowSkeleton
SearchResultSkeleton
CategorySkeleton
```

Skeleton layout must closely match real layout.

Do not use random generic rectangles.

---

# 40. EMPTY STATES

Design purposeful states.

Examples:

Saved:

```text
No saved stories yet.

Save stories to read them later or download them for offline reading.
```

Search:

```text
No stories found for “query”.
```

Offline:

```text
You're offline.

Downloaded stories are still available.
```

---

# 41. ERROR STATES

Handle:

```text
network unavailable
server error
image error
article unavailable
authentication expired
pagination failure
notification registration failure
```

Provide retry actions where appropriate.

Never expose raw stack traces to users.

---

# 42. ACCESSIBILITY

Meet WCAG-style mobile accessibility principles.

Requirements:

```text
44px+ touch targets
screen-reader labels
logical focus order
dynamic font compatibility
sufficient contrast
reduced-motion support
accessible image descriptions
```

Never use color as the only information carrier.

---

# 43. PERFORMANCE

Optimize aggressively.

Targets:

```text
fast cold start
smooth 60fps scrolling
minimal JS blocking
pagination
image caching
query caching
lazy screen loading
memoized complex rows
optimized FlatList
```

Use:

```text
FlatList
SectionList
```

where appropriate.

Avoid rendering hundreds of stories inside ScrollView.

---

# 44. DATA FETCHING

TanStack Query conventions:

```text
queryKeys.articles.latest()
queryKeys.articles.featured()
queryKeys.article(slug)
queryKeys.category(slug)
queryKeys.search(query)
```

Configure:

```text
staleTime
retry behavior
pagination
prefetching
offline handling
```

Prefetch article details when useful.

---

# 45. STATE MANAGEMENT

Use Zustand only for client application state such as:

```text
language
theme
reading preferences
saved IDs
onboarding status
temporary UI state
```

Do not store server data twice.

TanStack Query owns remote server state.

---

# 46. THEME

Support:

```text
Light
Dark
System
```

Theme switching should happen without restart.

Persist preference.

Use semantic design tokens:

```ts
colors.background
colors.surface
colors.textPrimary
colors.textSecondary
colors.border
colors.brand
```

Never scatter raw hex values through screens.

---

# 47. READING SETTINGS

Allow:

```text
Font size
Light / Dark / System
English / Nepali
```

Optional:

```text
Serif reading mode
```

if typography system supports it cleanly.

---

# 48. SHARE

Use native share sheet.

Share:

```text
headline
canonical article URL
```

Do not create unnecessary custom share screens unless required.

---

# 49. DEEP LINKS

Support article URLs.

Example web URL:

```text
https://theleadersnp.com/article/example-story
```

Mobile application should resolve that URL to:

```text
/article/example-story
```

Prepare universal linking architecture.

---

# 50. ANALYTICS ARCHITECTURE

Create a provider abstraction.

Events:

```text
app_opened
article_viewed
article_completed
article_saved
article_shared
search_performed
category_opened
language_changed
notification_opened
offline_downloaded
```

Do not hard-couple components to a specific analytics vendor.

Example:

```ts
analytics.track("article_viewed", {
  articleId,
  category,
  language,
});
```

---

# 51. SECURITY

Never expose secrets in mobile code.

Only public environment variables may ship inside client bundles.

Authentication tokens:

```text
Expo SecureStore
```

Sanitize external content.

Validate API responses using Zod where useful.

---

# 52. PROJECT STRUCTURE

Use a scalable structure similar to:

```text
src/
  api/
  components/
    article/
    common/
    navigation/
    skeleton/
  constants/
  hooks/
  i18n/
  lib/
  providers/
  services/
  state/
  theme/
  types/
  utils/

app/
  ...
```

Avoid giant files.

Target:

```text
screen files < ~300 lines where practical
```

Extract meaningful components rather than arbitrary fragments.

---

# 53. CORE COMPONENTS

Create reusable production components:

```text
AppHeader
SectionHeader
BreakingNewsBar
LeadStory
ArticleListItem
ArticleFeatureCard
ArticleMetadata
ArticleImage
CategoryLabel
AuthorRow
ArticleBody
ArticleToolbar
BookmarkButton
LanguageSwitcher
SearchInput
FilterTabs
EmptyState
ErrorState
LoadingIndicator
DailyBriefCard
OpinionCard
TrendingList
TopicChip
```

Every component must have a clear responsibility.

---

# 54. DESIGN TOKEN SYSTEM

Create:

```ts
theme/
  colors.ts
  typography.ts
  spacing.ts
  radius.ts
  shadows.ts
  motion.ts
```

Example:

```ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  "2xl": 32,
  "3xl": 48,
};
```

---

# 55. BORDER RADIUS

Editorial products should not look overly bubbly.

Use restrained radii.

Example:

```text
small controls    6
image             8
cards              8–12
modal             16–20
```

Do not use:

```text
borderRadius: 30
```

everywhere.

---

# 56. HAPTICS

Use subtle haptic feedback for:

```text
save article
important toggle
successful preference change
```

Do not trigger haptics while users are simply scrolling.

---

# 57. ONBOARDING

Keep onboarding extremely short.

Maximum:

```text
3 screens
```

Suggested:

### Screen 1

```text
News that matters.
Clear reporting from Nepal and beyond.
```

### Screen 2

Choose preferred language:

```text
English
नेपाली
```

### Screen 3

Choose optional interests:

```text
Politics
Business
Technology
Sports
World
Culture
```

Then:

```text
Start Reading
```

Do not force account creation.

---

# 58. FIRST-LAUNCH EXPERIENCE

After onboarding:

```text
Home
```

Do not immediately display:

```text
notification permission
tracking permission
signup modal
newsletter modal
```

Earn trust first.

---

# 59. LOGIN

If authentication is supported:

```text
Continue with Google
Continue with Apple
Email
```

But reading news must not require an account.

Accounts primarily enable:

```text
cross-device saved stories
followed topics
preferences
personalized alerts
```

---

# 60. EDITORIAL TRUST

Provide subtle but accessible publishing metadata.

Support:

```text
Published
Updated
Author
Source
Photo credit
Corrections
```

If an article was significantly updated:

```text
Updated 2:42 PM
```

Do not hide corrections.

---

# 61. SOURCE HANDLING

Where source information exists:

```text
Sources
```

can appear near the end of the article.

External links should visually indicate leaving the app.

Do not make source display visually dominate reporting.

---

# 62. ADVERTISING PREPARATION

Design layout so future advertising can be introduced without destroying reading UX.

Possible controlled placements:

```text
between homepage sections
after several article paragraphs
between feed batches
```

Create an abstract:

```text
<AdSlot />
```

but do not insert fake advertisements.

---

# 63. SOCIAL VIDEO / SHORT CONTENT

Architect the application so vertical video can be added later.

Do NOT make it a primary tab in V1 unless content strategy requires it.

Potential future route:

```text
/watch
```

Keep architecture extensible.

---

# 64. TABLET RESPONSIVENESS

The app should not merely stretch phone UI.

For tablets:

```text
max-width content column
two-column editorial layouts
larger gutters
article reading width restriction
```

Example article reading width:

```text
680–760px
```

---

# 65. ARTICLE READING PROGRESS

Add subtle reading progress.

Preferred:

```text
2px progress bar underneath navigation/header
```

Do not use intrusive percentage badges.

---

# 66. SCROLL BEHAVIOR

Article:

- header can collapse
- progress remains available
- toolbar accessible
- title does not unnecessarily remain permanently sticky

Feeds:

- preserve scroll position
- returning from article should restore position

This is mandatory.

---

# 67. PULL TO REFRESH

Home and Latest support pull-to-refresh.

Use a custom but minimal brand indicator.

Do not refresh automatically every few seconds while the user reads.

---

# 68. DATE HANDLING

Backend timestamps should use ISO format.

Render based on context.

Examples:

Recent:

```text
12 min ago
```

Older:

```text
26 Sep 2026
```

Article:

```text
26 September 2026
```

Future support can include Nepal date / Bikram Sambat where backend provides it.

Do not calculate inaccurate Bikram Sambat conversions manually without a validated date system.

---

# 69. NETWORK STATUS

Create:

```text
NetworkStatusProvider
```

When connection disappears:

```text
You're offline
```

Use a small non-blocking banner.

When restored:

```text
Back online
```

Automatically refetch stale queries.

---

# 70. UI DETAIL REQUIREMENTS

For every screen implement:

```text
loading state
success state
empty state
error state
offline state where applicable
```

Do not consider a screen complete without these.

---

# 71. CODE QUALITY

Requirements:

```text
TypeScript strict mode
no unnecessary any
typed navigation
typed API responses
reusable hooks
clear naming
small modules
ESLint
Prettier
```

Avoid:

```text
500-line components
inline magic numbers
duplicate API logic
duplicate style definitions
business logic inside JSX
```

---

# 72. DESIGN REVIEW RULE

Whenever adding UI ask:

```text
Does this improve comprehension, navigation, credibility, or interaction?
```

If the answer is no, remove it.

The Leaders must avoid the common AI-generated UI problem where every empty space is filled with:

```text
badge
icon
gradient
statistic
pill
decorative text
```

Whitespace is intentional.

---

# 73. HOME SCREEN VISUAL HIERARCHY

The first viewport should approximately communicate:

```text
THE LEADERS                    Search Notification

BREAKING
Important breaking headline

[Large editorial photograph]

POLITICS
Lead story headline spanning
two or three strong lines.

Concise summary explaining why
this story matters.

12 min ago • 6 min read
```

Then:

```text
TOP STORIES
────────────────────────────

Headline                         Image
Politics • 22 min ago

────────────────────────────

Headline                         Image
Economy • 34 min ago
```

This is the design philosophy.

Not:

```text
<Card>
<Card>
<Card>
<Card>
<Card>
```

---

# 74. ARTICLE VISUAL HIERARCHY

Example:

```text
←                                         ⋯

POLITICS

Nepal Parliament Approves
Major Reform Following
Lengthy Debate

The legislation introduces changes that
could reshape...

By The Leaders Desk
26 September 2026 · 7 min read

────────────────────────────

[ HERO IMAGE ]

Caption text
Photo: ...

Article paragraph...

Article paragraph...

SUBHEADING

Article paragraph...
```

Clean, serious and highly legible.

---

# 75. UX PRIORITIES

In this exact order:

```text
1. Reading clarity
2. Content hierarchy
3. Performance
4. Navigation clarity
5. Trust
6. Accessibility
7. Personalization
8. Visual polish
```

Never sacrifice readability for animation.

---

# 76. IMPLEMENTATION PHASES

Build sequentially.

## Phase 1 — Foundation

Implement:

```text
Expo project
routing
theme
tokens
fonts
language architecture
API client
query provider
state provider
shared UI
```

## Phase 2 — Primary Navigation

Implement:

```text
Home
Latest
Explore
Saved
Profile
```

## Phase 3 — Reading

Implement:

```text
Article page
rich article renderer
bookmarks
share
reading preferences
language switching
```

## Phase 4 — Discovery

Implement:

```text
Search
Categories
Topics
Authors
Trending
```

## Phase 5 — Personalization

Implement:

```text
authentication adapter
followed topics
notification preferences
saved sync
```

## Phase 6 — Offline

Implement:

```text
article download
cached reading
offline UI
network handling
```

## Phase 7 — Notifications

Implement:

```text
push registration
deep links
notification center
topic notification preferences
```

## Phase 8 — Polish

Implement:

```text
animations
haptics
accessibility
tablet layout
performance optimization
analytics hooks
testing
```

---

# 77. TESTING

At minimum test:

```text
English rendering
Nepali rendering
very long headlines
missing images
missing author
offline state
dark theme
large accessibility font
slow network
pagination
bookmark persistence
language persistence
deep links
empty search
API errors
```

Also test:

```text
Android small screen
modern Android phone
iPhone SE-sized viewport
modern iPhone
large iPhone
tablet
```

---

# 78. EDGE CASES

Design for headlines exceeding 3 lines.

Do not truncate important article titles unnecessarily.

Handle:

```text
no summary
no image
no author
very long category
very long Nepali headline
image loading failure
missing translation
content containing embedded assets
```

If Nepali version is unavailable:

```text
Nepali version unavailable
View English →
```

Never show undefined values.

---

# 79. APP QUALITY STANDARD

The finished product should feel capable of launching publicly.

It should NOT feel like:

```text
tutorial project
dashboard template
AI website
news clone
component library demo
```

It should feel like a product built by:

```text
experienced newsroom designers
senior product designers
senior React Native engineers
```

---

# 80. FINAL DELIVERABLE

Produce a complete functional application.

Deliver:

```text
1. Expo React Native project
2. TypeScript codebase
3. scalable routing
4. complete design tokens
5. reusable components
6. Home
7. Latest
8. Explore
9. Search
10. Article reader
11. Saved
12. Profile
13. Settings
14. Language switching
15. Dark/light mode
16. API service architecture
17. offline-ready architecture
18. notification-ready architecture
19. loading/error/empty states
20. responsive tablet support
```

Also create:

```text
README.md
ARCHITECTURE.md
DESIGN_SYSTEM.md
API_INTEGRATION.md
```

README must include:

```text
installation
environment configuration
development commands
build commands
folder structure
API connection instructions
EAS build instructions
```

---

# 81. DEVELOPMENT BEHAVIOR

Before writing implementation code:

1. Inspect the existing repository.
2. Do not overwrite working code unnecessarily.
3. Identify existing design system and backend contracts.
4. Reuse working infrastructure.
5. Create the required architecture.
6. Build the design system before individually styling screens.
7. Complete each screen with all UI states.
8. Test navigation after each major phase.
9. Fix warnings and TypeScript errors immediately.
10. Do not leave temporary UI in production routes.

Do not rewrite unrelated existing code.

Do not install packages merely because they are popular.

Every dependency must solve a real problem.

---

# 82. MOST IMPORTANT DESIGN PRINCIPLE

**The content itself is the visual design.**

Photography, headlines, spacing, typography, hierarchy and editorial organization should create the experience.

Do not attempt to make The Leaders look premium by adding more decoration.

Make it premium by removing everything unnecessary.

The final application should feel like a modern, credible, Nepal-focused newsroom that could realistically compete with established digital publications while having a distinctly contemporary product experience.