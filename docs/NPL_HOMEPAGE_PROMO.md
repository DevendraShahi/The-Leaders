# NPL homepage campaign

The homepage mounts `src/components/home/NplWelcomePopup.tsx`; its styles are in the adjacent CSS module. It links to `/npl` and uses the existing language provider and accessible Radix dialog.

- Opens 1.4 seconds after mounting, once per browser per 24 hours.
- Close button, Escape, backdrop click and “Continue reading” dismiss it.
- Does not compete with another open dialog.
- Stops after November 21, 2026 in Nepal time. Update `CAMPAIGN_END` and version the storage key for a future campaign.
- Local-storage restrictions do not break the page; persistent frequency limits require working storage.
- The artwork is promotional, not a photograph of an actual NPL game. No current results or “live” claims are baked into it.

## Generated asset

Built-in image-generation tool; optimized local asset: `public/images/npl/homepage-campaign-2026.webp` (1536 × 1024, approximately 172 KB). Typography, real logos and navigation are HTML, separate from the image, so they stay crisp, accessible and translatable.

Generation prompt:

> Use case: ads-marketing. Create an extraordinary premium sports campaign photograph illustration for a Nepal Premier League cricket homepage promotional modal. Landscape 3:2 composition. A dramatic cricket batter seen from behind in a rich crimson jersey with no lettering, playing a powerful lofted stroke at a packed Nepal cricket ground at blue hour. Strong floodlights cut through fine atmospheric haze, emerald pitch, tiny tasteful Nepal flags in the stands, layered silhouetted Himalayan foothills in the distant background. Bat and ball realistically proportioned, authentic cricket stance and equipment, premium editorial sports photography, subtle film grain, deep midnight navy shadows, warm ivory highlights, restrained crimson accents, believable anatomy. Batter occupies right third, clean dark atmospheric negative space in left third, cinematic depth and exceptional art direction, energetic but refined. This is a stylized promotional visual, not documentation of a real match. NO text, NO typography, NO logos, NO watermarks, NO trophies, NO brands, NO fake scoreboards, no abstract neon, no UI. Make it visually arresting and polished like an international sports campaign. Full bleed image.

## Verification

Run `npx vitest run src/test/components/npl-welcome-popup.test.tsx`, TypeScript, targeted ESLint and the production build. Check phone portrait and landscape: the dialog must fit the viewport, scroll internally on short screens and retain access to dismissal and the `/npl` link. Clear only the campaign key in browser storage to replay during development.
