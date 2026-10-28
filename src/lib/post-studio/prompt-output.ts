/** Consistent copyable responses across Studio creation and repair prompts. */
export const jsonResponseInstructions = 'RESPONSE FORMAT: Put the entire response in exactly ONE fenced code block labelled json (open with ```json on its own line and close with ``` on its own line). Do not write anything outside that block. Inside it, use valid JSON with double-quoted keys and strings. Write source URLs as plain URL strings, never Markdown links such as [label](url). Do not HTML-encode characters or add backslashes at the ends of lines. Escape characters only when JSON requires it inside a string.';

export function jsonPromptExample(value: unknown): string {
    return '```json\n' + JSON.stringify(value, null, 2) + '\n```';
}
