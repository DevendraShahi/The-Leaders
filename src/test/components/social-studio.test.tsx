import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import StudioEditor from '@/components/admin/social-studio/StudioEditor';
import { applySuggestion, changesSince, cropValue, currentArtifact, editable, fingerprint, type StudioApi, type StudioPost } from '@/components/admin/social-studio/session';
import { fixtureService, samplePost } from '../studio-preview/fixture';

afterEach(cleanup);
const originalScrollIntoView = Element.prototype.scrollIntoView;
beforeAll(() => {
    // jsdom has no layout scrolling; Radix Select uses this browser method.
    Element.prototype.scrollIntoView = vi.fn();
});
afterAll(() => { Element.prototype.scrollIntoView = originalScrollIntoView; });
async function choose(event: ReturnType<typeof userEvent.setup>, label: string, option: RegExp | string) {
    const trigger = screen.getByRole('combobox', { name: label });
    trigger.focus();
    await event.keyboard('{ArrowDown}');
    await event.click(await screen.findByRole('option', { name: option }));
}
async function mount(post = samplePost(), id = 'creator', override?: StudioApi) {
    const service = fixtureService(post);
    const exit = vi.fn();
    render(<StudioEditor api={override || service.api} user={{ id, role: 'superadmin' }} onExit={exit} />);
    await screen.findByRole('img', { name: /Live social artwork|Rendered approval preview/ });
    return { ...service, exit, event: userEvent.setup() };
}

describe('Social Studio session', () => {
    it('applies every suggested field atomically without losing the other language', () => {
        const original = samplePost();
        const next = applySuggestion(original, { headline: 'AI headline', deck: 'AI deck', captionInstagram: 'IG', captionFacebook: 'FB', hashtags: ['#Source'] });
        expect(next.copy.en).toMatchObject({ headline: 'AI headline', deck: 'AI deck', captionInstagram: 'IG', captionFacebook: 'FB', hashtags: ['#Source'] });
        expect(next.copy.ne).toEqual(original.copy.ne);
        expect(next.verification.claimsConfirmed).toBe(false);
        expect(original.copy.en?.headline).not.toBe('AI headline');
    });
    it('sends only changed fields, using IDs and bounded crop metadata', () => {
        const post = samplePost();
        expect(editable(post).media.mediaId).toBe('image-1');
        expect(changesSince({ ...post, title: 'Renamed' }, post)).toEqual({ title: 'Renamed' });
        expect(changesSince(post, post)).toEqual({});
        expect(cropValue('zoom', 20)).toBe(2.5);
        expect(cropValue('focalX', -10)).toBe(0);
        expect(cropValue('focalY', Number.NaN)).toBe(.5);
    });
    it('never exposes a stale, wrong-language, or unapproved artifact', () => {
        const post = samplePost();
        post.renderArtifacts = [{ revision: 2, locale: 'en', format: 'portrait', url: 'old' }, { revision: 3, locale: 'ne', format: 'portrait', url: 'wrong' }, { revision: 3, locale: 'en', format: 'portrait', mediaId: 'render-1', url: 'current' }];
        expect(currentArtifact(post, false)?.url).toBe('current');
        expect(currentArtifact(post, true)).toBeUndefined();
        post.approval = { revision: 3, artifactId: 'other-render' };
        expect(currentArtifact(post, false)).toBeUndefined();
    });
    it('normalizes populated references when comparing saved content', () => {
        const post = samplePost();
        expect(fingerprint(post)).toBe(fingerprint({ ...post, reviewerId: { _id: 'editor', name: 'Editor' }, media: { ...post.media, mediaId: 'image-1' } }));
    });
});

