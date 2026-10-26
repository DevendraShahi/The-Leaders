# NPL player photo library

Roster checked on 2026-10-25 against https://nepalpremierleague.org/players.
The catalog records 145 assigned players. There are 83 portraits and 83 thumbnails.
Missing portraits are not substituted with another player's image.

## Photo provenance

- Biratnagar Kings: https://biratkings.com/ — 6 portraits
- Chitwan Rhinos: https://chitwanrhinos.com/ — 10 portraits
- Janakpur Bolts: https://boltsjanakpur.com/squad — 5 portraits matching the league assignment snapshot; transferred players from that older squad page were excluded
- Karnali Yaks: https://karnaliyaks.com/our-yaks — 17 portraits
- Lumbini Lions: https://lumbinilions.com.np/our-squad — 15 portraits
- Pokhara Avengers: https://pokharaavengers.com/squad — 16 portraits
- Sudurpaschim Royals: https://sudurpaschimroyals.com/squad — 13 portraits
- Kathmandu Gorkhas: https://commons.wikimedia.org/wiki/File:Karan_Kc_Nepali_Cricketer.jpg — 1 archive portrait, Karan KC by Helloworld3377, CC BY-SA 4.0; photo taken in 2016 in Panchakanya Tej kit

`catalog.json` is the authoritative per-file record of original URLs, source
pages, credits, license labels, dimensions, and local filenames. Team websites'
photos retain their owners' rights; public availability does not imply a free
license. The Commons file retains its attribution/share-alike requirements:
https://creativecommons.org/licenses/by-sa/4.0/ . Studio saves the source credit
with an inserted photo and includes it in the generated cricket caption.

Photos were resized to fit inside 1600 × 1600 and encoded as WebP (quality 88).
Thumbnails fit inside 320 × 400 (quality 78). Images were not cropped or stripped
of transparency; earlier-season and national-team uniforms may appear.

To restore assets from reviewed URLs:

    node scripts/sync-npl-player-photos.mjs

To re-fetch all reviewed images:

    node scripts/sync-npl-player-photos.mjs --refresh

Review team assignments separately before changing the dated roster snapshot.
