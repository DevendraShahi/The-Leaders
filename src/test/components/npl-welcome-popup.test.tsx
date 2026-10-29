import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NplWelcomePopup, NPL_PROMO_KEY } from '@/components/home/NplWelcomePopup';
const locale = vi.hoisted(() => ({ language: 'en' }));
vi.mock('@/components/providers/language-provider', () => ({ useLanguage: () => locale }));
vi.mock('next/image', () => ({ default: ({ src, alt }: { src: string; alt: string }) => <img src={src} alt={alt} /> }));
beforeEach(() => { localStorage.clear(); locale.language = 'en'; vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-28T10:00:00Z')); });
afterEach(() => { cleanup(); vi.useRealTimers(); vi.restoreAllMocks(); });
const reveal = () => act(() => { vi.advanceTimersByTime(1500); });
describe('NPL homepage welcome popup', () => {
    it('opens after a delay and offers the NPL page with accessible title and description', () => {
        render(<NplWelcomePopup />);
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        reveal();
        expect(screen.getByRole('dialog')).toHaveAccessibleName('NPL 2026');
        expect(screen.getByRole('link', { name: 'View NPL' })).toHaveAttribute('href', '/npl');
        expect(localStorage.getItem(NPL_PROMO_KEY)).toBe(String(Date.now() - 100));
    });
    it('closes with the close control and stays dismissed on another homepage visit', () => {
        const view = render(<NplWelcomePopup />); reveal();
        fireEvent.click(screen.getByRole('button', { name: 'Close NPL introduction' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        view.unmount(); render(<NplWelcomePopup />); reveal();
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    it('shows again after 24 hours but stops after the season cutoff', () => {
        localStorage.setItem(NPL_PROMO_KEY, String(Date.now() - 25 * 60 * 60 * 1000));
        const view = render(<NplWelcomePopup />); reveal(); expect(screen.getByRole('dialog')).toBeInTheDocument();
        view.unmount(); localStorage.clear(); vi.setSystemTime(new Date('2026-11-22T00:00:00Z'));
        render(<NplWelcomePopup />); reveal(); expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    it('works when local storage is unavailable', () => {
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('blocked'); });
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('blocked'); });
        render(<NplWelcomePopup />); reveal(); expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
    it('provides Nepali copy and a continue-reading dismissal', () => {
        locale.language = 'ne'; render(<NplWelcomePopup />); reveal();
        expect(screen.getByRole('link', { name: 'एनपीएल हेर्नुहोस्' })).toHaveAttribute('href', '/npl');
        fireEvent.click(screen.getByRole('button', { name: 'अहिले होइन' }));
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    it('does not open over a competing dialog', () => {
        const other = document.createElement('dialog'); other.setAttribute('open', ''); document.body.appendChild(other);
        render(<NplWelcomePopup />); reveal();
        expect(screen.queryByRole('link', { name: 'View NPL' })).not.toBeInTheDocument();
        expect(localStorage.getItem(NPL_PROMO_KEY)).toBeNull(); other.remove();
    });
});


it('rotates while the pointer is over the hero, and resumes automatically after selecting a dot', () => {
    render(<NplWelcomePopup />); reveal();
    const slide = (number: number) => screen.getByRole('button', { name: `Slide ${number}` });
    expect(slide(1)).toHaveAttribute('aria-pressed', 'true');
    fireEvent.mouseEnter(screen.getByTestId('npl-promo-carousel'));
    act(() => vi.advanceTimersByTime(3200));
    expect(slide(2)).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(slide(3));
    expect(slide(3)).toHaveAttribute('aria-pressed', 'true');
    act(() => vi.advanceTimersByTime(3199));
    expect(slide(3)).toHaveAttribute('aria-pressed', 'true');
    act(() => vi.advanceTimersByTime(1));
    expect(slide(4)).toHaveAttribute('aria-pressed', 'true');
    act(() => vi.advanceTimersByTime(3200));
    expect(slide(1)).toHaveAttribute('aria-pressed', 'true');
});
it('pauses only through its explicit control and keeps manual navigation working while paused', () => {
    render(<NplWelcomePopup />); reveal();
    fireEvent.click(screen.getByRole('button', { name: 'Pause slideshow' }));
    act(() => vi.advanceTimersByTime(6400));
    expect(screen.getByRole('button', { name: 'Slide 1' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Slide 3' }));
    act(() => vi.advanceTimersByTime(3200));
    expect(screen.getByRole('button', { name: 'Slide 3' })).toHaveAttribute('aria-pressed', 'true');
    fireEvent.click(screen.getByRole('button', { name: 'Resume slideshow' }));
    act(() => vi.advanceTimersByTime(3200));
    expect(screen.getByRole('button', { name: 'Slide 4' })).toHaveAttribute('aria-pressed', 'true');
});
