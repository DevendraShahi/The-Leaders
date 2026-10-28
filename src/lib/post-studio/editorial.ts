import type { PostDesign } from './types';

export type ClaimStatus = 'needs-checking' | 'verified' | 'unsupported';
export type EditorialReview = { fingerprint: string; claims: { text: string; status: ClaimStatus; sources: string[]; note: string }[]; languageChecked: boolean };
export type PublicationCheck = { level: 'pass' | 'warning' | 'error'; label: string };
export function designSources(design: PostDesign): string[] {
    return [...new Set([...(design.sourceUrls ?? []), design.history?.sourceUrl, design.cricket?.sourceUrl].filter((url): url is string => Boolean(url && /^https?:\/\//i.test(url))))];
}
export function reviewCopy(design: PostDesign): string[] {
    return [...new Set([design.headline, design.summary, design.history?.fact, design.history?.body].filter((value): value is string => Boolean(value?.trim())))];
}
export function reviewFingerprint(design: PostDesign): string {
    return JSON.stringify({ copy: reviewCopy(design), sources: designSources(design), history: design.history, cricket: design.cricket, language: design.contentLanguage, author: design.author, category: design.category, eyebrow: design.eyebrow, series: design.series, credit: design.imageCredit });
}
export function currentReview(design: PostDesign): EditorialReview {
    const fingerprint = reviewFingerprint(design);
    if (design.editorialReview?.fingerprint === fingerprint) return design.editorialReview;
    return { fingerprint, claims: reviewCopy(design).map(text => ({ text, status: 'needs-checking', sources: [], note: '' })), languageChecked: false };
}
export function publicationChecks(design: PostDesign): PublicationCheck[] {
    const review = currentReview(design), sources = designSources(design);
    const copy = reviewCopy(design).join(' ');
    const nepali = (copy.match(/[\u0900-\u097f]/g) ?? []).length, latin = (copy.match(/[a-z]/gi) ?? []).length;
    const mismatch = design.contentLanguage === 'ne' ? Boolean(copy && !nepali) : design.contentLanguage === 'en' ? nepali > latin : false;
    const unchecked = review.claims.filter(claim => claim.status !== 'verified' || (!claim.sources.some(url => sources.includes(url)) && claim.note.trim().length < 10));
    return [
        { level: !design.headline.trim() || design.hiddenLayers.includes('headline') ? 'error' : 'pass', label: !design.headline.trim() ? 'Headline is empty.' : design.hiddenLayers.includes('headline') ? 'Headline is hidden.' : 'Headline is present and visible.' },
        { level: sources.length ? 'pass' : 'warning', label: sources.length ? `${sources.length} source link${sources.length === 1 ? '' : 's'} saved.` : 'No source links saved. Add evidence or check your supplied material.' },
        { level: review.claims.some(claim => claim.status === 'unsupported') ? 'error' : unchecked.length ? 'warning' : 'pass', label: review.claims.some(claim => claim.status === 'unsupported') ? 'Copy is marked unsupported. Correct it before publishing.' : unchecked.length ? `${unchecked.length} copy section${unchecked.length === 1 ? '' : 's'} still ${unchecked.length === 1 ? 'needs' : 'need'} a source review.` : 'Copy sections reviewed by the editor.' },
        { level: review.languageChecked && !mismatch ? 'pass' : 'warning', label: mismatch ? 'Copy may not match the selected language. Check its script and intended audience.' : review.languageChecked ? 'Language and names checked by the editor.' : 'Check language, names, dates and units.' },
        { level: design.imageUri && !design.hiddenLayers.includes('visual') ? 'pass' : 'warning', label: design.imageUri && !design.hiddenLayers.includes('visual') ? 'Photo selected; file loading is checked during rendering.' : 'No visible background photo. Confirm this text-only layout is intentional.' },
    ];
}
export function normalizeTopic(value: string): string {
    return value.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
}
export function similarTopics(value: string, history: { headline: string; name: string }[]) {
    const topic = normalizeTopic(value), words = new Set(topic.split(' ').filter(word => word.length > 2));
    if (!topic) return [];
    return history.filter(item => {
        const prior = normalizeTopic(item.headline);
        if (!prior) return false;
        if (topic === prior) return true;
        const other = new Set(prior.split(' ').filter(word => word.length > 2));
        const overlap = [...words].filter(word => other.has(word)).length;
        return overlap >= 3 && overlap / Math.max(1, Math.min(words.size, other.size)) >= .65;
    }).slice(0, 5);
}
