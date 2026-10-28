import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CricketArtwork } from '@/components/admin/post-studio/CricketArtwork';
import { cricketTemplateIds, nplTeams, teamLogo } from '@/lib/post-studio/cricket-catalog';
import { studioTemplateExamples } from '@/lib/post-studio/template-examples';
const examples = studioTemplateExamples();
const abbreviations = new RegExp(`\\b(?:${nplTeams.map(team => team.short).join('|')})\\b`);
afterEach(cleanup);
describe('Team abbreviations on public graphics', () => {
    it.each(cricketTemplateIds)('pairs every %s team abbreviation with its crest', id => {
        render(<CricketArtwork design={examples.find(example => example.id === id)!.design} />);
        const artwork = screen.getByTestId('post-artwork');
        const textNodes = [...artwork.querySelectorAll('[data-matchday-slot],b')].filter(node => !node.closest('[role=columnheader]') && abbreviations.test(node.textContent || ''));
        for (const node of textNodes) {
            const badge = node.closest('[data-team-badge]');
            expect(badge, node.textContent || id).not.toBeNull();
            expect(badge?.querySelector('img')).not.toBeNull();
        }
    });
    it('keeps standings logos tied to their own teams when match logos are customized', () => {
        const design = structuredClone(examples.find(example => example.id === 'points-table')!.design);
        design.cricket!.teamLogoUri = '/custom-featured.png';
        design.cricket!.opponentLogoUri = '/custom-opponent.png';
        render(<CricketArtwork design={design} />);
        for (const row of design.cricket!.standings) {
            const expected = row.teamId === design.cricket!.teamId ? '/custom-featured.png' : row.teamId === design.cricket!.opponentId ? '/custom-opponent.png' : teamLogo(row.teamId);
            expect(screen.getByTestId('post-artwork').querySelector(`[data-team-badge="${row.teamId}"] img`)).toHaveAttribute('src', expected);
        }
    });
    it('uses the opponent crest for a bowling performance score strip', () => {
        render(<CricketArtwork design={examples.find(example => example.id === 'player-of-match-bowling')!.design} />);
        const strip = screen.getByText('SR 179/8').closest('[data-team-badge]');
        expect(strip).toHaveAttribute('data-team-badge', 'sudurpaschim');
        expect(strip?.querySelector('img')).toHaveAttribute('alt', 'Sudurpaschim Royals');
    });
});
