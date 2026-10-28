/** Mechanical cleanup only. The caller previews and explicitly accepts it before import. */
export function recoverStudioJson(raw: string): { text: string; changes: string[] } {
    let text = raw.trim(); const changes: string[] = [];
    if (/^```(?:json)?\s*\n[\s\S]*\n```$/i.test(text)) { text = text.replace(/^```(?:json)?\s*\n([\s\S]*)\n```$/i, '$1'); changes.push('Removed the surrounding code fence.'); }
    if (/&#(?:x20|32);|&nbsp;|&quot;|&#34;|&amp;/.test(text)) { text = text.replace(/&#(?:x20|32);|&nbsp;/gi, ' ').replace(/&quot;|&#34;/g, '"').replace(/&amp;/g, '&'); changes.push('Decoded common HTML entities.'); }
    if (/\\\r?\n/.test(text)) { text = text.replace(/\\\r?\n/g, '\n'); changes.push('Removed backslashes at line endings.'); }
    // Escaping an underscore is Markdown syntax, never a valid JSON escape.
    if (/\\_/.test(text)) { text = text.replace(/\\_/g, '_'); changes.push('Removed Markdown underscore escapes.'); }
    let parsed: unknown;
    try { parsed = JSON.parse(text); } catch { throw new Error('This response cannot be safely cleaned up. Ask your AI for a complete JSON code block; Studio will not guess missing content.'); }
    let links = 0;
    const clean = (value: unknown): unknown => {
        if (Array.isArray(value)) return value.map(clean);
        if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clean(item)]));
        if (typeof value === 'string') {
            const match = value.match(/^\[[^\]]*\]\((https?:\/\/[^\s)]+)\)$/);
            if (match) { links++; return match[1]; }
        }
        return value;
    };
    const cleaned = clean(parsed);
    if (links) changes.push(`Converted ${links} Markdown link${links === 1 ? '' : 's'} to plain URLs.`);
    if (!changes.length) throw new Error('No recognized formatting problem was found. Use the validation message to request a corrected response.');
    return { text: JSON.stringify(cleaned, null, 2), changes };
}
