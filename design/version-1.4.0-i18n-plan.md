# Version 1.4.0 – Nepali Language & i18n Rollout

## Overview

The goal of version **1.4.0** is to make _The Leaders_ fully bilingual (English + Nepali) across all major user-facing areas, with a clean, robust content pipeline driven by the existing Perplexity ingest. This release must preserve editorial quality and avoid regressions in the existing English experience.

High‑level objectives:

- Introduce a global language system (`en` / `ne`) with a single source of truth.
- Store bilingual content in a normalized way across election entities and core site content.
- Extend the Perplexity JSON ingest to support language‑aware updates (English, Nepali, or both) in a single daily bulk operation.
- Update the frontend (election dash, daily briefs, fact checks, analyses, articles, history, leaders, etc.) to respond to a global language switch.
- Provide a first‑visit experience that lets users choose language alongside cookie consent.

---

## Scope

**In scope**

- Global language management (context/provider + persistent preference).
- Navbar and footer updates with language switch and Nepali typography.
- Election 2026 pages:
  - Daily Brief (all layouts + slug pages).
  - Fact Checks (index + detail).
  - Election Analyses (index + detail).
  - Parties, PR candidates, profiles, election dashboard, map‑v2.
- Core content sections:
  - Articles (index + detail).
  - History section(s).
  - Leaders (list + profile).
  - Static editorial pages (About, History, Election 2026 landing) where Nepali copy is available.
- Backend ingest for election content (Perplexity JSON), extended to handle bilingual fields and language‑aware updates.
- Loader / onboarding updates to include language selection with cookie controls.

**Out of scope (for 1.4.0)**

- Deep localization of date/time formats or numerals (can be considered later).
- Arbitrary third‑language support (design will be extensible, but only `en` / `ne` will be implemented now).

---

## Data Model & Schema Changes

### 1. Election Content Models

Update `ElectionContent` sub‑models to store bilingual text consistently:

- **DailyBrief**
  - `title: { en: string; ne: string }`
  - `summary: { en: string; ne: string }`
  - `content: { en: string; ne: string }`
  - `tags: string[]` (language‑agnostic)
  - `date: Date`
  - `slug: string` (language‑neutral)
  - `isPublished: boolean`

- **FactCheck**
  - `claim: { en: string; ne: string }`
  - `analysis: { en: string; ne: string }`
  - `sources: string[]`
  - `verdict: "true" | "false" | "misleading" | "unverified"`
  - `slug: string`
  - `date: Date`

- **ElectionArticle**
  - `title: { en: string; ne: string }`
  - `excerpt: { en: string; ne: string }`
  - `content: { en: string; ne: string }`
  - `slug: string`
  - `editor: string`
  - `tags: string[]`
  - `status: "draft" | "published" | ...`

Implementation notes:

- Migrate existing single‑language fields into the `en` branch.
- Nepali (`ne`) fields can initially be empty; ingest route will fill them as content arrives.

### 2. Core Content Models (Articles, Leaders, History, etc.)

Most of these already have some `en` / `ne` fields. For 1.4.0:

- Normalize to a consistent pattern where feasible:
  - `title.en`, `title.ne`
  - `excerpt.en`, `excerpt.ne`
  - `body.en`, `body.ne` (or equivalent).
- Introduce a small helper for reading localized values:

```ts
function getLocalized<T extends { en?: string; ne?: string }>(
  field: T | undefined,
  lang: "en" | "ne"
): string | undefined {
  if (!field) return undefined;
  return field[lang] || field.en;
}
```

This helper avoids scattered fallback logic in components.

---

## Perplexity JSON & Ingest Design

### 1. JSON Schema Extensions

Perplexity JSON remains a single bulk payload with `meta`, `dailyBriefs`, `factChecks`, and `articles`. Each item now includes bilingual fields:

**DailyBrief item**

- `title_en`, `title_ne`
- `summary_en`, `summary_ne`
- `content_en`, `content_ne`
- `slug_hint` (unchanged)
- `date` (unchanged, ISO string)
- `tags: string[]`
- `isPublished: boolean`

**FactCheck item**

- `claim_en`, `claim_ne`
- `analysis_en`, `analysis_ne`
- `claimBy` (language can be kept English; optional `claimBy_ne` later if needed)
- `verdict: "true" | "false" | "misleading" | "unverified"`
- `sources: string[]`
- `date` (ISO)

**ElectionArticle item**

- `title_en`, `title_ne`
- `excerpt_en`, `excerpt_ne`
- `content_en`, `content_ne`
- `slug_hint`
- `tags: string[]`
- `status`
- `editor`

