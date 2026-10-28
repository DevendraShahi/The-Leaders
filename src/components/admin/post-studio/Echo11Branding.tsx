"use client";

import { echo11Lines, echo11Variant } from '@/lib/post-studio/echo11-copy';
import { FittedArtworkText } from './FittedArtworkText';
import css from './Echo11Branding.module.css';

/** Agency branding for the reserved footer; no league sponsorship claim. */
export function Echo11Branding({ language = 'en', variant, seed }: { language?: 'en' | 'ne'; variant?: number; seed?: string }) {
    const nepali = language === 'ne';
    const selectedVariant = echo11Variant(variant, seed);
    const pair = echo11Lines[selectedVariant];
    const message = pair[language];
    return <div className={`${css.branding} ${nepali ? css.nepali : ''}`}>
        <div className={css.brand}>
            <span className={css.eyebrow}>{nepali ? 'वेब डेभलपमेन्ट एजेन्सी' : 'WEB DEVELOPMENT AGENCY'}</span>
            <div className={css.identity}><img src="/studio/echo11-logo.svg" alt="echo11 logo" /><strong>echo11</strong></div>
        </div>
        <div className={css.message}>
            <FittedArtworkText text={message} className={css.tagline} max={nepali ? 8.5 : 8} min={4} lineHeight={nepali ? 1.35 : 1.2} testId="echo11-tagline" style={{ fontFamily: nepali ? 'Hind_700Bold' : 'Onest_700Bold', overflowWrap: 'normal', wordBreak: 'normal', textWrap: 'balance' }} />
            <FittedArtworkText text={pair.subtext[language]} className={css.subtext} max={nepali ? 6.5 : 6} min={3.5} lineHeight={nepali ? 1.3 : 1.2} testId="echo11-subtext" style={{ fontFamily: nepali ? 'Hind_400Regular' : 'Onest_400Regular', overflowWrap: 'normal', wordBreak: 'normal', textWrap: 'balance' }} />
            <div className={css.contacts} data-export-fit>
                <a href="https://echo11.tech/" target="_blank" rel="noopener noreferrer" onPointerDown={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>echo11.tech <span aria-hidden="true">↗</span></a>
                <a href="mailto:echo11.labs@gmail.com" onPointerDown={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>echo11.labs@gmail.com</a>
            </div>
        </div>
        <a className={css.showcase} href="mailto:echo11.labs@gmail.com" aria-label={nepali ? 'वेबसाइटबारे echo11 सँग सम्पर्क गर्नुहोस्' : 'Contact echo11 about your website'} data-testid="echo11-ad-illustration" onPointerDown={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()} onClick={event => event.stopPropagation()}>
            <img className={css.websiteGraphic} src={`/studio/echo11/illustration-${selectedVariant}.svg`} alt="" />
        </a>
    </div>;
}
