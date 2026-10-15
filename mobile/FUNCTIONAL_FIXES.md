# Mobile functionality repairs

## Implemented

- Feed and reader saves share one service. Feed saves download the complete body
  before adding the bookmark; failed downloads show an error. Native SQLite and
  browser storage retain publishing metadata. Older excerpt-only copies are
  identified and upgraded when their full article loads online.
- Saved articles open immediately from the local copy while the network refreshes.
- Briefs navigate to the brief reader. Reading times use complete article bodies;
  unavailable translations offer the actual available language.
- Authors have a dedicated search result and public directory API. Follows persist
  locally, and Home shows articles from followed authors.
- News updates use published articles and briefs from the last 48 hours, with
  honest empty, loading, refresh and failure states. They do not imply push delivery.
- Radio retains the existing Nepali station URLs. The player and mini-player use
  actual playback events, connection timeout, retry, volume, pause and stop. Latest
  links to the station picker; sample music shortcuts are removed.
- Release API configuration requires public HTTPS. Endpoint contracts validate
  content, and React Query manages caching without stale browser HTTP responses.
  Native connectivity and app focus trigger recovery. Root rendering has a retry
  fallback, and save results have accessible transient feedback.
- Optional usage sharing defaults off. Only event names and language are sent to
  the existing backend, accumulated into daily counts and retained for 180 days.
  No query text, article titles, account identifiers or crash stacks are sent.
  This provides aggregate counts, not per-user retention or detailed crash alerts.

## Verified

`npm run check`, nine functional tests and six design contract tests pass. Live
API smoke checks cover author search/filtering, full reader bodies, reading times,
briefs and the author directory. Browser checks verified a full save from Home,
the saved reader, author search/profile and Kantipur FM playback/pause. Test-only
bookmarks and follows are removed after review. Both native bundle exports pass.

## Setup and device work remaining

Saved now lives at `/saved`, opened from Explore (and existing library links).
The former Saved tab becomes Studio only for server-verified active admins.
`/api/v1/account` uses the existing Clerk/admin resolution, returns an access flag
and a minimal workspace ID for account-specific local drafts,
and is never publicly cached. Configure `MOBILE_WEB_ORIGIN` for credentialed access
from a production web preview. Studio now opens the local post draft library;
the existing website Social Studio retains its own publishing permissions.
The native app has no Clerk sign-in flow yet, so native accounts cannot acquire
an admin session through the app and the tab remains hidden there.

The owner has no linked Expo project or selected reporting service. Background
push needs Expo project linkage, device credentials, token registration and server
delivery. No push credentials or project ID have been invented. Detailed crash
reporting and alerts remain unconfigured.

Publish the matching backend endpoints before releasing the app. Background audio
configuration requires a new native build; an export does not verify lock-screen,
interruption, background playback, SQLite migration or device accessibility.
Kantipur was verified in the browser; every other station still needs device
testing because stream availability, codecs and HTTP restrictions vary.

The app cannot repair an editorial publishing gap. Older content is labelled with
its actual date; publishing cadence remains an operational decision.
