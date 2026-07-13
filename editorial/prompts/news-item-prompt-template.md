# The Leaders Editorial Prompt Template

Use this template to create one Markdown file per inbox news item after the JSON has been cleaned.

## Output filename
Use a slug based on the date and headline, for example:
2026-06-07-nepal-budget-reaction.md

## Required frontmatter
---
title: <news title>
date: <ISO date if available>
from: theleadersnp@gmail.com
source_account: shahi3@uwindsor.ca
json_record_id: <id or message id>
status: draft
---

## Required body structure
# <news title>

## Original metadata
- Subject: <subject>
- Sender: <sender>
- Received at: <timestamp>
- Labels: <labels if available>

## Cleaned brief
<brief with trailing sources removed>

## Cleaned content
<content with trailing sources removed>

## Editorial prompt
You are preparing this inbox item for The Leaders editorial desk.

Tasks:
1. Read the cleaned brief and cleaned content.
2. Identify the core news event, the public-interest angle, and the Nepal relevance if present.
3. Remove repetition, hype, and newsletter fluff.
4. Extract the essential facts only.
5. List any claims that still need verification.
6. Suggest a sharper working headline in The Leaders style.
7. Produce:
   - a 1-sentence summary,
   - a 3-bullet fact list,
   - a short editorial note on why it matters,
   - and a verification checklist.

## Verification notes
- <open questions>
- <claims needing source confirmation>
