import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PartnershipArtwork } from '@/components/admin/post-studio/PartnershipArtwork';
import { createCricketDraftDesign } from '@/lib/post-studio/cricket-design';
import type { PostDesign } from '@/lib/post-studio/types';

describe('PartnershipArtwork Component', () => {
    beforeEach(() => {
        vi.stubGlobal('ResizeObserver', class { observe() {} disconnect() {} });
        Object.defineProperty(document, 'fonts', { configurable: true, value: { ready: Promise.resolve() } });
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
    });

    function createSampleDesign(overrides: Partial<PostDesign> = {}): PostDesign {
        const d = createCricketDraftDesign('partnership', 'lumbini', 'sudurpaschim');
        Object.assign(d.cricket!, {
            matchDate: '2026-10-27',
            runs: 128,
            wickets: 3,
            overs: '14.2',
            partnershipRuns: 76,
            partnershipBalls: 48,
            sourceUrl: 'https://espncricinfo.com/series/npl-2026',
        });
        d.cricket!.batter.name = 'Rohit Paudel';
        d.cricket!.batter.runs = 42;
        d.cricket!.batter.balls = 26;
        d.cricket!.batter.fours = 4;
        d.cricket!.batter.sixes = 2;
        d.cricket!.batter.notOut = true;

        d.cricket!.secondBatter.name = 'Aakash Tripathi';
        d.cricket!.secondBatter.runs = 31;
        d.cricket!.secondBatter.balls = 22;
        d.cricket!.secondBatter.fours = 3;
        d.cricket!.secondBatter.sixes = 1;

        return { ...d, ...overrides };
    }

    it('renders the partnership stand hero and dual batter cards', () => {
        const design = createSampleDesign();
        render(<PartnershipArtwork design={design} />);

        const artwork = screen.getByTestId('post-artwork');
        expect(artwork).toBeInTheDocument();
        expect(artwork).toHaveAttribute('data-cricket-template', 'partnership');
        expect(artwork).toHaveAttribute('data-detailed', 'true');

        const stand = screen.getByTestId('partnership-shared-stat');
        expect(stand).toBeInTheDocument();
        expect(stand).toHaveTextContent('76');
        expect(stand).toHaveTextContent('RUN PARTNERSHIP');
        expect(stand).toHaveTextContent('48');

        expect(screen.getByText('Rohit Paudel')).toBeInTheDocument();
        expect(screen.getByText('Aakash Tripathi')).toBeInTheDocument();
        expect(screen.getByText('42*')).toBeInTheDocument();
        expect(screen.getByText('(26)')).toBeInTheDocument();
        expect(screen.getByText('31')).toBeInTheDocument();
        expect(screen.getByText('(22)')).toBeInTheDocument();
        expect(artwork.querySelectorAll('sup').length).toBeGreaterThan(0);
        expect(screen.getAllByText(/SR/).length).toBeGreaterThan(0);
    });

    it('renders cleanly in Nepali mode with translated labels and numerals', () => {
        const design = createSampleDesign();
        design.cricket!.language = 'ne';
        design.headline = 'साझेदारी';
        render(<PartnershipArtwork design={design} />);

        const artwork = screen.getByTestId('post-artwork');
        expect(artwork).toHaveAttribute('data-language', 'ne');
        expect(screen.getByTestId('artwork-headline')).toHaveTextContent('साझेदारी');
        expect(screen.getByText('रनको साझेदारी')).toBeInTheDocument();
    });

    it('supports editorial paper visual style', () => {
        const design = createSampleDesign({ cricketStyle: 'editorial' });
        render(<PartnershipArtwork design={design} />);

        const artwork = screen.getByTestId('post-artwork');
        expect(artwork.className).toContain('paper');
    });

    it('renders across all formats (square, story, landscape)', () => {
        for (const format of ['portrait', 'square', 'story', 'landscape'] as const) {
            const { unmount } = render(<PartnershipArtwork design={createSampleDesign({ format })} />);
            const artwork = screen.getByTestId('post-artwork');
            expect(artwork).toHaveAttribute('data-format', format);
            unmount();
        }
    });

    it('fires interactive layer selection on click and keyboard Enter', () => {
        const onSelect = vi.fn();
        const design = createSampleDesign();
        render(<PartnershipArtwork design={design} onSelect={onSelect} />);

        const headlineLayer = screen.getByLabelText('Select headline');
        fireEvent.click(headlineLayer);
        expect(onSelect).toHaveBeenCalledWith('headline');

        const visualLayer = screen.getByLabelText('Select visual');
        fireEvent.keyDown(visualLayer, { key: 'Enter' });
        expect(onSelect).toHaveBeenCalledWith('visual');
    });
});
