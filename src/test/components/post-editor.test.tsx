import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import PostEditor from '@/components/admin/post-studio/PostEditor';
import { createDraftCollection, listDrafts, readDraft, type PostDraft } from '@/lib/post-studio/drafts';
import { defaultPostDesign } from '@/lib/post-studio/types';
const storage = vi.hoisted(() => ({ data: new Map<string, string>(), fail: false }));
vi.mock('@/lib/post-studio/storage', () => ({ default: {
    getItem: async (key: string) => storage.data.get(key) ?? null,
    setItem: async (key: string, value: string) => { if (storage.fail) throw new Error('Quota exceeded'); storage.data.set(key, value); },
} }));
vi.mock('@/components/admin/post-studio/StudioMediaModal', () => ({ default: () => null }));
vi.mock('@/components/admin/post-studio/InstagramPreviewModal', () => ({ default: () => null }));
vi.mock('@/components/admin/post-studio/Artwork', async () => {
    const { forwardRef } = await import('react');
    return { Artwork: forwardRef<HTMLDivElement, { design: PostDraft['design'] }>(({ design }, ref) => <div ref={ref} data-testid="artwork" data-align={design.textAlign}>{design.headline}</div>) };
});
beforeEach(() => {
    storage.data.clear(); storage.fail = false;
    vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true; } });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false; } });
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
async function mount(imageUri: string | null = null, onPreviewDraft?: (draft: PostDraft) => void) {
    const drafts = await createDraftCollection('test-editor', [
        { id: 'deck-1', name: 'Test deck · 1/2', design: { ...defaultPostDesign, imageUri, headline: 'First page' } },
        { id: 'deck-2', name: 'Test deck · 2/2', design: { ...defaultPostDesign, headline: 'Second page' } },
    ]);
    render(<PostEditor scope="test-editor" draft={drafts[0]} onClose={vi.fn()} onPreviewDraft={onPreviewDraft} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'All 2 pages' })).toBeEnabled());
}
async function save() {
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toHaveTextContent('Saved'));
}
describe('Current Studio carousel editor', () => {
    it('saves pending edits before navigating to the standalone preview', async () => {
        const preview = vi.fn(); await mount(null, preview);
        fireEvent.change(screen.getByLabelText('Edit headline'), { target: { value: 'Latest preview headline' } });
        fireEvent.click(screen.getByRole('button', { name: 'Preview Instagram post' }));
        await waitFor(() => expect(preview).toHaveBeenCalledTimes(1));
        expect((await readDraft('test-editor', 'deck-1')).design.headline).toBe('Latest preview headline');
        expect(preview.mock.calls[0][0].id).toBe('deck-1');
        expect(screen.queryByRole('dialog', { name: 'Instagram Feed Simulator' })).not.toBeInTheDocument();
    });
    it('keeps the editor open if saving before preview fails', async () => {
        const preview = vi.fn(); await mount(null, preview);
        fireEvent.change(screen.getByLabelText('Edit headline'), { target: { value: 'Unsaved changes' } });
        storage.fail = true;
        fireEvent.click(screen.getByRole('button', { name: 'Preview Instagram post' }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'Retry saving' })).toBeInTheDocument());
        expect(preview).not.toHaveBeenCalled();
    });

    it('groups PNG, ZIP and caption actions in clear export options', async () => {
        await mount();
        fireEvent.click(screen.getByRole('button', { name: 'Export options' }));
        const dialog = screen.getByRole('dialog', { name: 'Download your artwork' });
        expect(within(dialog).getByText('Current page')).toBeInTheDocument();
        expect(within(dialog).getByText('All pages')).toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: 'Download this PNG' })).toBeEnabled();
        expect(within(dialog).getByRole('button', { name: 'Download all as ZIP' })).toBeEnabled();
        expect(within(dialog).getByText(/1080 × 1080 px/)).toBeInTheDocument();
        fireEvent.click(within(dialog).getByRole('button', { name: 'Close export options' }));
        expect(screen.queryByRole('dialog', { name: 'Download your artwork' })).not.toBeInTheDocument();
    });
    it('restores the image scroll ball with keyboard panning, centering, and undo', async () => {
        await mount('test-photo');
        fireEvent.click(screen.getByRole('tab', { name: 'Image' }));
        const ball = screen.getByRole('group', { name: 'Image scroll ball' });
        expect(ball).toHaveAttribute('aria-disabled', 'false');
        fireEvent.keyDown(ball, { key: 'ArrowRight', shiftKey: true }); fireEvent.keyUp(ball, { key: 'ArrowRight' });
        await save(); expect((await readDraft('test-editor', 'deck-1')).design.imageOffsetX).toBe(10);
        fireEvent.click(screen.getByRole('button', { name: 'Center photo' })); await save();
        expect((await readDraft('test-editor', 'deck-1')).design.imageOffsetX).toBe(0);
        fireEvent.click(screen.getByRole('button', { name: 'Undo' })); await save();
        expect((await readDraft('test-editor', 'deck-1')).design.imageOffsetX).toBe(10);
        fireEvent.click(screen.getByRole('button', { name: 'Lock visual' }));
        fireEvent.keyDown(ball, { key: 'ArrowRight' }); fireEvent.keyUp(ball, { key: 'ArrowRight' }); await save();
        expect(ball).toHaveAttribute('aria-disabled', 'true');
        expect((await readDraft('test-editor', 'deck-1')).design.imageOffsetX).toBe(10);
    });
    it('defaults to editing one page without changing its sibling', async () => {
        await mount(); fireEvent.click(screen.getByRole('button', { name: 'Align center' })); await save();
        expect((await readDraft('test-editor', 'deck-1')).design.textAlign).toBe('center');
        expect((await readDraft('test-editor', 'deck-2')).design.textAlign).toBe('left');
    });
    it('shares selected styles, keeps copy unique, and undoes the full carousel', async () => {
        await mount();
        fireEvent.click(screen.getByRole('button', { name: 'All 2 pages' }));
        fireEvent.click(screen.getByRole('button', { name: 'Align center' }));
        fireEvent.change(screen.getByLabelText('Edit headline'), { target: { value: 'Rewritten cover' } });
        await save();
        const second = await readDraft('test-editor', 'deck-2');
        expect(second.design.textAlign).toBe('center'); expect(second.design.headline).toBe('Second page');
        fireEvent.click(screen.getByRole('button', { name: 'Undo' }));
        fireEvent.click(screen.getByRole('button', { name: 'Undo' })); await save();
        expect((await readDraft('test-editor', 'deck-1')).design.textAlign).toBe('left');
        expect((await readDraft('test-editor', 'deck-2')).design.textAlign).toBe('left');
        expect(screen.getByLabelText('Edit headline')).toHaveValue('First page');
    });
    it('shares an existing style once without enabling live global edits', async () => {
        await mount(); fireEvent.click(screen.getByRole('button', { name: 'Align center' }));
        fireEvent.click(screen.getByRole('button', { name: 'Choose styles to share' }));
        fireEvent.click(screen.getByRole('button', { name: 'Apply selected styles now' })); await save();
        expect((await readDraft('test-editor', 'deck-2')).design.textAlign).toBe('center');
        fireEvent.click(screen.getByRole('button', { name: 'Align left' })); await save();
        expect((await readDraft('test-editor', 'deck-2')).design.textAlign).toBe('center');
    });
    it('saves reordered pages and keeps unsaved text when switching pages', async () => {
        await mount();
        fireEvent.change(screen.getByLabelText('Edit headline'), { target: { value: 'Draft before switch' } });
        fireEvent.click(screen.getByRole('button', { name: 'Page 2: Second page' }));
        expect(screen.getByLabelText('Edit headline')).toHaveValue('Second page');
        fireEvent.click(screen.getByRole('tab', { name: /Pages/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Move page 2 earlier' })); await save();
        expect((await readDraft('test-editor', 'deck-2')).carouselOrder).toBe(0);
        expect((await readDraft('test-editor', 'deck-1')).design.headline).toBe('Draft before switch');
    });
    it('reports a failed shared save and retries without losing edits', async () => {
        await mount(); storage.fail = true;
        fireEvent.click(screen.getByRole('button', { name: 'All 2 pages' }));
        fireEvent.click(screen.getByRole('button', { name: 'Align center' }));
        fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
        await screen.findByRole('button', { name: 'Retry saving' });
        expect((await readDraft('test-editor', 'deck-2')).design.textAlign).toBe('left');
        storage.fail = false; fireEvent.click(screen.getByRole('button', { name: 'Retry saving' }));
        await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toHaveTextContent('Saved'));
        expect((await readDraft('test-editor', 'deck-2')).design.textAlign).toBe('center');
    });
    it('adds a persistent blank page and keeps the new page in the carousel', async () => {
        await mount(); fireEvent.click(screen.getByRole('button', { name: 'Add page' }));
        await waitFor(() => expect(screen.getByLabelText('Edit headline')).toHaveValue(''));
        const all = await listDrafts('test-editor');
        expect(all).toHaveLength(3); expect(new Set(all.map(item => item.carouselId)).size).toBe(1);
        expect(all.find(item => item.carouselOrder === 2)?.design.headline).toBe('');
    });
    it('supports keyboard navigation between tool tabs', async () => {
        await mount(); const tab = screen.getByRole('tab', { name: 'Text' }); tab.focus();
        fireEvent.keyDown(tab, { key: 'ArrowRight' });
        expect(screen.getByRole('tab', { name: 'Design' })).toHaveFocus();
        expect(screen.getByRole('tabpanel', { name: 'Design' })).toBeVisible();
        fireEvent.click(within(screen.getByRole('tabpanel', { name: 'Design' })).getByText('Page template'));
        fireEvent.click(screen.getByRole('button', { name: /Quote/ }));
        fireEvent.click(screen.getByRole('tab', { name: 'Text' }));
        expect(screen.getByLabelText('Edit headline')).toHaveValue('First page');
    });
});
