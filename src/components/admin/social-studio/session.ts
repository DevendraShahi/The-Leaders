import type { SocialPostFormat, SocialPostLocale, SocialPostTemplate, SocialPostState, SocialTypography, socialPhotoFilters } from '@/lib/social-post';

export type Identity = string | { _id: string; name?: string; username?: string };
export type Copy = Record<string, string | string[]>;
export type Asset = { _id: string; secureUrl: string; width?: number; height?: number; credit?: string; rightsStatus?: string; originalFilename?: string; altText?: { en?: string; ne?: string } };
export type Suggestion = { headline?: string; deck?: string; captionInstagram?: string; captionFacebook?: string; hashtags?: string[]; claimSourceIndexes?: number[] };
export type Source = { url: string; title: string; publisher: string; excerpt: string; trusted: boolean; verifiedAt?: string; verifiedBy?: string; publishedAt?: string };
export type Artifact = { revision: number; locale: string; format: string; url: string; mediaId?: string };
export type StudioPost = {
    _id: string; title: string; revision: number; templateId: SocialPostTemplate; format: SocialPostFormat; outputLanguage: SocialPostLocale;
    ownerId: Identity; reviewerId?: Identity | null; status: SocialPostState;
    copy: Partial<Record<SocialPostLocale, Copy>>;
    typography?: SocialTypography;
    media: { mediaId?: string | Asset | null; credit: string; rightsStatus: string; focalX: number; focalY: number; zoom: number; filter?: (typeof socialPhotoFilters)[number]; filterIntensity?: number };
    sources: Source[]; verification: { claimsConfirmed: boolean; sourcesConfirmed: boolean }; internalNotes?: string;
    renderArtifacts: Artifact[]; approval?: { revision: number; artifactId: string };
};
export type StudioUser = { id: string; role: string; permissions?: { socialPosts?: Partial<Record<'create' | 'edit' | 'submit' | 'approve' | 'export', boolean>> } };
export type StudioApi = <T>(path: string, options?: RequestInit) => Promise<T>;
export const idOf = (value?: Identity | Asset | null): string => typeof value === 'string' ? value : value?._id || '';

/** Persist only editable fields, normalizing populated IDs to their wire format. */
export function editable(post: StudioPost) {
    return {
        title: post.title, templateId: post.templateId, format: post.format, outputLanguage: post.outputLanguage,
        reviewerId: idOf(post.reviewerId) || null, copy: post.copy, sources: post.sources,
        typography: { en: post.typography?.en || {}, ne: post.typography?.ne || {} },
        media: { mediaId: idOf(post.media?.mediaId) || null, credit: post.media?.credit || '', rightsStatus: post.media?.rightsStatus || 'unknown', filter: post.media?.filter || 'none', filterIntensity: post.media?.filterIntensity ?? 1, crop: { focalX: post.media?.focalX ?? .5, focalY: post.media?.focalY ?? .5, zoom: post.media?.zoom ?? 1 } },
        verification: { claimsConfirmed: Boolean(post.verification?.claimsConfirmed), sourcesConfirmed: Boolean(post.verification?.sourcesConfirmed) }, internalNotes: post.internalNotes || '',
    };
}
export const fingerprint = (post: StudioPost) => JSON.stringify(editable(post));
export function changesSince(post: StudioPost, baseline: StudioPost) {
    const current = editable(post);
    const previous = editable(baseline);
    return Object.fromEntries(Object.entries(current).filter(([key, value]) => JSON.stringify(value) !== JSON.stringify(previous[key as keyof typeof previous])));
}
export function applySuggestion(post: StudioPost, suggestion: Suggestion): StudioPost {
    const fields = ['headline', 'deck', 'captionInstagram', 'captionFacebook', 'hashtags'];
    const values = Object.fromEntries(fields.filter(key => suggestion[key as keyof Suggestion] !== undefined).map(key => [key, suggestion[key as keyof Suggestion]])) as Copy;
    return { ...post, copy: { ...post.copy, [post.outputLanguage]: { ...post.copy[post.outputLanguage], ...values } }, verification: { ...post.verification, claimsConfirmed: false } };
}
export function cropValue(key: 'focalX' | 'focalY' | 'zoom', value: number) {
    return Math.min(key === 'zoom' ? 2.5 : 1, Math.max(key === 'zoom' ? 1 : 0, Number.isFinite(value) ? value : key === 'zoom' ? 1 : .5));
}
export function currentArtifact(post: StudioPost, dirty: boolean) {
    if (dirty) return undefined;
    return post.renderArtifacts?.find(item => item.revision === post.revision && item.locale === post.outputLanguage && item.format === post.format && (!post.approval || idOf(item.mediaId) === idOf(post.approval.artifactId)));
}
