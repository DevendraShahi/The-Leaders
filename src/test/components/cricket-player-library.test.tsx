import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import CricketPlayerLibrary from '@/components/admin/post-studio/CricketPlayerLibrary';
afterEach(cleanup);
describe('Team player photo library', () => {
    it('defaults to the draft team, searches, and inserts a named portrait', () => {
        const select = vi.fn(async () => {});
        render(<CricketPlayerLibrary initialTeam="lumbini" disabled={false} onSelect={select} onSearch={vi.fn()} />);
        expect(screen.getByRole('combobox', { name: 'Player team' })).toHaveValue('lumbini');
        fireEvent.change(screen.getByRole('textbox', { name: 'Search players' }), { target: { value: 'Rohit' } });
        expect(screen.getAllByRole('article')).toHaveLength(1);
        fireEvent.click(screen.getByRole('button', { name: 'Use photo of Rohit Paudel' }));
        expect(select).toHaveBeenCalledWith(expect.objectContaining({ id: 'rohit-paudel', teamId: 'lumbini' }));
    });
    it('switches teams and offers photo search if a portrait fails to load', () => {
        const search = vi.fn();
        render(<CricketPlayerLibrary initialTeam="lumbini" disabled={false} onSelect={vi.fn()} onSearch={search} />);
        fireEvent.change(screen.getByRole('textbox', { name: 'Search players' }), { target: { value: 'Rohit' } });
        fireEvent.change(screen.getByRole('combobox', { name: 'Player team' }), { target: { value: 'kathmandu' } });
        expect(screen.getByRole('textbox', { name: 'Search players' })).toHaveValue('');
        expect(screen.getByRole('button', { name: 'Use photo of Karan KC' })).toBeInTheDocument();
        expect(screen.getAllByText('Photo source').length).toBeGreaterThan(0);
        fireEvent.click(screen.getByRole('checkbox', { name: 'Photos ready' }));
        expect(screen.getByRole('button', { name: 'Use photo of Will Bosisto' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Use photo of Sam Heazlett' })).toBeInTheDocument();
        fireEvent.error(screen.getByRole('img', { name: 'Sam Heazlett' }));
        fireEvent.click(screen.getByRole('button', { name: 'Find photo of Sam Heazlett' })); expect(search).toHaveBeenCalledWith('Sam Heazlett');
    });
    it('disables insertion when locked and handles a failed thumbnail', () => {
        const p = { initialTeam: 'lumbini' as const, disabled: true, onSelect: vi.fn(), onSearch: vi.fn() };
        const view = render(<CricketPlayerLibrary {...p} />);
        expect(screen.getByRole('button', { name: 'Use photo of Rohit Paudel' })).toBeDisabled();
        view.rerender(<CricketPlayerLibrary {...p} disabled={false} />);
        fireEvent.error(screen.getByRole('img', { name: 'Rohit Paudel' }));
        expect(screen.getByRole('button', { name: 'Find photo of Rohit Paudel' })).toBeEnabled();
    });
});
