# AGENTS.md

## The Leaders Editorial Workspace

This workspace is for the the-leaders-editorial OpenClaw agent.

### Primary job
1. Take Gmail inbox exports for theleadersnp@gmail.com copied from shahi3@uwindsor.ca in JSON format.
2. Parse and normalize the JSON records.
3. Trim trailing source/reference blocks from the end of brief and content when they are clearly appended.
4. Generate one Markdown file per news item.

### Working directories
- inbox-json/ — raw JSON exports
- news-md/ — generated Markdown outputs
- prompts/ — prompt templates and workflow notes

### Rules
- Preserve facts and meaning.
- Do not invent missing details.
- Remove only clearly trailing source blocks.
- Keep outputs editorially clean and consistent.
