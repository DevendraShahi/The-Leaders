"use client";

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, X } from 'lucide-react';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog';
import { useLanguage } from '@/components/providers/language-provider';
import styles from './NplWelcomePopup.module.css';

export const NPL_PROMO_KEY = 'theleaders:npl-2026:welcome:v1';
const REAPPEAR_AFTER = 24 * 60 * 60 * 1000;
const CAMPAIGN_END = Date.parse('2026-11-22T00:00:00+05:45');
const SLIDE_INTERVAL = 3200; // ms per slide

const SLIDES = [
    {
        src: '/images/npl/campaign-himalayas.jpg',
        altEn: 'Cinematic floodlit cricket stadium against the snow-capped Himalayan mountains at twilight',
        altNe: 'साँझमा हिउँले ढाकिएको हिमालयको पृष्ठभूमिमा फ्लडलाइटमुनि क्रिकेट रङ्गशाला',
    },
    {
        src: '/images/npl/campaign-fans.jpg',
        altEn: 'Passionate Nepali cricket fans on the grass banks waving national flags under stadium floodlights',
        altNe: 'रङ्गशालाको फ्लडलाइटमुनि राष्ट्रिय झण्डा फहराउँदै नेपाली क्रिकेट समर्थकहरू',
    },
    {
        src: '/images/npl/campaign-action.jpg',
        altEn: 'Ultra-detailed macro close-up of a red leather cricket ball and wooden wickets under stadium floodlights',
        altNe: 'फ्लडलाइटमुनि रातो छालाको क्रिकेट बल र काठको विकेटको म्याक्रो दृश्य',
    },
    {
        src: '/images/npl/campaign-pitch.jpg',
        altEn: 'Atmospheric floodlit cricket pitch viewed from the boundary line under dusk sky',
        altNe: 'साँझको आकाशमुनि बाउन्ड्रीबाट हेरिएको फ्लडलाइटयुक्त क्रिकेट मैदान',
    },
] as const;

/** Homepage only. Keep the season cutoff and campaign key current when reusing. */
export function NplWelcomePopup() {
    const { language } = useLanguage();
    const isNe = language === 'ne';
    const [open, setOpen] = useState(false);
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);

    // Auto-advance slides
    const advance = useCallback(() => {
        setActive(i => (i + 1) % SLIDES.length);
    }, []);

    useEffect(() => {
        if (!open || paused) return;
        const id = window.setInterval(advance, SLIDE_INTERVAL);
        return () => window.clearInterval(id);
    }, [open, paused, advance]);

    // Campaign gate
    useEffect(() => {
        if (Date.now() >= CAMPAIGN_END) return;
        try {
            const stored = localStorage.getItem(NPL_PROMO_KEY);
            const seenAt = stored ? Number(stored) : 0;
            if (seenAt > 0 && Date.now() - seenAt < REAPPEAR_AFTER) return;
        } catch { /* Storage restrictions must not break the homepage. */ }
        const timer = window.setTimeout(() => {
            // Avoid competing with another open dialog, such as consent or sign-in.
            if (document.querySelector('[role="dialog"][data-state="open"], dialog[open]')) return;
            setOpen(true);
            try { localStorage.setItem(NPL_PROMO_KEY, String(Date.now())); } catch { /* Session still works without persistence. */ }
        }, 1400);
        return () => window.clearTimeout(timer);
    }, []);

    return <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className={styles.popup} overlayClassName={styles.overlay}>

            {/* ── Header bar ── */}
            <header className={styles.header}>
                <div className={styles.publisher}>
                    <Image src="/logo.svg" alt="The Leaders" width={36} height={36} />
                    <span>THE LEADERS<small>{isNe ? 'खेलकुद विशेष' : 'SPORTS DESK'}</small></span>
                </div>
                <div className={styles.league}>
                    <Image src="/studio/cricket/npl.png" alt="Nepal Premier League" width={88} height={44} />
                    <span>2026</span>
                </div>
                <DialogClose className={styles.close} aria-label={isNe ? 'बन्द गर्नुहोस्' : 'Close NPL introduction'}>
                    <X size={18} />
                </DialogClose>
            </header>

            {/* ── Hero carousel ── */}
            <div
                className={styles.visual}
                onMouseEnter={() => setPaused(true)}
                onMouseLeave={() => setPaused(false)}
            >
                {SLIDES.map((slide, i) => (
                    <div
                        key={slide.src}
                        className={`${styles.slide} ${i === active ? styles.slideActive : ''}`}
                        aria-hidden={i !== active}
                    >
                        <Image
                            src={slide.src}
                            alt={isNe ? slide.altNe : slide.altEn}
                            fill
                            sizes="(max-width: 760px) 94vw, 850px"
                            className={styles.artwork}
                            loading={i === 0 ? 'eager' : 'lazy'}
                            priority={i === 0}
                        />
                    </div>
                ))}

                <div className={styles.shade} />

                {/* Headline */}
                <div className={styles.headline}>
                    <span className={styles.eyebrow}>{isNe ? 'नेपाल प्रिमियर लिग · सिजन ३' : 'NEPAL PREMIER LEAGUE · SEASON 3'}</span>
                    <DialogTitle className={styles.title}>{isNe ? 'एनपीएल २०२६' : 'NPL 2026'}</DialogTitle>
                </div>

                {/* Dot indicators */}
                <div className={styles.dots} role="tablist" aria-label={isNe ? 'स्लाइड नेभिगेसन' : 'Slide navigation'}>
                    {SLIDES.map((_, i) => (
                        <button
                            key={i}
                            role="tab"
                            aria-selected={i === active}
                            aria-label={`Slide ${i + 1}`}
                            className={`${styles.dot} ${i === active ? styles.dotActive : ''}`}
                            onClick={() => { setActive(i); setPaused(true); }}
                        />
                    ))}
                </div>
            </div>

            {/* ── Details panel ── */}
            <div className={styles.details}>
                <div className={styles.copy}>
                    <span className={styles.sectionLabel}>{isNe ? 'द लिडर्स · क्रिकेट · ८ टोली' : 'THE LEADERS · CRICKET · 8 TEAMS'}</span>
                    <DialogDescription className={styles.description}>
                        {isNe ? 'खेल तालिका · नतिजा · अंक तालिका' : 'Fixtures · Results · Points table'}
                    </DialogDescription>
                </div>
                <div className={styles.actions}>
                    <Link href="/npl" className={styles.cta} onClick={() => setOpen(false)}>
                        {isNe ? 'एनपीएल हेर्नुहोस्' : 'View NPL'}
                        <ArrowUpRight size={21} />
                    </Link>
                    <DialogClose className={styles.continue}>
                        {isNe ? 'अहिले होइन' : 'Not now'}
                    </DialogClose>
                </div>
            </div>

        </DialogContent>
    </Dialog>;
}
