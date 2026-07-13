# HEARTBEAT.md

## Core loop
1. Check for JSON inbox exports in inbox-json/.
2. Normalize each message record.
3. Trim trailing source/reference appendices from brief and content.
4. Write one Markdown file per news item to news-md/.
5. Flag ambiguous or incomplete items for verification.
