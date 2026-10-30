import { useState } from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import CricketInspector from '@/components/admin/post-studio/CricketInspector';
import { MomentArtwork } from '@/components/admin/post-studio/MomentArtwork';
import { BroadcastCricketArtwork } from '@/components/admin/post-studio/BroadcastCricketArtwork';
import { createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import { applyPlayerPortrait } from '@/lib/post-studio/player-portraits';
import type { PostDesign } from '@/lib/post-studio/types';

afterEach(cleanup);
function Editor() {
    const [design, setDesign] = useState<PostDesign>(() => {
        const initial = createCricketDraftDesign('wicket', 'lumbini', 'sudurpaschim');
        initial.fixtureId = 'selected-fixture';
        Object.assign(initial.cricket!, { runs: 100, wickets: 2, overs: '12', wicketType: 'caught', dismissal: 'Caught', batter: { ...initial.cricket!.batter, name: 'Rohit Paudel' }, bowler: { ...initial.cricket!.bowler, name: 'Dipendra Singh Airee' } });
        return applyPlayerPortrait(initial);
    });
    return <><CricketInspector design={design} onChange={change => setDesign(current => applyPlayerPortrait(change(current)))} /><output data-testid="saved-context">{JSON.stringify({ team: design.cricket?.teamId, opponent: design.cricket?.opponentId, runs: design.cricket?.runs, fixture: design.fixtureId, portrait: design.playerPhotoId })}</output></>;
}
describe('Role-aware cricket editing', () => {
    it('shows an abbreviated second batter as the correct selected portrait', () => {
        const design = createCricketDraftDesign('partnership', 'sudurpaschim', 'lumbini');
        design.cricket!.batter.name = 'B. Bhandari';
        design.cricket!.secondBatter.name = 'D.S Airee';
        render(<CricketInspector design={applyPlayerPortrait(design)} onChange={() => {}} />);
        expect(screen.getByLabelText('Second batter photo')).toHaveValue('dipendra-singh-airee');
    });
    it('explains when an initial-only name matches multiple teammates', () => {
        const design = createCricketDraftDesign('batting', 'kathmandu', 'lumbini');
        design.cricket!.batter.name = 'S. Patel';
        render(<CricketInspector design={design} onChange={() => {}} />);
        fireEvent.click(screen.getByText('Player portrait', { exact: true }));
        expect(screen.getByText(/No unique portrait match/)).toHaveTextContent('S. Patel');
    });

    it('detects a dismissed-batter edit and shows the correct fielding team and portrait', () => {
        render(<Editor />);
        fireEvent.click(screen.getByText('Match event', { exact: true }));
        fireEvent.change(screen.getByLabelText('Dismissed batter'), { target: { value: 'Dipendra Singh Airee' } });
        expect(screen.getByLabelText('Featured team')).toHaveValue('sudurpaschim');
        expect(screen.getByLabelText('Opponent')).toHaveValue('lumbini');
        expect(screen.getByLabelText('Team runs')).toHaveValue(null);
        fireEvent.change(screen.getByLabelText('Credited bowler'), { target: { value: 'Rohit Paudel' } });
        expect(screen.getByTestId('saved-context')).toHaveTextContent('"portrait":"rohit-paudel"');
        expect(screen.getByTestId('saved-context')).toHaveTextContent('"fixture":"selected-fixture"');
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });
    it('offers both match teams in the portrait picker and resets facts on template changes', () => {
        render(<Editor />);
        fireEvent.click(screen.getByText('Player portrait', { exact: true }));
        const picker = screen.getByLabelText('Player photo');
        expect(picker.querySelector('option[value="rohit-paudel"]')).toBeInTheDocument();
        expect(picker.querySelector('option[value="dipendra-singh-airee"]')).toBeInTheDocument();
        fireEvent.change(picker, { target: { value: 'rohit-paudel' } });
        expect(screen.getByLabelText('Featured team')).toHaveValue('sudurpaschim');
        fireEvent.change(screen.getByLabelText('Cricket template'), { target: { value: 'six' } });
        fireEvent.click(screen.getByText('Match event', { exact: true }));
        expect(screen.getByLabelText('Boundary batter')).toHaveValue('');
        expect(screen.getByLabelText('Team runs')).toHaveValue(null);
        expect(screen.getByTestId('saved-context')).not.toHaveTextContent('rohit-paudel');
    });
    it('marks a cross-team wicket conflict on the export surface', () => {
        const design = createCricketDraftDesign('wicket', 'lumbini', 'sudurpaschim');
        Object.assign(design.cricket!, { wicketType: 'caught', batter: { ...design.cricket!.batter, name: 'Rohit Paudel' }, bowler: { ...design.cricket!.bowler, name: 'Rohit Paudel' } });
        render(<MomentArtwork design={design} />);
        expect(screen.getByTestId('post-artwork').getAttribute('data-export-error')).toContain('fielding side');
    });
    it('shows the opposition innings on bowling artwork, including bowling awards', () => {
        const design = createCricketDraftDesign('player-of-match', 'lumbini', 'sudurpaschim');
        Object.assign(design.cricket!, { awardPerformance: 'bowling', opponentRuns: 145, opponentWickets: 8, opponentOvers: '20', bowler: { ...design.cricket!.bowler, name: 'Rohit Paudel', runs: 20, wickets: 3 } });
        render(<BroadcastCricketArtwork design={design} />);
        expect(screen.getByText('145/8')).toBeInTheDocument();
        expect(screen.getByText('145/8').parentElement).toHaveTextContent('SR145/8');
    });
});
