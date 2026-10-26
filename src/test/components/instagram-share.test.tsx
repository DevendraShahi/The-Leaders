import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import InstagramSharePanel from '@/components/admin/post-studio/InstagramSharePanel';
import { defaultPostDesign } from '@/lib/post-studio/types';
import type { PostDraft } from '@/lib/post-studio/drafts';
const mocks = vi.hoisted(() => ({ bytes: vi.fn(), download: vi.fn(), share: vi.fn(), canShare: vi.fn() }));
vi.mock('@/lib/post-studio/export', () => ({ artworkBytes: mocks.bytes, download: mocks.download }));
const slides = [0, 1].map(index => ({ id: `page-${index}`, name: `Page ${index + 1}`, design: { ...defaultPostDesign, headline: `Headline ${index + 1}` } })) as PostDraft[];
function props() { return { slides, activeIndex: 0, getNode: vi.fn(() => document.createElement('div')), persist: vi.fn(async () => true), disabled: false, setPreparing: vi.fn(), onClose: vi.fn() }; }
async function prepare() { fireEvent.click(screen.getByRole('button', { name: 'Prepare images' })); await screen.findByRole('textbox', { name: 'Instagram caption' }); }
beforeEach(() => {
    vi.clearAllMocks(); mocks.bytes.mockResolvedValue(new Uint8Array([1, 2])); mocks.canShare.mockReturnValue(true); mocks.share.mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'share', { configurable: true, value: mocks.share });
    Object.defineProperty(navigator, 'canShare', { configurable: true, value: mocks.canShare });
});
afterEach(cleanup);
describe('Instagram image sharing', () => {
    it('prepares the current page without opening a share sheet until a fresh click', async () => {
        const p = props(); render(<InstagramSharePanel {...p} />); await prepare();
        expect(p.persist).toHaveBeenCalledOnce(); expect(mocks.bytes).toHaveBeenCalledOnce(); expect(mocks.share).not.toHaveBeenCalled();
        fireEvent.click(screen.getByRole('button', { name: 'Share images' }));
        await screen.findByText('Images handed to your device. Finish posting in Instagram.');
        const files = mocks.share.mock.calls[0][0].files;
        expect(files).toHaveLength(1); expect(files[0].type).toBe('image/png'); expect(files[0].name).toBe('the-leaders-01.png');
        expect(mocks.share.mock.calls[0][0]).not.toHaveProperty('url');
    });
    it('shares ordered individual PNGs for a carousel', async () => {
        render(<InstagramSharePanel {...props()} />);
        fireEvent.change(screen.getByRole('combobox', { name: 'Images to share' }), { target: { value: 'all' } }); await prepare();
        fireEvent.click(screen.getByRole('button', { name: 'Share images' }));
        await waitFor(() => expect(mocks.share).toHaveBeenCalledOnce());
        expect(mocks.share.mock.calls[0][0].files.map((file: File) => file.name)).toEqual(['the-leaders-01.png', 'the-leaders-02.png']);
        expect(screen.getByRole('button', { name: 'Download ZIP' })).toBeInTheDocument();
    });
    it('offers downloads and Instagram when file sharing is unsupported', async () => {
        mocks.canShare.mockReturnValue(false); render(<InstagramSharePanel {...props()} />); await prepare();
        expect(screen.queryByRole('button', { name: 'Share images' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Download PNG' })).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Open Instagram' })).toHaveAttribute('href', 'https://www.instagram.com/');
    });
    it('keeps prepared files after cancellation and does not claim publication', async () => {
        mocks.share.mockRejectedValue(new DOMException('Cancelled', 'AbortError')); render(<InstagramSharePanel {...props()} />); await prepare();
        fireEvent.click(screen.getByRole('button', { name: 'Share images' }));
        await screen.findByText('Sharing cancelled. Your images are still ready.');
        expect(screen.getByRole('button', { name: 'Share images' })).toBeEnabled();
    });
    it('invalidates prepared files when artwork changes', async () => {
        const p = props(); const view = render(<InstagramSharePanel {...p} />); await prepare();
        view.rerender(<InstagramSharePanel {...p} slides={slides.map(page => ({ ...page, design: { ...page.design, headline: 'Updated' } }))} />);
        expect(screen.queryByRole('button', { name: 'Share images' })).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Prepare images' })).toBeEnabled();
    });
    it('stops if saving fails or artwork export fails', async () => {
        const p = props(); p.persist.mockResolvedValue(false); render(<InstagramSharePanel {...p} />);
        fireEvent.click(screen.getByRole('button', { name: 'Prepare images' })); await screen.findByText('Save the draft successfully before sharing.');
        expect(mocks.bytes).not.toHaveBeenCalled();
        p.persist.mockResolvedValue(true); mocks.bytes.mockRejectedValue(new Error('Artwork content is clipped.'));
        fireEvent.click(screen.getByRole('button', { name: 'Prepare images' })); await screen.findByText('Artwork content is clipped.');
        expect(screen.queryByRole('button', { name: 'Share images' })).not.toBeInTheDocument(); expect(p.setPreparing).toHaveBeenLastCalledWith(false);
    });
});
