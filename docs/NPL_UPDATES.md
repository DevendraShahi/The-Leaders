# NPL update playbook

## Current editorial checkpoint

Checked **30 October 2026, 09:25 Nepal time** (03:40 UTC).

- Match 1: Lumbini 88/3 (9.5), Sudurpaschim 87 (17.2); Lumbini won by seven wickets.
- Match 2: Chitwan 157/3 (20), Biratnagar 149 all out (19.3); Chitwan won by eight runs.
- Match 3: Karnali 132/9 (20), Janakpur 113 all out; Karnali won by 19 runs.
- Match 4: Pokhara 145/7 (20), Sudurpaschim 148/4 (16.5); Sudurpaschim won by six wickets.
- Match 5: Janakpur 116/2 (17.2), Kathmandu 115 all out (19.3); Janakpur won by eight wickets.
- Match 6: Karnali 187/6 (19.5), Biratnagar 186/7 (20); Karnali won by four wickets.
- Next fixture: Match 7, Lumbini v Chitwan, October 31 at 12:30 NPT. No result inferred from scheduled time.
- Evening starts, including playoffs, changed from 16:30 to 17:00; daytime starts remain 12:30. November 20 is the pre-final rest day.
- Standings are **calculated from confirmed league results**, not copied from a stale table.

### Evidence and discrepancies

