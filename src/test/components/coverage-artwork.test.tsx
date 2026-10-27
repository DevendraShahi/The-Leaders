import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CricketArtwork } from '@/components/admin/post-studio/CricketArtwork';
import { coverageIds } from '@/lib/post-studio/coverage-posts';
import { studioTemplateExamples } from '@/lib/post-studio/template-examples';
const examples = studioTemplateExamples();
afterEach(cleanup);
describe('Dedicated coverage artwork', () => {
    it.each(coverageIds)('routes %s through the new layout with valid data', id => {
        render(<CricketArtwork design={examples.find(example => example.id === id)!.design} />);
        const artwork = screen.getByTestId('post-artwork');
        expect(artwork).toHaveAttribute('data-managed-layout', 'true');
        expect(artwork).toHaveAttribute('data-export-error', '');
        expect(artwork).toHaveAttribute('data-coverage-family');
    });
    it('shows the opposition score on bowling awards', () => {
        render(<CricketArtwork design={examples.find(example => example.id === 'player-of-match-bowling')!.design} />);
        const score = screen.getByText('SR 179/8');
        expect(score.parentElement).toHaveTextContent('OPPOSITION INNINGS');
        expect(screen.getByText('Sher Malla')).toBeInTheDocument();
    });
    it('keeps target and innings total separate', () => {
        render(<CricketArtwork design={examples.find(example => example.id === 'target')!.design} />);
        expect(screen.getByText('LL 0/0')).toBeInTheDocument();
        expect(screen.getByText('RUNS TO WIN')).toBeInTheDocument();
        expect(screen.getByText('REQ. RATE')).toBeInTheDocument();
    });
    it('identifies scorecard innings ownership on both tables', () => {
        render(<CricketArtwork design={examples.find(example => example.id === 'scorecard')!.design} />);
        expect(screen.getByRole('region', { name: 'LL · BATTING' })).toBeInTheDocument();
        expect(screen.getByRole('region', { name: 'SR · BOWLING' })).toBeInTheDocument();
    });
});
