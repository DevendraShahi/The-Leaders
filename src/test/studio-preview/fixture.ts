import type { Asset, StudioApi, StudioPost } from '@/components/admin/social-studio/session';

/** In-memory test data only. This service never contacts a database or Clerk. */
export const sampleAsset: Asset = { _id: 'image-1', secureUrl: '/media/hero-election.png', width: 1536, height: 1024, credit: 'The Leaders · Illustration', rightsStatus: 'owned', originalFilename: 'hero-election.png', altText: { en: 'Illustration of Nepal flags and a ballot box', ne: 'नेपालको झण्डा र मतपेटिकाको चित्र' } };
export function samplePost(): StudioPost {
    return { _id: 'post-1', title: 'Nepal · Preview fixture', revision: 3, templateId: 'news', format: 'portrait', outputLanguage: 'en', ownerId: 'creator', reviewerId: 'editor', status: 'draft',
        copy: { en: { headline: 'A new chapter for Nepal', deck: 'The stories that shape our nation. Independent reporting, one post at a time.', category: 'NEPAL', eyebrow: 'NEWSROOM', captionInstagram: 'English caption', captionFacebook: 'Facebook caption', hashtags: ['#Nepal'], altText: sampleAsset.altText!.en! }, ne: { headline: 'नेपालको नयाँ अध्याय', deck: 'हाम्रो देशलाई आकार दिने कथाहरू।', category: 'नेपाल', altText: sampleAsset.altText!.ne! } },
        media: { mediaId: sampleAsset, credit: sampleAsset.credit!, rightsStatus: 'owned', focalX: .5, focalY: .5, zoom: 1 },
        sources: [{ url: 'https://example.com/source', title: 'Source fixture', publisher: 'Fixture newsroom', excerpt: 'Reference text for testing.', trusted: true }],
        verification: { claimsConfirmed: true, sourcesConfirmed: true }, renderArtifacts: [], internalNotes: '',
    };
}
export function fixtureService(initial = samplePost()) {
    let post = structuredClone(initial);
    const calls: { path: string; options?: RequestInit }[] = [];
    const api: StudioApi = async <T,>(path: string, options?: RequestInit): Promise<T> => {
        calls.push({ path, options });
        const body = typeof options?.body === 'string' ? JSON.parse(options.body) : {};
        let result: unknown;
        if (path.endsWith('/reviewers')) result = { reviewers: [{ _id: 'editor', name: 'Assigned editor' }] };
        else if (path.includes('/media?')) result = { media: [sampleAsset] };
        else if (path.endsWith('/inbox')) result = { items: [] };
        else if (path.endsWith('/ai')) result = { suggestion: { headline: 'Suggested headline', deck: 'Suggested supporting text', captionInstagram: 'Suggested Instagram caption', captionFacebook: 'Suggested Facebook caption', hashtags: ['#Grounded'], claimSourceIndexes: [0] } };
        else if (path.endsWith('/render')) { const artifact = { revision: post.revision, locale: post.outputLanguage, format: post.format, mediaId: 'render-1', url: '/media/hero-election.png' }; post.renderArtifacts = [artifact]; result = { artifact }; }
        else if (path.endsWith('/actions')) {
            if (body.action === 'verify_source') post.sources[body.sourceIndex].verifiedAt = new Date().toISOString();
            else post.status = body.action === 'submit' ? 'in_review' : body.action === 'approve' ? 'approved' : 'changes_requested';
            if (body.action === 'approve') post.approval = { revision: post.revision, artifactId: 'render-1' };
            result = { post };
        } else if (path.endsWith('/download')) result = new Blob(['fixture-png'], { type: 'image/png' });
        else if (options?.method === 'PATCH') {
            const { revision, media, ...fields } = body;
            const contentChanged = Object.keys(fields).some(key => !['reviewerId', 'internalNotes'].includes(key)) || Boolean(media);
            post = { ...post, ...fields, revision: contentChanged ? revision + 1 : revision, ...(contentChanged ? { status: 'draft', approval: undefined, renderArtifacts: [] } : {}) };
            if (media) { const { crop, ...metadata } = media; post.media = { ...post.media, ...metadata, ...crop }; }
            result = { post };
        } else if (options?.method === 'POST') { post = { ...samplePost(), _id: 'post-2', title: 'Untitled social post', revision: 0 }; result = { post }; }
        else result = path.endsWith('/social-posts') ? { posts: [post] } : { post };
        return structuredClone(result) as T;
    };
    return { api, calls, getPost: () => post };
}
