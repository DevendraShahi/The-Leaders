# NPL data maintenance

Read [the update playbook](../../../docs/NPL_UPDATES.md) before changing NPL data.

Current match summaries and check timestamp live in `src/lib/npl-season-update.ts`.
These JSON files contain squad/player reference data; do not put live scores or season standings into career-stat fields.

Run `npm run npl:check` after an update. Keep sources, unresolved conflicts and the playbook's dated update log current.
