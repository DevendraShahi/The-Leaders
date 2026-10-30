import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NplMatchSpotlight } from '@/components/npl/NplMatchSpotlight';
import { getNplTeamsData } from '@/lib/npl-data';
import { cricketFixtures as latestFixtures } from '@/lib/post-studio/cricket-fixtures';
// Historical checkpoint for selection behavior; independent of later published results.
const cricketFixtures = latestFixtures.map(row => row.matchNumber <= 3 ? row : {
    ...row, status: 'upcoming' as const, teamScore: undefined, opponentScore: undefined,
    result: undefined, resultNe: undefined, winnerId: undefined, playerOfTheMatch: undefined,
});
import { nplCompletedMatches, nplMatch1Scorecard } from '@/lib/npl-match-data';
vi.mock('next/image', () => ({ default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));
beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-28T08:15:00Z')); });
afterEach(() => { cleanup(); vi.useRealTimers(); });
const props = () => ({ teams: getNplTeamsData(), fixtures: cricketFixtures, scorecards: nplCompletedMatches, isNe: false, onScorecard: vi.fn(), onFixtures: vi.fn() });
describe('NPL hero match card', () => {
    it('defaults to today’s Match 4, with the correct pairing and scheduled time', () => {
        render(<NplMatchSpotlight {...props()} />);
        expect(screen.getByText('Match #04')).toBeInTheDocument();
        expect(screen.getByText('Pokhara Avengers')).toBeInTheDocument();
        expect(screen.getByText('Sudurpaschim Royals')).toBeInTheDocument();
        expect(screen.getByText('17:00 NPT')).toBeInTheDocument();
        expect(screen.getByTestId('npl-spotlight-status')).toHaveTextContent('Scheduled');
        expect(screen.queryByText("Yesterday's Result")).not.toBeInTheDocument();
    });
    it('shows scores and opens the matching result scorecard', () => {
        const values = { ...props(), fixtures: [cricketFixtures[0], cricketFixtures[3]] }; render(<NplMatchSpotlight {...values} />);
        fireEvent.click(screen.getByRole('button', { name: 'Latest result' }));
        expect(screen.getByText('Match #01')).toBeInTheDocument();
        expect(screen.getByTestId('npl-score-lumbini')).toHaveTextContent('88/3 (9.5 ov)');
        expect(screen.getByTestId('npl-score-sudurpaschim')).toHaveTextContent('87 (17.2 ov)');
        fireEvent.click(screen.getByRole('button', { name: 'View scorecard' }));
        expect(values.onScorecard).toHaveBeenCalledWith(nplMatch1Scorecard);
    });
    it('refreshes the Nepal-day label while the page stays open across midnight', () => {
        vi.setSystemTime(new Date('2026-10-27T18:14:30Z'));
        render(<NplMatchSpotlight {...props()} />);
        expect(screen.getByRole('button', { name: 'Next match' })).toHaveAttribute('aria-pressed', 'true');
        act(() => vi.advanceTimersByTime(60000));
        expect(screen.getByRole('button', { name: 'Today’s match' })).toHaveAttribute('aria-pressed', 'true');
    });
    it('reads updated result props and never opens Match 1 for a later fixture', () => {
        const values = props(); const later = { ...cricketFixtures[1], status: 'completed' as const, result: 'Updated Match 2 result', teamScore: '150/4', opponentScore: '140/8', playerOfTheMatch: 'Verified player' };
        render(<NplMatchSpotlight {...values} fixtures={[cricketFixtures[0], later, cricketFixtures[3]]} />);
        fireEvent.click(screen.getByRole('button', { name: 'Latest result' }));
        expect(screen.getByText('Match #02')).toBeInTheDocument(); expect(screen.getByText('Updated Match 2 result')).toBeInTheDocument();
        expect(screen.queryByRole('button', { name: 'View scorecard' })).not.toBeInTheDocument();
    });
    it('uses Nepali labels and team names', () => {
        render(<NplMatchSpotlight {...props()} isNe />);
        expect(screen.getByRole('button', { name: 'आजको खेल' })).toBeInTheDocument();
        expect(screen.getByText('पोखरा एभेन्जर्स')).toBeInTheDocument();
    });
});
