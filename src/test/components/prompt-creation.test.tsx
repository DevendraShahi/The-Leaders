import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const storage = vi.hoisted(() => ({ data: new Map<string, string>(), fail: false }));
vi.mock('@/lib/post-studio/storage', () => ({ default: {
    getItem: async (key: string) => storage.data.get(key) ?? null,
    setItem: async (key: string, value: string) => { if (storage.fail) throw new Error('Storage full. Retry.'); storage.data.set(key, value); },
} }));
import PromptCreationModal from '@/components/admin/post-studio/PromptCreationModal';
import { listDrafts } from '@/lib/post-studio/drafts';
const clipboard = vi.fn().mockResolvedValue(undefined);
const json = JSON.stringify({ version: 1, title: 'Confirmed news', sources: ['https://example.com/report'], posts: [{ template: 'breaking', headline: 'A verified headline', summary: 'A verified summary.' }] });
beforeEach(() => {
    storage.data.clear(); storage.fail = false; clipboard.mockReset().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: clipboard } });
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true; } });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false; } });
});
afterEach(cleanup);
async function responseStep(request = 'A confirmed news update') {
    if (screen.queryByLabelText('Featured team')) {
        fireEvent.change(screen.getByLabelText('Featured team'), { target: { value: 'lumbini' } });
        fireEvent.change(screen.getByLabelText('Opponent'), { target: { value: 'sudurpaschim' } });
    }
    fireEvent.change(screen.getByLabelText(screen.queryByLabelText('Your request') ? 'Your request' : 'Additional information (optional)'), { target: { value: request } });
    fireEvent.click(screen.getByRole('button', { name: '1-Click Copy Prompt' }));
    fireEvent.click(screen.getByRole('button', { name: 'Next: Paste AI Output' }));
    await screen.findByLabelText('AI response');
}
async function preview() {
    await responseStep();
    fireEvent.change(screen.getByLabelText('AI response'), { target: { value: json } });
    fireEvent.click(screen.getByRole('button', { name: 'Review post' }));
}
describe('Guided post creation', () => {
    it('reviews and saves a wicket for the opposite batting side without changing the selected match', async () => {
        const open = vi.fn();
        render(<PromptCreationModal scope="editor" initialOptions={{ template: 'wicket', teams: { teamId: 'lumbini', opponentId: 'sudurpaschim' } }} onOpen={open} onClose={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: 'Next: Paste AI Output' }));
        const input = await screen.findByLabelText('AI response');
        fireEvent.change(input, { target: { value: JSON.stringify({ match: { teamId: 'lumbini', opponentId: 'sudurpaschim', oversLimit: 20 }, posts: [{ template: 'wicket', teamId: 'sudurpaschim', headline: 'WICKET', data: { batter: { name: 'Dipendra Singh Airee' }, bowler: { name: 'Rohit Paudel' }, wicketType: 'caught' } }] }) } });
        fireEvent.click(screen.getByRole('button', { name: 'Review post' }));
        expect(screen.getByLabelText('Batting team')).toHaveValue('sudurpaschim');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Save unfinished draft' }));
        await waitFor(() => expect(open).toHaveBeenCalledOnce());
        expect((await listDrafts('editor'))[0].design.cricket).toMatchObject({ template: 'wicket', teamId: 'sudurpaschim', opponentId: 'lumbini', bowler: { name: 'Rohit Paudel' } });
    });
    it('uses the rewritten XI prompt for manual copying and repair requests', async () => {
        clipboard.mockRejectedValueOnce(new Error('denied'));
        render(<PromptCreationModal scope="editor" initialOptions={{ template: 'playing-xi', teams: { teamId: 'lumbini', opponentId: 'sudurpaschim' } }} onOpen={vi.fn()} onClose={vi.fn()} />);
        fireEvent.click(screen.getByRole('button', { name: '1-Click Copy Prompt' }));
        const fallback = await screen.findByLabelText('Generated creation prompt');
        expect(fallback).toHaveValue(clipboard.mock.calls[0][0]);
        expect((fallback as HTMLTextAreaElement).value).toContain('RETURN THIS JSON OBJECT');
        fireEvent.click(screen.getByRole('button', { name: 'I copied it' }));
        fireEvent.change(screen.getByLabelText('AI response'), { target: { value: '{bad' } });
        fireEvent.click(screen.getByRole('button', { name: 'Review post' }));
        fireEvent.click(screen.getByRole('button', { name: 'Copy repair request' }));
        await waitFor(() => expect(clipboard).toHaveBeenCalledTimes(2));
        expect(clipboard.mock.calls[1][0]).toContain('REPAIR REQUEST: Rebuild');
        expect(clipboard.mock.calls[1][0]).toContain('RETURN THIS JSON OBJECT');
        expect(clipboard.mock.calls[1][0]).toContain('Invalid JSON');
    });
    it('creates a cricket prompt from dropdowns without requiring typed instructions', async () => {
        render(<PromptCreationModal scope="editor" onOpen={vi.fn()} onClose={vi.fn()} />);
        fireEvent.change(screen.getByLabelText('Post content type'), { target: { value: 'result' } });
        fireEvent.change(screen.getByLabelText('Featured team'), { target: { value: 'janakpur' } });
        fireEvent.change(screen.getByLabelText('Opponent'), { target: { value: 'chitwan' } });
        expect(screen.getByLabelText('Additional information (optional)')).toHaveValue('');
        expect(screen.getByRole('button', { name: '1-Click Copy Prompt' })).toBeEnabled();
        expect(screen.getByRole('button', { name: 'Next: Paste AI Output' })).toBeEnabled();
        fireEvent.click(screen.getByRole('button', { name: '1-Click Copy Prompt' }));
        fireEvent.click(screen.getByRole('button', { name: 'Next: Paste AI Output' }));
        await screen.findByLabelText('AI response');
        expect(clipboard.mock.calls[0][0]).toContain('Return exactly 1 posts in this order: result');
        expect(clipboard.mock.calls[0][0]).toContain('Janakpur Bolts vs Chitwan Rhinos');
        expect(clipboard.mock.calls[0][0]).toContain('match.teamId = "janakpur"');
    });
    it('prevents selecting the same team on both sides', () => {
        render(<PromptCreationModal scope="editor" initialOptions={{ teams: { teamId: 'lumbini', opponentId: 'chitwan' } }} onOpen={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByLabelText('Opponent').querySelector('option[value="lumbini"]')).toBeNull();
        fireEvent.change(screen.getByLabelText('Featured team'), { target: { value: 'chitwan' } });
        expect(screen.getByLabelText('Opponent')).toHaveValue('lumbini');
    });
    it('shows one task at a time and hides technical controls', async () => {
        render(<PromptCreationModal scope="editor" initialKind="news" onOpen={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByRole('button', { name: '1-Click Copy Prompt' })).toBeDisabled();
        expect(screen.getByRole('button', { name: 'Next: Paste AI Output' })).toBeDisabled();
        expect(screen.queryByLabelText('AI response')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Generated creation prompt')).not.toBeInTheDocument();
        expect(screen.getByLabelText('Language')).not.toBeVisible();
        expect(screen.queryByRole('checkbox')).not.toBeInTheDocument();
        await responseStep();
        expect(clipboard.mock.calls[0][0]).toContain('JSON SCHEMA:');
        expect(screen.queryByLabelText('Your request')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Review post' })).toBeDisabled();
    });
    it('allows advancing to AI response step directly without copying the prompt', async () => {
        render(<PromptCreationModal scope="editor" initialOptions={{ template: 'matchday', teams: { teamId: 'lumbini', opponentId: 'sudurpaschim' } }} onOpen={vi.fn()} onClose={vi.fn()} />);
        expect(screen.getByRole('region', { name: 'Generated master prompt preview' })).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: 'Next: Paste AI Output' }));
        expect(await screen.findByLabelText('AI response')).toBeInTheDocument();
        expect(clipboard).not.toHaveBeenCalled();
    });
    it('renders master prompt preview and copies via card button', async () => {
        render(<PromptCreationModal scope="editor" initialOptions={{ template: 'matchday', teams: { teamId: 'lumbini', opponentId: 'sudurpaschim' } }} onOpen={vi.fn()} onClose={vi.fn()} />);
        const previewArea = screen.getByRole('region', { name: 'Generated master prompt preview' });
        expect(previewArea).toHaveTextContent('Return exactly 1 posts in this order: matchday');
        fireEvent.click(screen.getByRole('button', { name: 'Copy Master Prompt' }));
        await waitFor(() => expect(clipboard).toHaveBeenCalledOnce());
        expect(clipboard.mock.calls[0][0]).toContain('Return exactly 1 posts in this order: matchday');
    });
    it('reviews editable content before writing and persists corrections and sources', async () => {
        const open = vi.fn(); render(<PromptCreationModal scope="editor" initialKind="news" onOpen={open} onClose={vi.fn()} />);
        await preview(); expect(await listDrafts('editor')).toHaveLength(0);
        fireEvent.change(screen.getByLabelText('Headline'), { target: { value: 'Editor corrected headline' } });
        fireEvent.click(screen.getByText('1 source link'));
        expect(screen.getByRole('link', { name: 'https://example.com/report' })).toBeVisible();
        fireEvent.click(screen.getByRole('button', { name: 'Create post' }));
        await waitFor(() => expect(open).toHaveBeenCalledOnce());
        expect((await listDrafts('editor'))[0].design).toMatchObject({ headline: 'Editor corrected headline', sourceUrls: ['https://example.com/report'] });
    });
    it('retains pasted input on errors and clears stale results after setup changes', async () => {
        render(<PromptCreationModal scope="editor" initialKind="news" onOpen={vi.fn()} onClose={vi.fn()} />);
        await responseStep();
        fireEvent.change(screen.getByLabelText('AI response'), { target: { value: '{bad' } });
        fireEvent.click(screen.getByRole('button', { name: 'Review post' }));
        expect(screen.getByRole('alert')).toHaveTextContent('The response needs a correction');
        expect(screen.getByLabelText('AI response')).toHaveValue('{bad');
        fireEvent.click(screen.getByRole('button', { name: 'Back' }));
        fireEvent.change(screen.getByLabelText('Your request'), { target: { value: 'A different confirmed update' } });
        fireEvent.click(screen.getByRole('button', { name: 'Next: Paste AI Output' }));
        expect(await screen.findByLabelText('AI response')).toHaveValue('');
    });
    it('provides a manual copy fallback when clipboard access fails', async () => {
        clipboard.mockRejectedValueOnce(new Error('denied'));
        render(<PromptCreationModal scope="editor" initialKind="news" onOpen={vi.fn()} onClose={vi.fn()} />);
        fireEvent.change(screen.getByLabelText('Your request'), { target: { value: 'A confirmed update' } });
        fireEvent.click(screen.getByRole('button', { name: '1-Click Copy Prompt' }));
        expect(await screen.findByLabelText('Generated creation prompt')).toBeVisible();
        fireEvent.click(screen.getByRole('button', { name: 'I copied it' }));
        expect(screen.getByLabelText('AI response')).toBeVisible();
    });
    it('keeps a failed save reviewable and retries without duplicates', async () => {
        const open = vi.fn(); render(<PromptCreationModal scope="editor" initialKind="news" onOpen={open} onClose={vi.fn()} />);
        await preview(); storage.fail = true;
        fireEvent.click(screen.getByRole('button', { name: 'Create post' }));
        await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Storage full'));
        expect(open).not.toHaveBeenCalled(); expect(await listDrafts('editor')).toHaveLength(0);
        storage.fail = false; fireEvent.click(screen.getByRole('button', { name: 'Create post' }));
        await waitFor(() => expect(open).toHaveBeenCalledOnce()); expect(await listDrafts('editor')).toHaveLength(1);
    });
    it('asks only for missing fixture facts and saves the completed data', async () => {
        const open = vi.fn(); render(<PromptCreationModal scope="editor" onOpen={open} onClose={vi.fn()} />);
        await responseStep('A matchday post for Lumbini vs Sudurpaschim');
        const match = { teamId: 'lumbini', opponentId: 'sudurpaschim', competition: 'NPL', matchLabel: '', venue: 'Confirmed ground', matchDate: '', startTime: '13:00', oversLimit: 20, sourceUrl: '', updatedAt: '' };
        fireEvent.change(screen.getByLabelText('AI response'), { target: { value: JSON.stringify({ version: 1, title: 'Fixture', sources: [], match, posts: [{ template: 'matchday', headline: 'MATCHDAY', summary: '', data: {} }] }) } });
        fireEvent.click(screen.getByRole('button', { name: 'Review post' }));
        expect(screen.getByLabelText('Match date')).toBeVisible();
        expect(screen.queryByLabelText('Venue')).not.toBeInTheDocument();
        expect(screen.queryByLabelText('Team runs')).not.toBeInTheDocument();
        fireEvent.change(screen.getByLabelText('Match date'), { target: { value: '2026-10-26' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create post' }));
        await waitFor(() => expect(open).toHaveBeenCalledOnce());
        expect((await listDrafts('editor'))[0].design.cricket?.matchDate).toBe('2026-10-26');
    });
});
