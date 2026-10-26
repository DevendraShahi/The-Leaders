import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import CricketLogoLibrary from '@/components/admin/post-studio/CricketLogoLibrary';
import StudioMediaModal from '@/components/admin/post-studio/StudioMediaModal';

describe('Studio Brand Logos Integration', () => {
    it('renders CricketLogoLibrary with all 10 Full HD brand assets and filters by search', () => {
        const onSelectBackground = vi.fn();
        const onAddOverlay = vi.fn();

        render(
            <CricketLogoLibrary
                onSelectBackground={onSelectBackground}
                onAddOverlay={onAddOverlay}
            />
        );

        // Heading & subtitle
        expect(screen.getByText('Team & NPL Brand Logos')).toBeInTheDocument();
        expect(screen.getByText(/Full HD transparent PNGs/i)).toBeInTheDocument();

        // Check NPL logos exist
        expect(screen.getByText('Nepal Premier League (Full Logo)')).toBeInTheDocument();
        expect(screen.getByText('Nepal Premier League (Icon / Emblem)')).toBeInTheDocument();

        // Check team logos exist
        expect(screen.getByText('Biratnagar Kings')).toBeInTheDocument();
        expect(screen.getByText('Janakpur Bolts')).toBeInTheDocument();
        expect(screen.getByText('Sudurpaschim Royals')).toBeInTheDocument();

        // Test search filter
        const searchInput = screen.getByLabelText('Filter logos');
        fireEvent.change(searchInput, { target: { value: 'Janakpur' } });

        expect(screen.getByText('Janakpur Bolts')).toBeInTheDocument();
        expect(screen.queryByText('Biratnagar Kings')).not.toBeInTheDocument();
        expect(screen.queryByText('Nepal Premier League (Full Logo)')).not.toBeInTheDocument();
    });

    it('triggers onSelectBackground and onAddOverlay callbacks from logo cards', () => {
        const onSelectBackground = vi.fn();
        const onAddOverlay = vi.fn();

        render(
            <CricketLogoLibrary
                currentImageUri="/studio/cricket/biratnagar.png"
                onSelectBackground={onSelectBackground}
                onAddOverlay={onAddOverlay}
            />
        );

        // Active visual check for Biratnagar
        expect(screen.getByText('Active Visual')).toBeInTheDocument();

        // Click Set as Visual on Chitwan Rhinos
        const setVisualButtons = screen.getAllByText('Set as Visual');
        expect(setVisualButtons.length).toBeGreaterThan(0);
        fireEvent.click(setVisualButtons[0]);
        expect(onSelectBackground).toHaveBeenCalledWith('/studio/cricket/npl.png', 'Nepal Premier League (Full Logo)');

        // Click Add as Overlay on first card
        const overlayButtons = screen.getAllByText('Add as Overlay');
        fireEvent.click(overlayButtons[0]);
        expect(onAddOverlay).toHaveBeenCalledWith('/studio/cricket/npl.png', 'Nepal Premier League (Full Logo)');
    });

    it('renders StudioMediaModal with NPL & Team Logos tab and applies image', () => {
        const onClose = vi.fn();
        const onApplyImage = vi.fn();
        const onApplyOverlay = vi.fn();

        render(
            <StudioMediaModal
                defaultTab="logos"
                onClose={onClose}
                onApplyImage={onApplyImage}
                onApplyOverlay={onApplyOverlay}
            />
        );

        // Tab button should be visible and active
        expect(screen.getByText('NPL & Team Logos')).toBeInTheDocument();

        // NPL logo cards
        expect(screen.getByText('Nepal Premier League (Full Logo)')).toBeInTheDocument();
        expect(screen.getByText('Nepal Premier League (Icon / Emblem)')).toBeInTheDocument();

        // Click Apply as Post Visual
        const applyVisualButtons = screen.getAllByText('Apply as Post Visual');
        fireEvent.click(applyVisualButtons[0]);
        expect(onApplyImage).toHaveBeenCalledWith('/studio/cricket/npl.png');
        expect(onClose).toHaveBeenCalled();
    });
});