1. [Season preview and timing revision](https://www.nepalpremierleague.org/news/npl-2026-season-preview): reports October 20 revision to 17:00, season dates and rest days.
2. [Match 2 score summary](https://nplt20league.com/matches/2026/biratnagar-kings-vs-chitwan-rhinos-npl-2nd-match-2026/): scores, overs, eight-run margin.
3. [Match 3 score summary](https://nplt20league.com/matches/2026/karnali-yaks-vs-janakpur-bolts-npl-3rd-match-2026/): scores and 19-run margin.
4. [Kantipur NPL coverage](https://ekantipur.com/npl): independently agrees on both results. Retains old evening times and reports Janakpur's final overs as **19.2**, whereas the score summary reports **19.3**. Publish **113 all out** without overs until resolved.
5. The nepalpremierleague.org points table was only through Match 2 at review time. Its Match 3 live widget also contained impossible overs. A site's branding or “live” label is not verification; prefer CAN/competition scorecards and corroborate final results independently.

## Update locations

| Change | File | Effect |
| --- | --- | --- |
| Confirmed results, sources, last check and unresolved items | `src/lib/npl-season-update.ts` | Shared fixture results, hero, results cards and calculated standings |
| Schedule dates, teams and start times | `src/lib/post-studio/cricket-fixtures.ts` | Public NPL and Studio fixture selection; update `fixtureScheduleChecked` |
| Full player-by-player scorecards | `src/lib/npl-match-data.ts` | Correct match scorecard modal; never reuse another match's card |
| Hero selection rules | `src/lib/npl-spotlight.ts` | Explicit live → today's overdue fixture → next scheduled → latest overdue; latest result separately |
| Team roster, captain, coaches | `src/lib/npl-data.ts`, `src/data/npl/*-stats.json` | Franchise and career player panels |
| Public update/status presentation | `src/components/npl/NplHubClient.tsx`, `NplMatchSpotlight.tsx` | Timestamp, bilingual copy, results links |

The results file is the single editorial source for summary results. A full scorecard may enrich it, but must agree on teams, date, scores and winner. Do not hard-code match numbers into JSX. Do not edit the archive/research docs as a substitute for updating the actual data.

## Each update

1. Record the actual check time in UTC (`checkedAt`, ISO format ending Z); display it in `Asia/Kathmandu`. Never update the time without checking the facts.
2. Review today's fixtures, live status, completed results and tomorrow's fixtures. Check revised schedules against the latest dated competition/CAN announcement, then an independent report. Record actual source URLs per result.
3. Add one result row with match number, date, both team IDs, scores, bilingual result, winner and NRR runs/balls. Confirm the fixture identity before marking completed. If only the result is confirmed, add the summary and source link; leave the full scorecard absent.
4. Verify standings, runs/wickets leaders, POTM, roster changes and season metadata separately. Career statistics are not season statistics. Restore cap standings only when **all completed games' player statistics** are verified. Never invent MVP points or label editorial estimates as official rankings.
5. Document conflicts in `nplUpdate.pending`, omitting the disputed field in public copy. Unknown information stays absent; no guessed overs, player awards, dismissal details or fabricated scorecard rows.
6. Run `npm run npl:check`, `npx tsc --noEmit`, targeted ESLint and `npm run build`. Run `node scripts/check-npl-hero.cjs` with the local app available on port 3000. Update the smoke check's fixed date and expected result when intentionally advancing the checkpoint.
7. Review `/npl` in English and Nepali at 320, 390, 768 and 1280 px: today's match, latest result, source/scorecard buttons, fixtures and standings. Check the losing side is never presented as the winner because of array order.
8. Add a dated entry below with sources, changed data, pending facts and verification. Commit and publish through the normal Git/deployment workflow when requested. Verify the deployed page; local changes alone do not update production.

## Cricket data rules

- Overs are legal-ball notation: 9.5 = **59 balls**, not 9.5 decimal overs. Ball suffixes range 0–5; 8.7 and 27.2 in a 20-over game are invalid.
- NRR = aggregate runs scored × 6 / aggregate counted balls faced minus aggregate runs conceded × 6 / aggregate counted balls bowled. Never average individual match rates.
- All-out innings count as the full allocation for NRR; a successful chase uses actual legal balls. Match 1 therefore counts 120 balls for Sudurpaschim and 59 for Lumbini. Do not use the rounded displayed NRR in subsequent calculations.
- Current calculator handles ordinary league wins only. Before entering ties, no-results, reduced-overs/DLS games, abandoned games or penalty points, extend the result model/calculator and tests for the applicable competition rules. Do not force them into the existing winner-only model. Playoff results must not enter league standings.
- Team identity is by ID, never innings order. Scheduled times alone cannot establish that a match is live or completed.
- Full scorecards require reconciling batting totals + extras, wickets, innings/bowling balls, dismissal attribution and FOW chronology. The legacy Match 1 chase FOW list contained impossible 8.7 and has been withheld pending re-verification; do not silently change it to a plausible number.

## Refresh behavior

This is an **editorially maintained snapshot**, not an automated live-score feed. The hero refreshes its clock every minute and on focus to select the correct scheduled match; it cannot fetch a missing score. The route's 60-second revalidation refreshes published data after deployment, not source websites. For continuous live scoring, add an approved provider with server-side caching, validated payloads, feed timestamps and failure handling; never scrape Google search cards as an API.

## Update log

### 2026-10-30, 09:25 NPT

Refreshed from the user-requested independent source NPLT20League.com. Added summary results for Matches 4–6, each with a direct source link; standings now aggregate six results. Match 4 cross-check: https://www.ipl.com/matches/nepal-premier-league-130224/pokhara-avengers-vs-sudurpaschim-royals-99953/live. Matches 5–6 agree with https://ekantipur.com/npl and Match 5 with https://www.onlinekhabar.com/cricket-match/319?tab=score. Match 6 also agrees with https://kathmandupost.com/cricket/2026/10/29/sompal-s-unbeaten-62-steers-karnali-to-last-over-win-over-biratnagar. Keep revised 17:00 evening times; other feeds still contain 16:30.

Imported 32 source-provided transparent player images, added 20 source-listed squad profiles, merged three duplicate Studio identities, and reconciled public/Studio images. Individual profiles record source links, review dates and membership/statistics status. Existing uncorroborated membership records are retained with a not-listed flag; absence from one independent site does not prove departure. Career statistics were not copied because source format labels are inconsistent. New players have null statistics and no invented jersey numbers/records. Details and remaining photo issues: [source review](NPL_SOURCE_REVIEW.md).

Pending: Match 3 overs disagreement remains; Match 5 Rahul Yadav award figures differ (3/31 in requested source versus 4/31 in Onlinekhabar); detailed scorecards/awards and season leaderboards remain withheld pending reconciliation. The source team-page fixture payload contains 2025 games, so it was not imported as the 2026 schedule. No ambiguous NRR inputs or guessed dismissals were added.

### 2026-10-28, 14:52 NPT

Added confirmed Matches 2–3; revised evening starts to 17:00; derived standings; removed stale Match 1 season-cap/MVP ranking panels; added result-source links and an editorial timestamp. Hero and fixture scorecard selection now follow match identity. Pending: Match 3 overs conflict; complete new scorecards, verified awards and season player rankings; legacy Match 1 FOW recheck. Schedule, score summaries and Kantipur links above are the evidence trail. Tests are recorded in the implementation handoff.
