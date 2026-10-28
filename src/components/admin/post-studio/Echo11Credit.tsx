import { Echo11Branding } from './Echo11Branding';
import css from './Echo11Credit.module.css';

export const echo11FrameClass = css.frame;

export function Echo11Credit({ language = 'en', variant, seed }: { language?: 'en' | 'ne'; variant?: number; seed?: string }) {
    return <aside className={css.credit} data-testid="echo11-credit" aria-label="echo11 · Web development agency"><Echo11Branding language={language} variant={variant} seed={seed} /></aside>;
}
