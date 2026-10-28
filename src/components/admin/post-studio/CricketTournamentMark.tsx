import { nplTournamentLogo } from '@/lib/post-studio/cricket-catalog';
import css from './CricketTournamentMark.module.css';

export function CricketTournamentMark({ paper = false }: { paper?: boolean }) {
    return <figure className={css.mark} data-testid="cricket-tournament-mark"><img src={nplTournamentLogo} alt="Nepal Premier League" style={{ filter: paper ? 'none' : 'brightness(0) invert(1)' }} /><figcaption>NPL 2026 | Cricket</figcaption></figure>;
}
