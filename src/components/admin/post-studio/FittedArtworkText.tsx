"use client";

import { useLayoutEffect, useRef, type CSSProperties } from 'react';

/** Fits the actual loaded font into a reserved slot. Never truncates or clips copy. */
export function FittedArtworkText({ text, max, min, lineHeight = 1.35, className, style, testId, fitGroup }: {
    text: string; max: number; min: number; lineHeight?: number; className?: string; style?: CSSProperties; testId?: string; fitGroup?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    useLayoutEffect(() => {
        const node = ref.current;
        if (!node) return;
        let active = true;
        const fit = () => {
            if (!active || !node.clientWidth || !node.clientHeight) return;
            let low = min, high = Math.max(min, max);
            const fits = (size: number) => {
                node.style.fontSize = `${size}px`;
                return node.scrollHeight <= node.clientHeight + 1 && node.scrollWidth <= node.clientWidth + 1;
            };
            if (!fits(high)) {
                for (let step = 0; step < 12; step++) {
                    const middle = (low + high) / 2;
                    if (fits(middle)) low = middle; else high = middle;
                }
                fits(Math.floor(low * 4) / 4);
            }
            node.dataset.fitSize = node.style.fontSize;
            if (fitGroup) {
                const peers = Array.from(node.closest('[data-managed-layout]')?.querySelectorAll<HTMLElement>('[data-fit-group]') ?? []).filter(peer => peer.dataset.fitGroup === fitGroup);
                const sizes = peers.map(peer => parseFloat(peer.dataset.fitSize ?? '')).filter(Number.isFinite);
                if (sizes.length === peers.length) peers.forEach(peer => { peer.style.fontSize = `${Math.min(...sizes)}px`; });
            }
            node.dataset.textReady = 'true';
        };
        node.dataset.textReady = 'false';
        fit();
        void document.fonts?.ready.then(fit);
        document.fonts?.addEventListener?.('loadingdone', fit);
        let frame = 0, lastWidth = -1, lastHeight = -1;
        const observer = new ResizeObserver(() => {
            if (lastWidth === node.clientWidth && lastHeight === node.clientHeight) return;
            lastWidth = node.clientWidth; lastHeight = node.clientHeight;
            node.dataset.textReady = 'false';
            cancelAnimationFrame(frame); frame = requestAnimationFrame(fit);
        });
        observer.observe(node);
        // Language/style classes can change letter spacing without resizing the slot.
        const context = node.closest('[data-managed-layout]');
        const scheduleFit = () => {
            node.dataset.textReady = 'false';
            cancelAnimationFrame(frame); frame = requestAnimationFrame(fit);
        };
        const contextObserver = new MutationObserver(scheduleFit);
        if (context) contextObserver.observe(context, { attributes: true, attributeFilter: ['data-language', 'data-format', 'class', 'style'] });
        context?.addEventListener('studio:refit', scheduleFit);
        return () => { active = false; observer.disconnect(); contextObserver.disconnect(); context?.removeEventListener('studio:refit', scheduleFit); cancelAnimationFrame(frame); document.fonts?.removeEventListener?.('loadingdone', fit); };
    }, [text, max, min, lineHeight, style?.fontFamily, style?.letterSpacing, fitGroup]);
    return <div ref={ref} className={className} data-export-fit data-matchday-slot data-fit-group={fitGroup} data-testid={testId} data-text-ready="false" style={{ ...style, fontSize: max, lineHeight, overflowWrap: style?.overflowWrap ?? 'anywhere' }}>{text}</div>;
}
