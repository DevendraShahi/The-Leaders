# Agent task: The Leaders inbox editorial workflow

When given a JSON export of inbox messages:

1. Load the JSON from inbox-json/.
2. Detect whether the export is an array of messages or an object containing message records.
3. For each message:
   - derive a stable identifier,
   - extract title/subject/date/sender,
   - clean brief and content by removing trailing source/reference blocks,
   - keep the original text otherwise unchanged.
4. Write one .md file per news item into news-md/.
5. Use the prompt template in prompts/news-item-prompt-template.md.
6. Skip empty or duplicate items and log them separately if needed.

## Cleaning heuristic
Remove the shortest trailing section that starts with a clear source marker near the end of the field, including markers like:
- Sources:
- Source:
- References:
- Reference:
- Related links:
- trailing link bundles on separate lines

Do not remove in-body attribution sentences.
