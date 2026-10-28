import { Echo11Branding } from './Echo11Branding';
import css from './Echo11Promotion.module.css';

export function Echo11Promotion({ language = 'en', variant, seed }: { language?: 'en' | 'ne'; variant?: number; seed?: string }) {
    return <aside className={css.promotion} data-testid="echo11-promotion" aria-label="echo11 · Web development advertisement"><Echo11Branding language={language} variant={variant} seed={seed} /></aside>;
}