describe('Social Studio editor', () => {
    it('uses shadcn fields and restores select focus without closing the inspector', async () => {
        const { event } = await mount();
        expect(screen.getByRole('button', { name: 'Export' })).toHaveAttribute('data-slot', 'button');
        await event.click(screen.getByRole('button', { name: 'Text' }));
        expect(screen.getByLabelText('Draft name')).toHaveAttribute('data-slot', 'input');
        const trigger = screen.getByRole('combobox', { name: 'Artwork language' });
        expect(trigger).toHaveAttribute('data-slot', 'select-trigger');
        trigger.focus();
        await event.keyboard('{ArrowDown}');
        expect(await screen.findByRole('listbox')).toBeInTheDocument();
        await event.keyboard('{Escape}');
        expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
        expect(screen.getByRole('complementary', { name: 'Text inspector' })).toBeInTheDocument();
        expect(trigger).toHaveFocus();
    });
    it('traps draft-dialog focus and reports an empty search without hiding saved work', async () => {
        const { event } = await mount();
        const opener = screen.getByRole('button', { name: 'Open drafts' });
        await event.click(opener);
        const dialog = screen.getByRole('dialog', { name: 'Team drafts' });
        expect(dialog).toHaveAttribute('data-slot', 'dialog-content');
        expect(screen.queryByRole('button', { name: 'Text' })).not.toBeInTheDocument();
        const search = within(dialog).getByRole('textbox', { name: 'Search drafts' });
        expect(search).toHaveFocus();
        await event.keyboard('{Shift>}{Tab}{/Shift}');
        expect(within(dialog).getByRole('button', { name: 'Close drafts' })).toHaveFocus();
        await event.keyboard('{Shift>}{Tab}{/Shift}{Shift>}{Tab}{/Shift}');
        expect(within(dialog).getByRole('button', { name: /Nepal · Preview fixture/ })).toHaveFocus();
        await event.type(search, 'No match');
        expect(within(dialog).getByText('No matching drafts.')).toBeInTheDocument();
        await event.clear(search);
        expect(within(dialog).getByRole('button', { name: /Nepal · Preview fixture/ })).toBeInTheDocument();
        await event.keyboard('{Escape}');
        expect(opener).toHaveFocus();
    });
    it('saves explicit human confirmations from Radix checkboxes', async () => {
        const post = samplePost(); post.verification = { claimsConfirmed: false, sourcesConfirmed: false };
        const { event, calls } = await mount(post);
        await event.click(screen.getByRole('button', { name: 'Review' }));
        const claims = screen.getByRole('checkbox', { name: 'I confirmed the claims against the sources.' });
        expect(claims).toHaveAttribute('data-slot', 'checkbox');
        expect(screen.getByRole('button', { name: 'Submit to editor' })).toBeDisabled();
        await event.click(claims);
        await event.click(screen.getByRole('checkbox', { name: 'I checked the sources and attribution.' }));
        expect(screen.getByRole('button', { name: 'Submit to editor' })).toBeEnabled();
        await event.click(screen.getByRole('button', { name: 'Save draft' }));
        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Saved · r4'));
        expect(JSON.parse(calls.find(call => call.options?.method === 'PATCH')!.options!.body as string).verification).toEqual({ claimsConfirmed: true, sourcesConfirmed: true });
    });
    it('keeps the refreshed toolbar icons decorative and every tool clearly named', async () => {
        const { event } = await mount();
        for (const name of ['Crop', 'Text', 'Media', 'Templates', 'Captions', 'Review', 'Open drafts', 'Save and close studio']) {
            const button = screen.getByRole('button', { name });
            expect(button).toHaveAttribute('title', name);
            expect(button.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
        }
        expect(screen.getByRole('button', { name: 'Export' }).querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
        await event.click(screen.getByRole('button', { name: 'Text' }));
        expect(screen.getByRole('heading', { name: 'Text' })).toBeInTheDocument();
        expect(screen.getByRole('heading', { name: 'Text' }).querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
    });
    it('starts canvas-first and switches tools without losing bilingual copy', async () => {
        const { event } = await mount();
        expect(screen.queryByLabelText('Headline')).not.toBeInTheDocument();
        await event.click(screen.getByRole('button', { name: 'Text' }));
        await choose(event, 'Artwork language', 'नेपाली');
        expect(screen.getByLabelText('Headline')).toHaveValue('नेपालको नयाँ अध्याय');
        await event.click(screen.getByRole('button', { name: 'Templates' }));
        await event.click(screen.getByRole('button', { name: 'Quote' }));
        await event.click(screen.getByRole('button', { name: 'Text' }));
        expect(screen.getByLabelText('Headline')).toHaveValue('नेपालको नयाँ अध्याय');
        expect(screen.getByLabelText('Speaker')).toBeInTheDocument();
        await choose(event, 'Artwork language', 'English');
        expect(screen.getByLabelText('Headline')).toHaveValue('A new chapter for Nepal');
    });
    it('supports undo, redo and saving the crop without unrelated payload changes', async () => {
        const { event, calls } = await mount();
        await event.click(screen.getByRole('button', { name: 'Crop' }));
        fireEvent.keyDown(screen.getByRole('slider', { name: 'Image scale' }), { key: 'End' });
        await event.click(screen.getByRole('button', { name: 'Undo' }));
        expect(screen.getByRole('slider', { name: 'Image scale' })).toHaveAttribute('aria-valuenow', '1');
        await event.click(screen.getByRole('button', { name: 'Redo' }));
        expect(screen.getByRole('slider', { name: 'Image scale' })).toHaveAttribute('aria-valuenow', '2.5');
        await event.click(screen.getByRole('button', { name: 'Save draft' }));
        await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Saved · r4'));
        const payload = JSON.parse(calls.find(call => call.options?.method === 'PATCH')!.options!.body as string);
        expect(payload).toMatchObject({ revision: 3, media: { mediaId: 'image-1', crop: { zoom: 2.5 } } });
        expect(payload).not.toHaveProperty('copy');
        expect(payload).not.toHaveProperty('sources');
    });
    it('saves before AI, displays source references and applies all captions', async () => {
        const { event, calls } = await mount();
        await event.click(screen.getByRole('button', { name: 'Text' }));
        fireEvent.change(screen.getByLabelText('Draft name'), { target: { value: 'Renamed draft' } });
        await event.click(screen.getByRole('button', { name: 'Review' }));
        await event.click(screen.getByRole('button', { name: 'Draft copy' }));
        await screen.findByText('Suggested headline');
        expect(screen.getByText(/Suggested claims reference sources/)).toHaveTextContent('Source fixture');
        expect(calls.findIndex(call => call.options?.method === 'PATCH')).toBeLessThan(calls.findIndex(call => call.path.endsWith('/ai')));
        await event.click(screen.getByRole('button', { name: 'Apply to English copy' }));
        await event.click(screen.getByRole('button', { name: 'Captions' }));
        expect(screen.getByLabelText('Instagram caption')).toHaveValue('Suggested Instagram caption');
        expect(screen.getByLabelText('Facebook caption')).toHaveValue('Suggested Facebook caption');
        expect(screen.getByLabelText('Hashtags')).toHaveValue('#Grounded');
    });
    it('uses the saved revision for rendering and then displays the immutable PNG', async () => {
        const { event, calls } = await mount();
        await choose(event, 'Artwork format', /1:1 · Square/);
        await event.click(screen.getByRole('button', { name: 'Export' }));
        await event.click(screen.getByRole('button', { name: 'Render current revision' }));
        await screen.findByRole('img', { name: 'Rendered approval preview, revision 4' });
        const call = calls.find(item => item.path.endsWith('/render'))!;
        expect(JSON.parse(call.options!.body as string).revision).toBe(4);
        expect(calls.filter(item => item.options?.method === 'PATCH')).toHaveLength(1);
    });
    it('keeps a failed save editable and does not render an unsaved revision', async () => {
        const service = fixtureService();
        const api: StudioApi = async <T,>(path: string, options?: RequestInit) => {
            if (options?.method === 'PATCH') throw new Error('Revision conflict. Your work was not overwritten.');
            return service.api<T>(path, options);
        };
        const { event } = await mount(samplePost(), 'creator', api);
        await choose(event, 'Artwork format', /9:16 · Story/);
        await event.click(screen.getByRole('button', { name: 'Export' }));
        await event.click(screen.getByRole('button', { name: 'Render current revision' }));
        expect(await screen.findByRole('alert')).toHaveTextContent('Revision conflict');
        expect(screen.getByRole('combobox', { name: 'Artwork format' })).toHaveTextContent('9:16 · Story');
        expect(service.calls.some(call => call.path.endsWith('/render'))).toBe(false);
        expect(screen.getByRole('button', { name: 'Save draft' })).toBeEnabled();
    });
    it('only allows the assigned non-creator reviewer to approve a decoded render', async () => {
        const post = samplePost(); post.status = 'in_review'; post.renderArtifacts = [{ revision: 3, locale: 'en', format: 'portrait', url: '/render.png', mediaId: 'render-1' }];
        const { event, calls } = await mount(post, 'editor');
        await event.click(screen.getByRole('button', { name: 'Review' }));
        const approve = screen.getByRole('button', { name: 'Approve this render' });
        expect(approve).toBeDisabled();
        const img = screen.getByRole('img', { name: /Rendered approval preview/ });
        Object.defineProperties(img, { naturalWidth: { value: 1080 }, naturalHeight: { value: 1350 } }); fireEvent.load(img);
        expect(approve).toBeEnabled();
        await event.click(approve);
        await waitFor(() => expect(calls.some(call => call.path.endsWith('/actions'))).toBe(true));
        expect(screen.getByRole('button', { name: 'Download PNG' })).toBeEnabled();
    });
    it('blocks approval when the artifact fails or has the wrong dimensions', async () => {
        const post = samplePost(); post.status = 'in_review'; post.renderArtifacts = [{ revision: 3, locale: 'en', format: 'portrait', url: '/wrong.png' }];
        const { event } = await mount(post, 'editor');
        await event.click(screen.getByRole('button', { name: 'Review' }));
        fireEvent.load(screen.getByRole('img', { name: /Rendered approval preview/ }));
        expect(screen.getByRole('button', { name: 'Approve this render' })).toBeDisabled();
        expect(screen.getByRole('alert')).toHaveTextContent('incorrect dimensions');
    });
    it('does not offer self approval and opens export as review for drafts', async () => {
        const post = samplePost(); post.status = 'in_review'; post.reviewerId = 'creator';
        const { event, calls } = await mount(post);
        await event.click(screen.getByRole('button', { name: 'Export' }));
        expect(screen.queryByRole('button', { name: 'Approve this render' })).not.toBeInTheDocument();
        expect(calls.some(call => call.path.endsWith('/download'))).toBe(false);
    });
    it('restores keyboard focus after closing drafts and skips no-op saves', async () => {
        const { event, exit, calls } = await mount();
        const opener = screen.getByRole('button', { name: 'Open drafts' });
        await event.click(opener);
        expect(screen.getByLabelText('Search drafts')).toHaveFocus();
        await event.keyboard('{Escape}');
        expect(opener).toHaveFocus();
        await event.click(screen.getByRole('button', { name: 'Save and close studio' }));
        await waitFor(() => expect(exit).toHaveBeenCalled());
        expect(calls.some(call => call.options?.method === 'PATCH')).toBe(false);
    });
    it('retains a draft when the connection goes offline', async () => {
        const { event } = await mount();
        await event.click(screen.getByRole('button', { name: 'Text' }));
        fireEvent.change(screen.getByLabelText('Draft name'), { target: { value: 'Offline work' } });
        Object.defineProperty(navigator, 'onLine', { value: false, configurable: true }); fireEvent(window, new Event('offline'));
        expect(screen.getByLabelText('Draft name')).toHaveValue('Offline work');
        expect(screen.getByRole('button', { name: 'Save draft' })).toBeDisabled();
        expect(screen.getByRole('combobox', { name: 'Artwork language' })).toBeDisabled();
        expect(screen.getByRole('combobox', { name: 'Artwork format' })).toBeDisabled();
        Object.defineProperty(navigator, 'onLine', { value: true, configurable: true }); fireEvent(window, new Event('online'));
        expect(screen.getByRole('button', { name: 'Save draft' })).toBeEnabled();
    });
});
