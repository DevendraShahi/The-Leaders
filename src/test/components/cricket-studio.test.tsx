import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
const storage = vi.hoisted(() => ({ data: new Map<string, string>() }));
vi.mock('@/lib/post-studio/storage', () => ({ default: { getItem: async (key: string) => storage.data.get(key) ?? null, setItem: async (key: string, value: string) => { storage.data.set(key, value); } } }));
vi.mock('@/components/admin/post-studio/StudioMediaModal', () => ({ default: () => null }));
vi.mock('@/components/admin/post-studio/InstagramPreviewModal', () => ({ default: () => null }));
import CricketStudio from '@/components/admin/post-studio/CricketStudio';
import PostEditor from '@/components/admin/post-studio/PostEditor';
import { createCricketDesign } from '@/lib/post-studio/cricket-design';
import { createDraftCollection, listDrafts, readDraft } from '@/lib/post-studio/drafts';
beforeEach(() => {
    storage.data.clear(); vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
    Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
    Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value() { this.open = true; } });
    Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value() { this.open = false; } });
});
afterEach(() => { cleanup(); vi.unstubAllGlobals(); });
async function mountPack() {
    const four = createCricketDesign('four'), wicket = createCricketDesign('wicket'); wicket.cricket!.runs = 91;
    const [draft] = await createDraftCollection('cricket-test', [{ id: 'match-1', name: 'Cricket · 1/2', design: four }, { id: 'match-2', name: 'Cricket · 2/2', design: wicket }]);
    render(<PostEditor scope="cricket-test" draft={draft} onClose={vi.fn()} />);
    await waitFor(() => expect(screen.getByLabelText('Cricket template')).toBeEnabled());
}
async function save() {
    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Save changes' })).toHaveTextContent('Saved'));
}
describe('Cricket creation and editing', () => {
    it('creates both daily fixtures directly without a prompt or selecting one game', async () => {
        const open = vi.fn(); render(<CricketStudio scope="cricket-test" onBack={vi.fn()} onOpenDraft={open} />);
        fireEvent.change(screen.getByLabelText('Match date · Nepal time'), { target: { value: '2026-10-27' } });
        fireEvent.change(screen.getByLabelText('Post content type'), { target: { value: 'fixtures' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create fixtures post' }));
        await waitFor(() => expect(open).toHaveBeenCalledOnce());
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        const [draft] = await listDrafts('cricket-test');
        expect(draft.design.headline).toBe('FIXTURES');
        expect(draft.design.cricket?.fixtures.map(row => row.when)).toEqual(['2026-10-27 · 12:30 NPT', '2026-10-27 · 16:30 NPT']);
    });
    it('carries the visible post and team dropdown choices into guided creation', () => {
        render(<CricketStudio scope="cricket-test" onBack={vi.fn()} onOpenDraft={vi.fn()} />);
        fireEvent.change(screen.getByLabelText('Scheduled game'), { target: { value: 'custom' } });
        fireEvent.change(screen.getByLabelText('Post content type'), { target: { value: 'fifty' } });
        fireEvent.change(screen.getByRole('combobox', { name: 'Featured team' }), { target: { value: 'janakpur' } });
        fireEvent.change(screen.getByRole('combobox', { name: 'Opponent' }), { target: { value: 'chitwan' } });
        fireEvent.click(screen.getByRole('button', { name: 'New cricket post' }));
        const dialog = screen.getByRole('dialog');
        const selects = dialog.querySelectorAll('select');
        expect(selects[0]).toHaveValue('fifty');
        expect(selects[1]).toHaveValue('janakpur');
        expect(selects[2]).toHaveValue('chitwan');
        expect(dialog).toHaveTextContent('Additional information (optional)');
    });
    it('keeps both games on the same Nepal date separately selectable', () => {
        render(<CricketStudio scope="cricket-test" onBack={vi.fn()} onOpenDraft={vi.fn()} />);
        fireEvent.change(screen.getByLabelText('Match date · Nepal time'), { target: { value: '2026-10-27' } });
        expect(screen.getByRole('button', { name: 'New cricket post' })).toBeDisabled();
        const game = screen.getByLabelText('Scheduled game');
        expect(game).toHaveTextContent('Game 1 · 12:30 NPT · Biratnagar Kings vs Chitwan Rhinos');
        expect(game).toHaveTextContent('Game 2 · 16:30 NPT · Karnali Yaks vs Janakpur Bolts');
        fireEvent.change(game, { target: { value: 'npl-2026-league-2' } });
        expect(screen.getByRole('combobox', { name: 'Featured team' })).toHaveValue('biratnagar');
        fireEvent.change(game, { target: { value: 'npl-2026-league-3' } });
        expect(screen.getByRole('combobox', { name: 'Featured team' })).toHaveValue('karnali');
        expect(screen.getByRole('combobox', { name: 'Opponent' })).toHaveValue('janakpur');
        fireEvent.click(screen.getByRole('button', { name: 'New cricket post' }));
        expect(screen.getByRole('dialog')).toHaveTextContent('2026-10-27');
        expect(screen.getByRole('dialog')).toHaveTextContent('Match 3 · 16:30 NPT');
    });
    it('shows rest days and playoff slots without guessing qualifying teams', () => {
        render(<CricketStudio scope="cricket-test" onBack={vi.fn()} onOpenDraft={vi.fn()} />);
        fireEvent.change(screen.getByLabelText('Match date · Nepal time'), { target: { value: '2026-10-30' } });
        expect(screen.getByText('Rest day on your fixture sheet. No match is scheduled.')).toBeVisible();
        expect(screen.getByRole('button', { name: 'New cricket post' })).toBeDisabled();
        fireEvent.change(screen.getByLabelText('Match date · Nepal time'), { target: { value: '2026-11-19' } });
        expect(screen.getByLabelText('Scheduled game')).toHaveTextContent('Qualifier 2 · teams to confirm');
        expect(screen.getByRole('button', { name: 'New cricket post' })).toBeDisabled();
    });
    it('searches the kit and creates a selected Nepali template with the selected team', async () => {
        const open = vi.fn(); render(<CricketStudio scope="cricket-test" onBack={vi.fn()} onOpenDraft={open} />);
        fireEvent.click(screen.getByText('Browse templates manually'));
        fireEvent.change(screen.getByLabelText('Kit featured team'), { target: { value: 'chitwan' } });
        fireEvent.change(screen.getByLabelText('Kit language'), { target: { value: 'ne' } });
        fireEvent.change(screen.getByLabelText('Search cricket templates'), { target: { value: 'six' } });
        fireEvent.click(screen.getByRole('button', { name: 'Create Six' }));
        await waitFor(() => expect(open).toHaveBeenCalledOnce());
        expect((await listDrafts('cricket-test'))[0].design.cricket).toMatchObject({ template: 'six', teamId: 'chitwan', language: 'ne', sample: false, runs: null, batter: { name: '', runs: null } });
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    it('creates a coordinated ten-page match pack with persistent order', async () => {
        const open = vi.fn(); render(<CricketStudio scope="cricket-test" onBack={vi.fn()} onOpenDraft={open} />);
        fireEvent.click(screen.getByText('Browse templates manually'));
        fireEvent.click(screen.getByRole('button', { name: 'Create pack' }));
        await waitFor(() => expect(open).toHaveBeenCalledOnce());
        const drafts = await listDrafts('cricket-test');
        expect(drafts).toHaveLength(10); expect(new Set(drafts.map(item => item.carouselId)).size).toBe(1);
        expect(drafts.map(item => item.carouselOrder).sort((a, b) => a! - b!)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9]);
        expect(new Set(drafts.map(item => item.design.cricket?.template)).size).toBe(10);
    });
    it('keeps cricket score edits page-specific while optionally sharing teams and match styling', async () => {
        await mountPack();
        fireEvent.change(screen.getByLabelText('Team runs'), { target: { value: '142' } });
        fireEvent.change(screen.getByLabelText('Featured team'), { target: { value: 'chitwan' } });
        fireEvent.click(screen.getByRole('button', { name: 'Choose styles to share' }));
        fireEvent.click(screen.getByRole('checkbox', { name: /Cricket teams & match/ }));
        fireEvent.click(screen.getByRole('button', { name: 'Apply selected styles now' }));
        await save();
        expect((await readDraft('cricket-test', 'match-1')).design.cricket).toMatchObject({ runs: null, template: 'four', teamId: 'chitwan' });
        expect((await readDraft('cricket-test', 'match-2')).design.cricket).toMatchObject({ runs: null, template: 'wicket', teamId: 'chitwan' });
    });
    it('rejects invalid over notation without corrupting the saved innings', async () => {
        await mountPack();
        fireEvent.change(screen.getByLabelText('Overs bowled'), { target: { value: '14.6' } });
        expect(screen.getByText(/last digit must be 0–5/)).toBeVisible(); await save();
        expect((await readDraft('cricket-test', 'match-1')).design.cricket?.overs).toBe('14.2');
        fireEvent.change(screen.getByLabelText('Overs bowled'), { target: { value: '15.1' } }); await save();
        expect((await readDraft('cricket-test', 'match-1')).design.cricket?.overs).toBe('15.1');
    });
    it('cancels an in-flight logo upload when the editor switches pages', async () => {
        await mountPack();
        const complete: (() => void)[] = [];
        vi.stubGlobal('FileReader', class {
            result = 'data:image/png;base64,cancelled';
            onload: (() => void) | null = null;
            readAsDataURL() { complete.push(() => this.onload?.()); }
        });
        fireEvent.click(screen.getByText('Team logos', { exact: true }));
        fireEvent.change(screen.getByLabelText('Upload featured team logo'), { target: { files: [new File(['sample'], 'logo.png', { type: 'image/png' })] } });
        fireEvent.click(screen.getByRole('button', { name: 'Page 2: WICKET' }));
        await act(async () => { complete[0](); await Promise.resolve(); });
        await save();
        expect((await readDraft('cricket-test', 'match-1')).design.cricket?.teamLogoUri).toBeNull();
        expect((await readDraft('cricket-test', 'match-2')).design.cricket?.teamLogoUri).toBeNull();
    });

});
