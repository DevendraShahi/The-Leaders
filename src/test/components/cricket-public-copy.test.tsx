import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CricketArtwork } from '@/components/admin/post-studio/CricketArtwork';
import { cricketTemplateIds } from '@/lib/post-studio/cricket-catalog';
import { studioTemplateExamples } from '@/lib/post-studio/template-examples';
const examples = studioTemplateExamples();
afterEach(cleanup);
describe('Audience-facing cricket copy', () => {
    it.each(cricketTemplateIds)('keeps workflow labels off the %s graphic in both languages', id => {
        for (const language of ['en', 'ne'] as const) {
            const design = structuredClone(examples.find(example => example.id === id)!.design);
            design.cricket!.language = language;
            render(<CricketArtwork design={design} />);
            const artwork = screen.getByTestId('post-artwork');
            expect(artwork.textContent).not.toMatch(/snapshot|confirmed phase|team moment|after the event|off the bat|pictured|पुष्टि भएको चरणको स्कोर|टोलीको क्षण|घटनापछिको स्कोर/i);
            expect(artwork).toHaveAttribute('data-export-error', '');
            cleanup();
        }
    });
    it('shows actual cricket information on Nepali powerplay posts', () => {
        const design = structuredClone(examples.find(example => example.id === 'powerplay')!.design);
        design.cricket!.language = 'ne';
        render(<CricketArtwork design={design} />);
        expect(screen.getByTestId('post-artwork')).toHaveTextContent('रन रेट');
        expect(screen.getByTestId('post-artwork')).toHaveTextContent('ओभर');
    });
});
