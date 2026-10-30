# NPL source and transparent-photo refresh

Reviewed 30 October 2026 at 03:40 UTC (09:25 NPT). Source: https://nplt20league.com/players/ and the eight linked team pages. This is an independent cricket website, not the official competition site. Source listings do not establish an image reuse license.

## Changes

- Public catalog: 165 player profiles (145 existing plus 20 source-listed additions). 161 are listed in the requested source squads; four older memberships remain unconfirmed rather than silently deleted.
- Studio: 166 canonical records, including the older Will Bosisto entry pending verification. Duplicate aliases k-s-bharat, bibek-magar and bipin-archarya were merged into the public canonical IDs. Existing public player URLs remain stable.
- Imported 32 transparent WebP portraits and matching thumbnails; 12 replacements use versioned filenames to avoid stale image caches. Alpha channels and decoded dimensions were checked and contact sheets reviewed. Original source URLs and credit recorded per image. These are source-provided cutouts, not independently authenticated originals.
- Added per-player source/review metadata and updated available nationality/batting/bowling fields. Legacy career totals are labeled unverified; new totals remain null. Unknown jersey numbers display a dash; generated career spans are removed.
- Updated summary results through Match 6 and recalculated standings; unknown detailed scorecards and awards were not fabricated.

## New source-listed profiles

- Ayush Neupane — https://nplt20league.com/player/ayush-neupane/profile/
- Shehan Jayasuriya — https://nplt20league.com/player/shehan-jayasuriya/profile/
- Daniel Richard Mousley — https://nplt20league.com/player/daniel-richard-mousley/profile/
- Dawid Malan — https://nplt20league.com/player/dawid-malan/profile/
- Hasan Ali — https://nplt20league.com/player/hasan-ali/profile/
- Muhammad Nawaz — https://nplt20league.com/player/muhammad-nawaz/profile/
- Tom Taylor — https://nplt20league.com/player/tom-taylor/profile/
- Hikmat Bahadur Shahi — https://nplt20league.com/player/hikmat-bahadur-shahi/profile/
- Kusal Perera — https://nplt20league.com/player/kusal-perera/profile/
- Parvez Hossain Emon — https://nplt20league.com/player/parvez-hossain-emon/profile/
- Rahul Yadav — https://nplt20league.com/player/rahul-yadav/profile/
- Saif Hassan — https://nplt20league.com/player/saif-hassan/profile/
- Harishankar Shah — https://nplt20league.com/player/harishankar-shah/profile/
- Jahandad Khan — https://nplt20league.com/player/jahandad-khan/profile/
- Ripon Mondol — https://nplt20league.com/player/ripon-mondol/profile/
- Grant Stewart — https://nplt20league.com/player/grant-stewart/profile/
- Sadeera Samarawickrama — https://nplt20league.com/player/sadeera-samarawickrama/profile/
- Fabian Allen — https://nplt20league.com/player/fabian-allen/profile/
- Tek Raj Thalal — https://nplt20league.com/player/tek-raj-thalal/profile/
- Tharindu Rathnayake — https://nplt20league.com/player/tharindu-rathnayake/profile/

## Imported transparent portraits

- angelo-mathews
- ayush-neupane
- charith-asalanka
- shehan-jayasuriya
- daniel-richard-mousley
- dawid-malan
- hasan-ali
- muhammad-nawaz
- ravi-bopara
- tom-taylor
- usama-mir
- ariful-islam
- hikmat-bahadur-shahi
- hussain-talat
- kusal-perera
- parvez-hossain-emon
- rahul-yadav
- saif-hassan
- harishankar-shah
- jahandad-khan
- ripon-mondol
- grant-stewart
- shadley-van-schalkwyk
- shamim-hossain
- sadeera-samarawickrama
- brandon-mcmullen
- fabian-allen
- saif-zaib
- scott-kuggeleijn
- sherfane-rutherford
- tek-raj-thalal
- tharindu-rathnayake