Optional: per‑item language declaration, e.g.

- `languages: ["en", "ne"]` (derived from which fields are present), used only for analytics and UI reporting.

### 2. Parser & Validation Rules

The parser in `src/app/api/admin/perplexity-ingest/route.ts`:

- Continues to:
  - Accept a JSON string or object.
  - Validate top‑level structure (`meta`, `dailyBriefs`, `factChecks`, `articles`).
  - Return `{ ok, data, errors }` with strict type checking.
- New behavior:
  - For each bilingual field pair (`*_en`, `*_ne`):
    - Validate each present field as string.
    - If both are missing or empty, record an error for that item and skip it.
  - Never invent or transform content: values are mapped 1:1 into `en` / `ne` branches.

### 3. Language‑Aware Upsert Logic

`ingestToDatabase(data: NormalizedData)`:

- Upsert records by slug (or claim+date for fact checks).
- For each bilingual field:

  - If `*_en` is present and non‑empty in the payload:
    - Update the `.en` branch in MongoDB.
  - If `*_ne` is present and non‑empty in the payload:
    - Update the `.ne` branch.
  - If a particular language value is absent or `""`:
    - Do **not** overwrite that language’s existing content in the DB.

- This supports arbitrary workflows:
  - Nepali‑only run → only `.ne` fields updated.
  - English‑only run → only `.en` fields updated.
  - Mixed run → both updated where provided.

### 4. Safety & Audit

- `ActivityLog` entries for ingest will include:
  - `meta` (run id, time window, etc.).
  - `counts` per language:
    - `dailyBriefs: { enUpdated, neUpdated }`
    - `factChecks: { enUpdated, neUpdated }`
    - `articles: { enUpdated, neUpdated }`
  - `errors` from parser (if any items were rejected).
- Admin “Import Perplexity” UI can show:
  - Total items processed.
  - How many updated EN vs NE.
  - Any items skipped due to validation issues.

Expected outcome:

- Operator can confidently run NE‑only or EN‑only batches without clobbering the other language.
- Any structural issues in the JSON will be caught before DB writes.

---

## Global Language Switching

### 1. Language Provider

Add a client‑side context in something like `src/components/providers/language-provider.tsx`:

- State:
  - `language: "en" | "ne"`
  - `setLanguage(lang: "en" | "ne")`
- Persistence:
  - Read from `localStorage["theleaders-lang"]` (and optionally a cookie).
  - Write on each change.
- API:
  - `useLanguage()` hook for components.

Mounted at the app root (in `layout.tsx`) so all components can access it.

### 2. Navbar & Footer

- Main navbar and election navbar:
  - Add a language switch UI (`EN | NE` toggle, or segmented button).
  - On click:
    - Call `setLanguage("ne")` or `setLanguage("en")`.
  - Reflect selected language visually (Bebas / mono tags as per README).
- Footer:
  - Use localized labels (`About`, `History`, `Contact`, etc.) via a simple translation map keyed by language.

Expected outcome:

- One global switch affects all pages instantly.
- Language choice is remembered between sessions.

---

## Frontend Localization Usage

### 1. Election 2026 Flows

**Daily Briefs**

- Index (`/election-2026/daily-brief`):
  - All cards / timeline layouts fetch:
    - `title[language]`, `summary[language]` and `content[language]` for previews.
  - Fallback to English when Nepali is missing.

- Detail (`/election-2026/daily-brief/[slug]`):
  - Use full `content[language]`.
  - Metadata (date, tags) remains language‑agnostic but labels can be localized.

**Fact Checks**

- Index (`/election-2026/fact-checks`):
  - Cards show `claim[language]`, `analysis[language]` snippet.
- Detail (`/election-2026/fact-checks/[slug]`):
  - Full `claim[language]`, `analysis[language]`.
  - Verdict labels (`True`, `False`, etc.) localized via dictionary.

**Analyses**

- Index (`/election-2026/analyses`):
  - Use `title[language]`, `excerpt[language]`.
- Detail (`/election-2026/analyses/[slug]`):
  - Render `content[language]` with markdown/HTML as currently done for English.

**Other Election Pages**

- Parties, PR candidates, profiles, election dashboard, map‑v2:
  - Where textual descriptions exist, adopt `getLocalized` helper.
  - Where only English exists, fallback remains English.

### 2. Core Site

- Articles (`/articles`, `/articles/[slug]`):
  - Use bilingual fields to show localized titles, excerpts, and body.
