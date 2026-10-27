import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { MomentArtwork } from '@/components/admin/post-studio/MomentArtwork';
import { studioTemplateExamples } from '@/lib/post-studio/template-examples';
import { generateCreationPrompt } from '@/lib/post-studio/prompt-engine';

const example = studioTemplateExamples().find(item => item.id === 'wicket')!.design;
afterEach(cleanup);
describe('Wicket post content', () => {
    it.each([true, false])('keeps cricket facts without photo captions when portraits are %s', show => {
        const design = structuredClone(example); design.cricket!.showPlayerPhoto = show;
        render(<MomentArtwork design={design} />);
        const artwork = screen.getByTestId('post-artwork');
        expect(artwork).toHaveTextContent('OUT · Rohit Paudel · 68 (42)');
        expect(artwork).toHaveTextContent('Caught at cover');
        expect(artwork).toHaveTextContent('BOWLER · Dipendra Singh Airee');
        expect(artwork).toHaveTextContent('LL 128/3');
        expect(artwork.textContent).not.toMatch(/PICTURED|TEAM MOMENT|WICKET FALLS|AFTER THE EVENT/);
        expect(artwork).toHaveAttribute('data-export-error', '');
    });
    it('does not repeat a bowler already named in the dismissal', () => {
        const design = structuredClone(example); design.cricket!.dismissal = 'Caught at cover b Dipendra Singh Airee';
        render(<MomentArtwork design={design} />);
        expect(screen.getByTestId('post-artwork').textContent?.match(/Dipendra Singh Airee/g)).toHaveLength(1);
    });
    it('does not assign a credited bowler to a run-out', () => {
        const design = structuredClone(example);
        Object.assign(design.cricket!, { wicketType: 'run-out', dismissal: 'Run out at the non-striker’s end', momentPhotoRole: 'batter' });
        design.cricket!.bowler.name = '';
        design.imageUri = null; design.playerPhotoId = undefined;
        render(<MomentArtwork design={design} />);
        expect(screen.getByTestId('post-artwork')).toHaveTextContent('Run out at the non-striker’s end');
        expect(screen.getByTestId('post-artwork').textContent).not.toContain('BOWLER');
    });
    it('leaves unavailable batter figures out rather than inventing zeroes or placeholders', () => {
        const design = structuredClone(example); design.cricket!.batter.runs = null; design.cricket!.batter.balls = null;
        render(<MomentArtwork design={design} />);
        expect(screen.getByText('OUT · Rohit Paudel')).toBeInTheDocument();
        expect(screen.getByTestId('post-artwork').textContent).not.toContain('Batter to confirm');
    });
    it('keeps the same clean content in Nepali', () => {
        const design = structuredClone(example); design.cricket!.language = 'ne';
        render(<MomentArtwork design={design} />);
        expect(screen.getByTestId('post-artwork')).toHaveTextContent('आउट · Rohit Paudel · ६८ (४२)');
        expect(screen.getByTestId('post-artwork').textContent).not.toMatch(/तस्बिरमा|टोलीको क्षण|घटनापछिको स्कोर|विकेट पतन/);
    });
    it('blocks contradictory displayed batter figures before export', () => {
        const design = structuredClone(example); design.cricket!.batter.runs = 200;
        render(<MomentArtwork design={design} />);
        expect(screen.getByTestId('post-artwork').getAttribute('data-export-error')).toContain('cannot exceed the team total');
    });
    it('instructs AI responses to omit image-related copy from cricket content', () => {
        const prompt = generateCreationPrompt({ kind: 'cricket', templates: ['wicket'], language: 'en', format: 'portrait', brief: '', teams: { teamId: 'lumbini', opponentId: 'sudurpaschim' } });
        expect(prompt).toContain('without photo captions, image instructions, credits, slogans or placeholder text');
        expect(prompt).toContain('Keep summary empty by default.');
    });
});
