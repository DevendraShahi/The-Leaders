import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import InstagramPreviewPage from '@/components/admin/post-studio/InstagramPreviewPage';
import { defaultPostDesign } from '@/lib/post-studio/types';
import type { PostDraft } from '@/lib/post-studio/drafts';
vi.mock('@/components/admin/post-studio/Artwork', async () => {
    const { forwardRef } = await import('react');
    return { Artwork: forwardRef<HTMLDivElement, { design: PostDraft['design'] }>(({ design }, ref) => <div ref={ref}>{design.headline}</div>) };
});
afterEach(cleanup);
const slides: PostDraft[] = ['First story', 'Second story'].map((headline, index) => ({ id: `preview-${index}`, name: headline, createdAt: '', updatedAt: '', trashedAt: null, design: { ...defaultPostDesign, format: index ? 'story' : 'portrait', headline, summary: `Context for ${headline}` } }));
describe('Standalone Instagram preview', () => {
    it('renders a page with navigation and a post-specific caption, without a modal or fabricated engagement', () => {
        const next = vi.fn(); render(<InstagramPreviewPage slides={slides} activeSlideIndex={0} onSelectSlide={next} onBack={vi.fn()} onEdit={vi.fn()} />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Previous preview page' })).toBeDisabled();
        fireEvent.click(screen.getByRole('button', { name: 'Next preview page' })); expect(next).toHaveBeenCalledWith(1);
        expect((screen.getByLabelText('Caption for this post') as HTMLTextAreaElement).value).toContain('First story');
        expect((screen.getByLabelText('Caption for this post') as HTMLTextAreaElement).value).not.toContain('Second story');
        expect(screen.queryByText(/2,842|84 comments|3.1×|2 HOURS AGO/)).not.toBeInTheDocument();
    });
    it('supports selecting the last page and returning to that page in the editor', () => {
        const select = vi.fn(), edit = vi.fn(), back = vi.fn();
        render(<InstagramPreviewPage slides={slides} activeSlideIndex={1} onSelectSlide={select} onBack={back} onEdit={edit} />);
        expect(screen.getByRole('button', { name: 'Next preview page' })).toBeDisabled();
        fireEvent.click(screen.getByRole('button', { name: 'Edit this page' })); expect(edit).toHaveBeenCalledWith(1);
        fireEvent.click(screen.getByRole('button', { name: 'Back to editor' })); expect(back).toHaveBeenCalledOnce();
        fireEvent.change(screen.getByLabelText('Preview page'), { target: { value: '0' } }); expect(select).toHaveBeenCalledWith(0);
    });
    it('handles an empty collection without crashing', () => {
        render(<InstagramPreviewPage slides={[]} activeSlideIndex={0} onSelectSlide={vi.fn()} onBack={vi.fn()} onEdit={vi.fn()} />);
        expect(screen.getByRole('heading', { name: 'No pages to preview' })).toBeInTheDocument();
    });
});