- History pages:
  - Localize timelines, descriptions, and section headings where translations exist.
- Leaders:
  - Names generally stay as‑is; bios, tags, and descriptive text use localized fields.
- Static pages (`/about`, `/history`, `/election-2026` landing):
  - Move hardcoded English phrases into a small translation map (per page) where a Nepali version is provided.

Expected outcome:

- Language switch produces a coherent Nepali experience for all election and core editorial content, with graceful fallback to English for missing translations.

---

## Loader & Cookie / Language Selection

### 1. Initial Screen Flow

On first visit (no language preference stored):

- `PremiumLoader` (or a small overlay after loader) shows:
  - “Choose your reading language”
  - Two options: `English` / `नेपाली`
  - Optional: short description about availability (e.g., “Some content may appear in English until fully translated.”)

On selection:

- Set language in `LanguageProvider`.
- Persist to `localStorage` and optionally to a cookie (for server hints).
- Optionally record basic consent preferences (or open the cookie banner immediately after).

On subsequent visits:

- Skip this language prompt and respect stored preference.

Expected outcome:

- User consciously picks language early.
- Global language state is in sync with loader and navbar toggle.

---

## Expected Outcomes

- All major content types (daily briefs, fact checks, election analyses, articles, history, leaders) can display in Nepali or English from the same DB record.
- The Perplexity ingest can be run:
  - EN‑only, NE‑only, or both, without overwriting the other language unintentionally.
- Admins see clear summary of what was ingested per language.
- Frontend language switch is global, persistent, and smooth (no page reload required beyond what is already necessary).
- First‑visit experience includes language choice alongside cookie/privacy messaging.
- Build and lint remain clean in both local and CI environments.

---

## Testing Plan

### 1. Backend / Ingest Tests

Manual or automated test scenarios for `perplexity-ingest`:

1. **EN‑only run**
   - JSON contains `*_en` fields, `*_ne` omitted.
   - Existing DB:
     - Has `en` filled, `ne` empty for some records.
   - Expected:
     - `en` fields updated where provided.
     - `ne` fields remain unchanged.

2. **NE‑only run**
   - JSON contains only `*_ne` fields.
   - Expected:
     - `ne` fields updated.
     - `en` fields unchanged.

3. **Mixed run (EN+NE)**
   - Some items have both languages, some only one.
   - Expected:
     - For each item, only provided language branches are updated.
     - Missing branches remain unchanged.

4. **Structural error**
   - Missing `meta`, `dailyBriefs`, `factChecks`, or `articles`.
   - Expected:
     - Parser returns `ok: false`, with detailed `errors`.
     - No DB writes performed.

5. **Partial item validation error**
   - DailyBrief missing `title_en` and `title_ne`.
   - Expected:
     - That item is skipped with recorded error.
     - Other valid items are ingested.

6. **Activity log**
   - After a valid run, confirm `ActivityLog` entry contains:
     - `meta` matching JSON payload.
     - `counts` per language.
     - `errors` array as appropriate.

### 2. Frontend Tests

Manual verification flows:

1. **Global language toggle**
   - Switch language from navbar.
   - Expected:
     - Election 2026 header, subnav, and cards update.
     - Static nav/footer labels update.

2. **Daily Brief index & detail**
   - In EN:
     - Verify English titles/summaries.
   - Switch to NE:
     - Verify Nepali text appears where provided.
     - English fallback used where Nepali is missing.

3. **Fact Checks index & detail**
   - Toggle language and confirm claims/analysis change.
   - Verdict labels localized properly.

4. **Election Analyses**
   - Confirm `title`/`excerpt`/body respond to language switch.

5. **Core pages (articles, history, leaders)**
   - Confirm localized titles and body where translations exist.
   - Confirm fallback behavior where NE is empty.

6. **First‑visit loader**
   - Clear storage/cookies and reload.
   - Verify language prompt appears.
   - Choose Nepali:
     - Verify site loads in Nepali.
   - Refresh:
     - Verify language choice persists.

### 3. Technical Checks

- `npm run lint` – passes with no errors.
- `npm run build` – passes, no TypeScript errors.
- Optional: run key pages in production build (`next start`) to spot any hydration issues related to language switching.

---

## Versioning & Deployment

- Bump `package.json` to `"version": "1.4.0"`.
- Update `CHANGELOG.md` with:
  - New features (bilingual content, language switch).
  - Perplexity ingest enhancements.
  - Any schema migrations.
- Tag release in Git after verification (`v1.4.0`).
- Deploy using existing pipeline (e.g., Vercel) once build and smoke tests pass.

