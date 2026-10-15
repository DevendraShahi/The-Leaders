# Daily bilingual social editions

The daily Codex automation is paused while app development continues. The API
and existing drafts remain available. The intended schedule is morning briefs
at 07:00 and day-in-review drafts at 21:00,
using Asia/Kathmandu time. Each edition contains both English and Nepali captions,
a branded cover and 1–9 source-linked portrait slides. Studio → Edit → Daily
social editions previews each language, exposes source evidence, shares the
bilingual caption and imports both carousels into the existing editor. Imports
are atomic and idempotent and preserve subsequent admin edits. Nothing publishes
automatically to Instagram, Facebook or the website.

Scheduler workflow:
1. Run `node scripts/daily-social-ingest.mjs --due`. If due=false, stop quietly.
2. Research current source pages for the returned Nepal date and edition.
3. Write a JSON file and ingest it with `node scripts/daily-social-ingest.mjs
   /absolute/path/to/edition.json`. Report unavailable research instead of
   submitting placeholder content. Do not expose the ingestion credential.

JSON fields:
- date: YYYY-MM-DD in Nepal; edition: morning or evening.
- title and caption: objects with nonempty en and ne strings.
- sources: id, name, public HTTPS url, publishedAt and verifiedAt (UTC ISO),
  support (a brief original note identifying what the source confirms).
- slides: section, headline:{en,ne}, body:{en,ne}, sourceIds. Optional confirmed
  eventDate (YYYY-MM-DD), eventTime (UTC ISO), venue, happenedOn (YYYY-MM-DD).
- omissions: optional [{en,ne}] explanations of sections that lack evidence.

Supported sections: headlines, watch, go, enjoy, recap, tomorrow, weather, sports,
good-news, context. Morning: major Nepal/global headlines from overnight/current
reporting, announced developments to watch, useful weather or public notices,
and confirmed things to attend/enjoy. Evening: actual developments from today,
results, useful context and confirmed items for tomorrow. Evening recap/headline/
sports/good-news slides need happenedOn equal to the edition's Nepal date.

No fabricated scores, quotes, dates, venue names, ticket prices, people, photos,
claims or events. Open sources, check publication and occurrence dates, and
verify all factual claims. Prefer primary announcements and reputable reporting;
attribute claims and retain uncertainty. Translate faithfully without adding facts.
Go/enjoy requires a confirmed date and venue from an organizer/official source.
Never fill an empty events section with fictional recommendations. Omit unsupported
sections and explain the gap. Headlines must have recent source reporting (within
36 hours); sources must be rechecked within two hours of draft preparation. Date-
only source publication may use midnight in its known local timezone; never
present that as an exact source time. Keep source notes short; do not copy articles.

Use original, restrained editorial hooks and a useful save/share/follow prompt.
Avoid invented engagement statistics, sensationalism or certainty unsupported by
the source. Do not use unlicensed news photographs; the imported art uses brand
and typography only. Admins finish the designs and export with the existing editor.

Studio's edition details now offer Nepali, English or both-language carousel
export. A ZIP contains numbered PNGs in `ne/` and `en/` folders, matching captions
and a source list. The exporter uses saved local designs, preserves admin edits,
and refuses to restore trashed carousel drafts. It renders one slide at a time
and blocks text that exceeds the format's line limits. Native export opens the
system file share sheet; web downloads the ZIP. Unzip and upload PNGs in number
order. No export automatically publishes or marks content reviewed.

Editorial review uses Draft → In review → Ready. An approved admin can edit both
captions in the edition details; changing either caption returns the edition to
Draft and clears its approval. Identical copy keeps its status. Saves include
the edition's `updatedAt` version and reject concurrent changes instead of
overwriting them. Older `reviewed` editions display as Ready. Source links remain
beside each headline. Caption editing does not rewrite saved slide artwork;
review those designs separately before posting. ZIP captions use the latest
saved edition copy. Unsaved caption edits must be saved or cancelled before
closing the edition or exporting.

The daily slot is unique per date/edition and automation cannot overwrite an
existing edition or an admin's review. Local source/time validation rejects missing
citations, stale news, future source timestamps and invalid event dates. These
checks do not prove semantic truth; source evidence and editorial review remain
necessary. Research failures never become a ready-looking substitute edition.

This is a desktop Codex automation, requiring Codex and the configured backend to
be running. Schedule checks allow morning catch-up until 10:00 and evening until
midnight Nepal time, but missed runs are not fabricated afterward. No hosted 24/7
service or connected social-platform publishing account is implied.

See [the automation API contract](../docs/STUDIO_AUTOMATION_API.md) to connect a
future external worker without changing the app's draft workflow.