## Remaining image and roster issues

| Player | Finding |
|---|---|
| Jishan Alam / Jisan Alam | Resolved with the user-supplied transparent 1086 × 1448 portrait. Available in Studio and the public profile. Membership review remains separate from the photo update. |
| Hunain Shah | Resolved with the user-supplied transparent 1145 × 1374 portrait. Available in Studio and the public profile; membership review remains separate. |
| Haider Ali | Resolved with the user-supplied transparent portrait. Updated in Studio and the public profile; membership review remains separate. |
| Will Bosisto | Resolved with the user-confirmed transparent portrait (1145 × 1374). Available in Studio and a public profile; membership and statistics remain unverified. |
| Sam Heazlett | Resolved with the user-supplied transparent portrait from `sam.png`. Updated in Studio and the public profile. |
| Iftikhar Ahmed | Absent from requested source squad; existing profile and image retained with membership unconfirmed. |

K. S. Bharat did not need a new photo: the duplicate empty record was merged into the existing KS Bharat record. Bibek Rana Magar and Bipin Acharya also already had usable canonical photos.

## Source limitations

Do not bulk-import careerStats.t20i as T20 career totals: the source mixes T20I and broader T20 values. Team pages also embed historical 2025 fixture data despite 2026 squad headings. Match 5 award figures conflict across sources. Refer to NPL_UPDATES.md for match-source evidence and pending facts. The public profile banner exposes which fields were reviewed; existing career statistics still need format-specific verification.

## Verification

- Production build passed after the final roster corrections.
- 1,111 local regression tests passed across 88 files; the existing external-network news-feed suite was excluded.
- Final NPL checks: 35 passed; source/photo and catalog checks: 6 passed.
- TypeScript, targeted ESLint and whitespace checks passed.
- CUA browser verification: latest result is Match 6 (Karnali 187/6); next fixture is Match 7; standings include Karnali +0.533 NRR. Page/spotlight fit at 320, 390, 768 and 1280 px. Nepali checked at 390 px. Scott's replacement portrait loaded successfully; new Rahul Yadav profile shows unknown career totals as dashes.

## User-supplied Jisan Alam portrait

The user supplied `Birinagar Kings Cricketer-Jisan.png`. Imported as a versioned transparent WebP and thumbnail for canonical player `jishan-alam`; added the search alias Jisan Alam. Replaced the public silhouette and restored the Studio-ready photo. Credit now identifies the user-supplied asset rather than incorrectly attributing this portrait to ICC. No career statistics or membership status changed.

## User-supplied Hunain Shah portrait

Imported the user-supplied `Hunain Shah.png` as a versioned transparent WebP and thumbnail. Replaced the public silhouette and restored the Studio-ready photo, with user-supplied attribution. No career statistics or membership status changed.

## User-supplied Haider Ali portrait

Imported `Haider Ali.png` as a versioned transparent WebP and thumbnail, replacing the soft headshot in Studio and the public profile. The replacement is credited to the user-supplied asset, without carrying over the previous image’s Wikimedia/PCB attribution or license. No career statistics or membership status changed.

## User-confirmed Will Bosisto portrait

The user explicitly confirmed that the attachment named `Sam Heazlett.png` is for Will Bosisto. Imported it under `will-bosisto` as a transparent WebP and thumbnail; did not assign it to Sam Heazlett. Added a public profile with unavailable career statistics and unconfirmed squad status, matching the existing Studio identity. Current public and Studio catalogs both contain 166 records; 165 Studio portraits were available at that checkpoint; Sam Heazlett was the only withheld photo.

## User-supplied Sam Heazlett portrait

Imported `sam.png` under the canonical `sam-heazlett` identity as a versioned transparent WebP and thumbnail. Replaced the public placeholder and restored the ready Studio portrait, with user-supplied credit. All 166 canonical players now have available portraits; no missing or withheld photo entries remain. Membership/statistics review is separate and unchanged.
