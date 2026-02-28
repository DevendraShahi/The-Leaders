# v1.6.0 - DistrictNewsPanel Implementation Reference

## Purpose
This document is the implementation reference for building and maintaining the district insights side panel in:

- `src/app/election-2026/components/DistrictNewsPanel.tsx`

It covers:

- UI/UX structure and behavior
- Frontend logic and matching systems
- Backend/API flow
- Data/database model currently used by this feature

---

## 1) UI/UX Reference

### 1.1 Panel behavior
- Component type: right-side, full-height slide-in panel with `AnimatePresence`/`motion`.
- Trigger context: selected district from election map/store.
- Close behavior: clears selected district in store and closes panel.

### 1.2 Section structure (current order)
1. Description (non-collapsible intro)
2. District Demographics
3. Election Snapshot
4. FPTP Candidates (2082)
5. Party Wins (FPTP 2022)
6. Last Election Results (2022)
7. Data Trust Layer

### 1.3 Interaction model
- Collapsible section cards via shared `PanelSection`.
- Each section maintains open/closed state in local component state.
- State resets when selected district changes.

### 1.4 Candidate row UX requirements (current)
- Show: name, party badge, symbol, constituency, gender, age, education, election status, profile link.
- Hide for now: votes and rank (removed from UI display by requirement).

### 1.5 Party visual language
- All party-related UI should resolve party color from `public/map/parties.json`.
- Applied in:
  - FPTP candidate rows/badges
  - Party wins cards/bars
  - Last election results row accents and winner/runner-up party chips
- Unknown party names fall back to default neutral styles.

---

## 2) Frontend Logic Reference

### 2.1 Data inputs
- Verified panel API response: `/api/election/district-profile`
- Fallback local profile: `getDistrictElectionProfileByName`
- Language and locale from language provider
- District selection from election Zustand store

### 2.2 Party matching and normalization system
The panel uses a multi-step resolver for both color and rank:

1. Normalize incoming party names (Unicode + punctuation + spacing cleanup).
2. Expand aliases (`PARTY_COLOR_ALIASES`) for Nepali/English/wiki variants.
3. Apply pattern rules (`PARTY_WIKI_PATTERN_ALIASES`) for forms like `CPN-UML`, `People's Socialist Party`, etc.
4. Expand text variants (`PARTY_TEXT_VARIANTS`) for acronym and spelling drift.
5. Generate candidate match keys (`buildPartyMatchKeys`) and resolve:
   - Color via `PARTY_COLOR_LOOKUP`
   - Rank via `PARTY_RANK_LOOKUP`

### 2.3 Candidate sorting rules
For district panel FPTP candidates:
1. Primary: official party rank from `src/data/political-parties2026.json` (`ranking.overall`), resolved using same party matcher.
2. Fallback: district-local party wins order if official rank not found.
3. Tie-breakers: constituency asc -> party name asc -> candidate name asc.

### 2.4 Source label standardization
- Local source labels are standardized to `The Leaders Findings`.
- Legacy labels are normalized at read-time in backend service before response.

### 2.5 Cache/query versioning
- Client query version constant in panel (`DISTRICT_PROFILE_QUERY_VERSION`).
- Service cache schema version constant in backend (`DISTRICT_PROFILE_SCHEMA_VERSION`).
- Both are used to force refresh when payload contract changes.

---

## 3) Backend Logic Reference

### 3.1 API endpoint
- Route: `src/app/api/election/district-profile/route.ts`
- Handler:
  - Validates district query param
  - Calls `getVerifiedDistrictProfile(district)`
  - Returns `DistrictProfileApiResponse`

### 3.2 Service pipeline
Core service file:
- `src/lib/district-verified-profile-service.ts`

Pipeline summary:
1. Load local district profile baseline.
2. Enrich text/metrics from Wikipedia + Wikidata when available.
3. Verify/enrich 2022 constituency result rows from Wikipedia constituency pages.
4. Load district FPTP candidates from ECN dataset.
5. Build merged `DistrictVerifiedProfile`.
6. Apply source-label normalization and cache.

### 3.3 Caching model
- In-memory maps:
  - `profileCache` for district profiles
  - `constituencyCache` for constituency page extraction
- TTL: 6 hours
- Cache key includes schema version for profile payload evolution.

---

## 4) Database / Data Storage Logic

There is no dedicated persistent DB table for `DistrictNewsPanel` payloads.
Current data model is hybrid:

### 4.1 Primary structured local datasets
- District baseline: `src/data/Districts/*`
- Party ranking: `src/data/political-parties2026.json`
- Party colors: `public/map/parties.json`
- FPTP candidates: `public/election/candidates/FPTP-2082.json`

### 4.2 Runtime external enrichments
- Wikipedia summary and constituency result pages
- Wikidata district metrics

### 4.3 Runtime cache (memory)
- Service-level in-memory caches only
- No write-back persistence to Mongo/Postgres for this feature

Implication:
- Cold start rebuilds enriched profile from source files and external lookups.
- Cache invalidation uses version constants + TTL.

---

## 5) Data Contract Notes

District panel candidate contract (`DistrictPanelCandidate`) currently includes:
- identity/location basics
- party/symbol info
- `age`
- `education` (derived from `details.qualification`)
- status/rank/image/profileSlug

UI intentionally does not render votes/rank for FPTP district rows at this stage.

---

## 6) Files of Interest

- UI:
  - `src/app/election-2026/components/DistrictNewsPanel.tsx`
- API:
  - `src/app/api/election/district-profile/route.ts`
- Service:
  - `src/lib/district-verified-profile-service.ts`
- Types:
  - `src/lib/types/district-profile-types.ts`
- Data:
  - `public/map/parties.json`
  - `src/data/political-parties2026.json`
  - `public/election/candidates/FPTP-2082.json`
  - `src/data/Districts/*`

---

## 7) Release Checklist (DistrictNewsPanel)

1. Run `npm run build`.
2. Verify panel section order and collapsible state reset on district switch.
3. Verify party color application across candidates, party wins, and last election rows.
4. Verify candidate cards show `Education` and do not show votes/rank.
5. Spot-check mismatched party names (wiki/local variants) still resolve color/rank.
6. Confirm source labels show `The Leaders Findings` for local fields.

