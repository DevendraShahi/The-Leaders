# Studio automation API

Status: the news automation is retired; the daily automation remains paused. No Google Cloud project, AI API
worker or paid cloud service has been deployed for this feature. Existing Studio
content, manual event updates, review and design editing remain available.

These endpoints accept researched content from a future worker. Calling an
endpoint does not launch AI research; the worker gathers and checks sources,
generates the payload and submits it. No OpenAI or Gemini credential is required
by these ingestion endpoints.

## Connection

Use the hosted backend's HTTPS origin when deployment is ready. The current
local backend requires the Mac to be running and cannot support independent
cloud execution. Deploy these routes before connecting the cloud worker.

Every ingestion request requires:

```http
Authorization: Bearer <server-side ingestion credential>
Content-Type: application/json
```

Configure `STUDIO_ATTENTION_AUTOMATION_SECRET` identically in the backend and
worker secret stores. Do not put it in `EXPO_PUBLIC_*`, the mobile bundle,
source control, query strings or logs. This credential authorizes ingestion;
it does not sign the worker in as an admin.

The supplied CLIs read the ignored backend `.env.local`:

```sh
node scripts/daily-social-ingest.mjs --due
node scripts/daily-social-ingest.mjs /absolute/path/to/edition.json
```

Set `STUDIO_ATTENTION_API_URL` to the backend origin for those CLIs. They default
to `http://localhost:3001` for development. They exit nonzero on ingestion failure.

## Retired news attention

The hourly suggestion feed, ingestion route and CLI have been removed. Old
requests return HTTP 410. Only the optional daily edition contract is retained.

## Daily bilingual editions

`GET /api/v1/auth/daily-social/ingest`

Check the current Nepal date and due slot before researching:

```json
{"due":true,"date":"2026-10-14","edition":"morning","timezone":"Asia/Kathmandu","exists":false}
```

Stop when `due` is false. Morning is accepted from 07:00 until 10:00 Nepal time;
evening from 21:00 until midnight. The planned triggers are exactly 07:00 and
21:00 in `Asia/Kathmandu`; these windows permit retries, not extra publishing.

`POST /api/v1/auth/daily-social/ingest`

Submit the bilingual edition object described in `mobile/DAILY_SOCIAL.md`.
The executable schema and limits are in `src/lib/daily-social.ts`. Both Nepali
and English are required, with source references for every slide and recent
verification timestamps. Submit during the matching slot on the current Nepal
date. No previous-day backfill or fabricated replacement content is accepted.

Successful response:

```json
{"created":true,"date":"2026-10-14","edition":"morning"}
```

A date/edition slot is unique. Repeating a valid submission returns
`created:false` and preserves the original edition, including admin review.
If a POST times out, check GET again before regenerating; the write may already
have succeeded. These APIs never mark an edition reviewed or publish a post.

## Errors and retries

| Status | Meaning | Worker action |
| --- | --- | --- |
| 400 | Invalid JSON or rejected content schema | Correct the payload; do not blindly retry |
| 401 | Missing or incorrect ingestion credential | Stop and fix server configuration |
| 409 | Daily edition outside its accepted slot | Recheck GET; do not force a missed edition |
| 503 | Backend/database unavailable | Retry with bounded backoff within the valid slot |

Treat timeouts similarly to temporary failures. Limit retries and alert on
persistent failure. Never log Authorization headers or secrets. Existing
admin-facing GET/PATCH routes require a valid mobile admin session; they remain
separate from this automation credential.

Admin editing uses `PATCH /api/v1/auth/daily-social` with a mobile admin token,
not the ingestion credential. Supply `{id, updatedAt, caption:{en,ne}}` or
`{id, updatedAt, status}` where status is `draft`, `in_review` or `ready`.
An edition must be in review before it becomes ready. Caption changes clear
approval and return it to draft. A stale version receives HTTP 409; reload and
reconcile instead of retrying with an overwritten version. Automation cannot
use this route to review content or overwrite captions.

## Future activation

1. Deploy the backend routes and confirm access to the existing database.
2. Configure the worker's source research, provider credential, costs and secret
   storage in a separate The Leaders cloud project.
3. Test authenticated ingestion, invalid payload rejection and duplicate replay.
4. Connect 07:00/21:00 daily triggers in Nepal time only when reactivated.
5. Verify successful cloud runs before retiring desktop scheduling. Avoid running
   two active schedulers routinely. Keep posting and review under admin control.

For development, use clearly labelled test content in an isolated test database;
do not insert fictional stories into the live newsroom feed.
