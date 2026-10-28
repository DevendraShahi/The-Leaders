/** Keep captions readable and within Instagram's limit without cutting a word. */
export function captionText(value: string | undefined | null): string {
    return (value ?? '').replace(/\r\n?/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
}
export function uniqueCaptionParts(parts: (string | undefined | null)[]): string[] {
    const seen = new Set<string>();
    return parts.map(captionText).filter(value => {
        const key = value.replace(/\s+/g, ' ').toLocaleLowerCase();
        if (!key || seen.has(key)) return false;
        seen.add(key); return true;
    });
}
export function captionExcerpt(value: string, limit: number): string {
    if (value.length <= limit) return value;
    const available = Math.max(0, limit - 1);
    const candidate = value.slice(0, available);
    const boundary = Math.max(candidate.lastIndexOf(' '), candidate.lastIndexOf('\n'));
    return `${(boundary > available * .55 ? candidate.slice(0, boundary) : candidate).trimEnd()}…`;
}
export function captionHashtag(value: string): string {
    const tag = value.replace(/[^\p{L}\p{M}\p{N}_]/gu, '');
    return tag ? `#${tag.slice(0, 60)}` : '';
}
export function composeCaption(blocks: string[], tags: string[] = [], byline = ''): string {
    const content = uniqueCaptionParts(blocks);
    if (!content.length) return '';
    const footer = uniqueCaptionParts([captionExcerpt(byline, 160), uniqueCaptionParts(tags).slice(0, 8).map(tag => tag.slice(0, 61)).join(' ')]).join('\n\n');
    const budget = 2200 - footer.length - (footer ? 2 : 0) - Math.max(0, content.length - 1) * 2;
    const allowance = Math.floor(budget / content.length);
    return [...content.map(block => captionExcerpt(block, allowance)), ...footer ? [footer] : []].join('\n\n');
}
