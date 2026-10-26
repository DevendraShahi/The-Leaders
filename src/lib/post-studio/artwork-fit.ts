/** Shared preflight for the editor and export; transformed previews retain reference geometry. */
export function artworkFitIssues(node: HTMLElement): HTMLElement[] {
    return Array.from(node.querySelectorAll<HTMLElement>('[data-line-limit],[data-export-fit]')).filter(text => {
        const lineHeight = parseFloat(getComputedStyle(text).lineHeight);
        if (text.dataset.lineLimit && Number.isFinite(lineHeight) && text.scrollHeight > lineHeight * Number(text.dataset.lineLimit) + 1) return true;
        return text.hasAttribute('data-export-fit') && text.clientWidth > 0 && text.clientHeight > 0 && (text.scrollWidth > text.clientWidth + 1 || text.scrollHeight > text.clientHeight + 1);
    });
}
