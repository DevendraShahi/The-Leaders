# NPL cricket desk: research and template kit

Research checked October 25, 2026, Toronto time / October 26, Nepal time. The template library is a dedicated Studio page at `/admin/social/cricket`; drafts open in the existing editor. This is an editorial design and manual scoring kit; it does not subscribe to a live score service or publish posts.

## Season and source findings

The third NPL season is scheduled for **October 26–November 21, 2026**, at the TU ground in Kirtipur. The October 23 season preview is more current than the original August announcement. Lumbini Lions versus Sudurpaschim Royals is the reported opening fixture. The verified date is October 26; by the time of this research that date had already begun in Nepal. [The Kathmandu Post, October 23](https://kathmandupost.com/cricket/2026/10/23/what-s-new-in-the-nepal-premier-league-s-third-season), [original CAN announcement reported August 8](https://kathmandupost.com/sports/2026/08/08/npl-season-3-to-begin-on-october-26-final-on-november-21), [opening fixture report](https://kathmandupost.com/cricket/2026/09/20/lumbini-lions-to-face-sudurpaschim-royals-in-npl-opener).

Published times conflict: older schedule pages and franchise listings use 16:30, while newer listings use 17:00 for evening games. Consequently, the kit **does not prefill a start time or a live fixture feed**. Enter the confirmed match-specific time in Nepal time. Fixtures, playing XIs, player figures, standings and results must come from the current scorecard or announcement. [Janakpur franchise next-match listing](https://janakpurbolts.com/), [Karnali franchise fixtures](https://karnaliyaks.com/), [newer ticket/schedule report](https://nplcricketleague.com/news/npl-season-3-ticket-prices).

CAN's public website provides a current NPL media-accreditation notice. Its league site at `npl-t20.com` is a client-rendered application; the inspected public page did not provide a usable score/fixture feed. A domain describing itself as “official” was not treated as independent proof of official status. No authenticated or undocumented endpoint was used. [CAN's NPL notice](https://cricketnepal.org.np/press_release/npl-2026-media-accreditation-open/), [league site](https://npl-t20.com/).

## Franchise identities and logo provenance

All eight franchises have bundled logo files, so exports do not rely on a remote logo request. The asset manifest records exact source pages, asset URLs, retrieval date and file hashes. Logos retain their owners' marks; no general reuse licence was identified. Only transparent margins and raster size were normalized. [Asset manifest](../public/studio/cricket/ASSETS.json).

| Franchise | Identity used | Source |
| --- | --- | --- |
| Biratnagar Kings | Navy, gold and blue; mountain-and-crown crest | [Franchise site](https://biratkings.com/) |
| Chitwan Rhinos | Orange, gold and dark ink; rhinoceros crest | [Franchise site](https://chitwanrhinos.com/) |
| Janakpur Bolts | Navy, magenta and cyan; white-letter crest variant | [Franchise site](https://boltsjanakpur.com/), [Royals opponent-logo listing](https://sudurpaschimroyals.com/) |
| Karnali Yaks | Navy, gold and blue; yak crest | [Canonical franchise site](https://karnaliyaks.com/) |
| Kathmandu Gorkhas | Purple and gold; the rebranded Valley crest | [Royals opponent-logo listing](https://sudurpaschimroyals.com/), [rebrand reporting](https://kathmandupost.com/sports/2025/07/24/kathmandu-gorkhas-rebrand-for-bigger-impact-in-npl-season-2) |
| Lumbini Lions | Burgundy, red and gold; lion crest | [Franchise site](https://lumbinilions.com.np/) |
| Pokhara Avengers | Burgundy and gold; bird/Avengers mark | [Franchise site](https://pokharaavengers.com/) |
| Sudurpaschim Royals | Navy and gold; current transparent lion/crown mark | [Franchise site and current-logo listing](https://sudurpaschimroyals.com/) |

**Palette hex values are editorial interpretations of the visual identities, not published official brand specifications.** They can be overridden with Studio colors/backgrounds. Team colors, stadium-night and two-team split are available. Logos can be replaced with uploaded approved/current variants.

The Kathmandu asset initially found on another team site was the old black-and-gold “Gurkhas” shield. It was excluded. The kit uses the purple-and-gold “Gorkhas” crest with Valley landmarks. The rebrand dates to July 2025. [Rebrand report](https://kathmandupost.com/sports/2025/07/24/kathmandu-gorkhas-rebrand-for-bigger-impact-in-npl-season-2).

Some franchise pages mix older squad material with newer fixture information. The kit therefore does not label an old squad as the current playing XI or attach invented statistics to real players. Player names, captain/wicketkeeper markers and uploaded player photographs remain editable.

## Coverage matrix: 28 templates

| Desk phase | Templates | Structured content |
| --- | --- | --- |
| Before the match | Matchday; Fixtures; Head to head; Toss update; Playing XI; Team spotlight | Team/opponent, logos, competition, date/time/venue, toss decision, XI, comparison statistics |
| Match moments | Score update; Four; Six; Wicket; Powerplay; Partnership; Innings break; Target; Revised target/DLS; Match interruption | Runs/wickets, legal overs, batter/bowler, dismissal, partnership, target, quota, required rate and update time |
| Player performances | Half-century; Century; Batter spotlight; Bowler spotlight; Five-wicket haul; Hat-trick; Player of the match | Runs/balls, not-out marker, fours/sixes, strike rate, bowling figures, maidens, economy; batting/bowling/all-round award modes |
| Results and tournament | Match result; Scorecard; Points table; Qualification; Champions | Both innings totals, winning margin, selected batting/bowling rows, eight-team rankings, points and published NRR |

The templates use ten compositions: versus, fixture list, XI, event numeral, scoreboard, batter profile, bowler profile, tables, result, and team announcement. They are not just headline substitutions on one generic news card.

Coordinated creation packs are available:

- **Match coverage:** 10 pages covering the matchday, XI, toss, score, four, six, wicket, innings, result and player award.
- **Before the match:** 6 pages.
- **Player performances:** 7 pages.
- **Tournament desk:** 5 pages.

## Scoring and editorial behavior

Overs use six legal balls. `14.2` is 86 deliveries, not 14.2 decimal overs. Current run rate and bowling economy use `runs × 6 / legal balls`; strike rate uses `runs × 100 / balls faced`. A chase uses the innings quota minus legal balls already bowled. Invalid `.6`–`.9` notation is rejected. Zero-delivery rates show a dash. [ICC T20I playing conditions, October 2026, clauses 17 and 19](https://images.icc-cricket.com/image/upload/prd/bsxcho7ufe2pjban0wjp.pdf).

These general arithmetic rules are not a claim that every NPL-specific condition was independently obtained. The innings quota is editable for reduced matches. **DLS targets are entered from the official announcement; this tool does not calculate them.** Standings and net run rates are also entered from the published table rather than inferred from incomplete scorecards.

The gallery uses illustrative figures to demonstrate the layouts. New authored drafts start with empty score, player and result fields. Artwork and captions do not add sample labels, including when older drafts retain a legacy sample flag. Source URLs and time stamps can be entered; the footer displays the source domain and Nepal time. There is no simulated automatic “live” connection.

English and Nepali label sets are included, with Nepali numerals and Hind shaping. Custom copy and player names remain in the language entered. Square, portrait, story and landscape retain the existing exact PNG dimensions. Export checks the complete structured content area and text boxes and rejects clipped content. Dense full-innings scorecards may require separate batting/bowling pages.

## Carousel editing

Each page keeps its own event, score, batter, bowler and result. Existing optional shared font/alignment/background/effect controls also work on cricket artwork. A separate **Cricket teams & match** group can share team identity, logo variants, theme, language, competition, date/time and venue without overwriting page-specific statistics or event types. Locked visuals retain their identity when this group is applied. Whole-carousel undo and atomic local persistence continue to apply.

## Local preview and maintenance

Run the existing preview server, then open:

```text
http://127.0.0.1:4176/admin/social/cricket
http://127.0.0.1:4176/?cricket=six
http://127.0.0.1:4176/?cricket=score&language=ne&format=story
```

The fixture uses a separate `studio-cricket-preview` account scope. It does not write to live newsroom collections. To update a team logo, verify the current franchise identity, replace the local asset, and update the source/hash record in `ASSETS.json`. Recheck the selected team in all four formats and both languages.

## Verification performed

- 134 focused regression tests passed, including draft/account isolation, complete cricket-data round trips, label removal for legacy drafts, blank new drafts, score calculations, structured inputs, coordinated pack creation, failed-write recovery, whole-carousel undo, caption content, overflow rejection and cancelled logo uploads on page changes.
- 1,792 browser layout checks passed: every default template × eight teams × English/Nepali × four formats. The checks used the actual export preflight and loaded local fonts/logos.
- Actual PNG downloads were verified at 1080×1080, 1080×1350, 1080×1920 and 1920×1080. A ten-page carousel ZIP was downloaded and checked for ten PNGs and the cricket-specific caption file.
- Browser verification covered score edits and reload, sharing identities/alignment/photos without overwriting page-specific scores, bowling and all-round award modes, and responsive layouts from 320 to 1440 pixels. The creation controls remained in view in the phone gallery.
- Scoped Studio TypeScript and focused ESLint checks passed. These checks do not establish that an arbitrary entered score is factually correct; match data still requires a current source.


## Dedicated library page

The cricket library uses a full page, with match setup and coverage-pack creation in a sidebar, wrapping category filters, search, and larger template previews. Each card has its own **Use template** action. On phones, **Edit setup** expands the team, format, language and pack controls. Returning from a cricket-created draft opens the library again. Existing draft content is preserved; legacy sample flags no longer add tags or caption prefixes.
