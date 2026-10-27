import type { PostDesign, PostTextLayer } from './types';
import { rebindCricketEvidence, redatePrematch } from './prematch-posts';
import { applyPlayerPortrait } from './player-portraits';
import { hasPostTeam, isOtherMatchSnapshot } from './cricket-team-context';

export const sharedStyleOptions = [
    { key: 'typography', label: 'Fonts & type sizes', description: 'Font, size, line spacing and shadow' },
    { key: 'alignment', label: 'Text alignment', description: 'Left or centered text' },
    { key: 'colors', label: 'Text & accent colors', description: 'Layer colors and artwork accent' },
    { key: 'background', label: 'Background & image', description: 'Same photo, crop, color or gradient, including effects' },
    { key: 'effects', label: 'Image effects only', description: 'Tone, blur, vintage and feathering; keeps each photo and crop' },
    { key: 'cricket', label: 'Cricket teams & match', description: 'Teams, logos, theme, language and match details; keeps each page’s scores' },
    { key: 'format', label: 'Canvas size', description: 'Square, portrait, story or landscape' },
] as const;
export type SharedStyle = typeof sharedStyleOptions[number]['key'];
const textLayers: PostTextLayer[] = ['kicker', 'headline', 'supporting', 'footer'];
const effectKeys = ['imageTone', 'imageBlur', 'imageVintage', 'imageFeather'] as const;
const backgroundKeys = ['imageUri', 'imageCredit', 'playerPhotoId', 'imageFit', 'imageZoom', 'imageOffsetX', 'imageOffsetY', 'backgroundColor', 'backgroundGradient', ...effectKeys] as const;
const changed = (a: unknown, b: unknown) => JSON.stringify(a) !== JSON.stringify(b);

/** Share visual settings only. Copy, template roles, visibility and locks stay page-specific.
 * With `previous`, propagate only the settings changed by this gesture.
 */
export function shareStyles(target: PostDesign, source: PostDesign, groups: readonly SharedStyle[], previous?: PostDesign): PostDesign {
    const next = structuredClone(target);
    const copy = <K extends keyof PostDesign>(key: K, force = false) => {
        if (force || !previous || changed(previous[key], source[key])) next[key] = structuredClone(source[key]);
    };
    if (groups.includes('format')) copy('format');
    if (groups.includes('alignment') && !textLayers.some(layer => target.lockedLayers.includes(layer))) copy('textAlign');
    if (groups.includes('colors')) copy('accent');
    for (const layer of textLayers) {
        if (target.lockedLayers.includes(layer)) continue;
        if (groups.includes('typography')) {
            const src = source.textTypography[layer];
            const prev = previous?.textTypography[layer];
            if (!prev || changed(prev.font, src.font)) next.textTypography[layer].font = src.font;
            if (!prev || changed(prev.size, src.size)) next.textTypography[layer].size = src.size;
            if (!prev || changed(prev.lineSpacing, src.lineSpacing)) next.textTypography[layer].lineSpacing = src.lineSpacing;
            if (!prev || changed(prev.shadow, src.shadow)) next.textTypography[layer].shadow = src.shadow;
            if (layer === 'headline') copy('headlineScale');
        }
        if (groups.includes('colors') && (!previous || changed(previous.textColors[layer], source.textColors[layer]))) next.textColors[layer] = source.textColors[layer];
    }
    if (!target.lockedLayers.includes('visual')) {
        if (groups.includes('background')) {
            // A replacement carries its full crop/effects so previews match on every page.
            const replacing = previous && (previous.imageUri !== source.imageUri || previous.backgroundColor !== source.backgroundColor || previous.backgroundGradient !== source.backgroundGradient);
            for (const key of backgroundKeys) {
                copy(key, Boolean(replacing));
            }
        } else if (groups.includes('effects')) for (const key of effectKeys) copy(key);
    }
    if (groups.includes('cricket') && source.cricket && next.cricket) {
        if (!target.lockedLayers.includes('visual')) copy('cricketStyle');
        const src = source.cricket, prev = previous?.cricket;
        const samePair = [src.teamId, src.opponentId].includes(next.cricket.teamId) && [src.teamId, src.opponentId].includes(next.cricket.opponentId);
        const preservePostSide = samePair && hasPostTeam(next.cricket.template);
        const keys = ['teamId', 'opponentId', 'competition', 'matchLabel', 'venue', 'matchDate', 'startTime', 'theme', 'language', 'teamLogoUri', 'opponentLogoUri'] as const;
        const copyContext = <K extends typeof keys[number]>(key: K) => {
            if (preservePostSide && (key === 'teamId' || key === 'opponentId')) return;
            if (preservePostSide && (key === 'teamLogoUri' || key === 'opponentLogoUri')) {
                if (target.lockedLayers.includes('visual')) return;
                const targetTeam = key === 'teamLogoUri' ? next.cricket!.teamId : next.cricket!.opponentId;
                const sourceKey = targetTeam === src.teamId ? 'teamLogoUri' : 'opponentLogoUri';
                if (!prev || changed(prev[sourceKey], src[sourceKey])) Object.assign(next.cricket!, { [key]: src[sourceKey] });
                return;
            }
            if (target.lockedLayers.includes('visual') && (key === 'teamLogoUri' || key === 'opponentLogoUri' || key === 'theme' || key === 'teamId' || key === 'opponentId')) return;
            if (!prev || changed(prev[key], src[key])) next.cricket![key] = src[key];
        };
        for (const key of keys) copyContext(key);
        if (!target.lockedLayers.includes('visual') && (!preservePostSide || next.cricket.teamId === src.teamId) && (!prev || prev.teamId !== src.teamId || prev.theme !== src.theme)) {
            copy('accent', true);
            if (!target.lockedLayers.includes('visual')) { copy('backgroundColor', true); copy('backgroundGradient', true); }
        }
        if (target.cricket && (target.cricket.teamId !== next.cricket.teamId || target.cricket.opponentId !== next.cricket.opponentId || target.cricket.matchDate !== next.cricket.matchDate)) {
            const rebound = redatePrematch(rebindCricketEvidence(target, next.cricket.teamId, next.cricket.opponentId), next.cricket.matchDate);
            next.cricket.headToHead = rebound.cricket!.headToHead;
            next.cricket.toss = rebound.cricket!.toss;
            next.cricket.lineup = rebound.cricket!.lineup;
            next.cricket.teamProfile = rebound.cricket!.teamProfile;
            if (isOtherMatchSnapshot(target.cricket.template)) {
                const reset = rebound.cricket!;
                Object.assign(next.cricket, { runs: reset.runs, wickets: reset.wickets, overs: reset.overs, target: reset.target,
                    opponentRuns: reset.opponentRuns, opponentWickets: reset.opponentWickets, opponentOvers: reset.opponentOvers,
                    batter: reset.batter, secondBatter: reset.secondBatter, bowler: reset.bowler, batting: reset.batting, bowling: reset.bowling,
                    result: reset.result, awardPerformance: reset.awardPerformance, updatedAt: reset.updatedAt });
                if (next.playerPhotoId) { next.imageUri = null; next.imageCredit = ''; next.playerPhotoId = undefined; }
            }
            if (target.cricket.template === 'score') {
                const reset = rebound.cricket!;
                next.cricket.scoreInnings = reset.scoreInnings; next.cricket.runs = reset.runs; next.cricket.wickets = reset.wickets; next.cricket.overs = reset.overs; next.cricket.target = reset.target;
                next.cricket.batter = reset.batter; next.cricket.secondBatter = reset.secondBatter; next.cricket.updatedAt = reset.updatedAt;
                next.cricket.opponentRuns = reset.opponentRuns; next.cricket.opponentWickets = reset.opponentWickets; next.cricket.opponentOvers = reset.opponentOvers;
            }
            next.cricket.sourceUrl = rebound.cricket!.sourceUrl;
            if (['powerplay', 'partnership'].includes(target.cricket.template)) {
                const reset = rebound.cricket!;
                Object.assign(next.cricket, { runs: reset.runs, wickets: reset.wickets, overs: reset.overs, powerplayOvers: reset.powerplayOvers, partnershipRuns: reset.partnershipRuns, partnershipBalls: reset.partnershipBalls, batter: reset.batter, secondBatter: reset.secondBatter, updatedAt: reset.updatedAt });
                next.imageUri = null; next.imageCredit = ''; next.playerPhotoId = undefined;
            }
            if (['four', 'six', 'wicket'].includes(target.cricket.template)) {
                const reset = rebound.cricket!;
                Object.assign(next.cricket, { runs: reset.runs, wickets: reset.wickets, overs: reset.overs, batter: reset.batter, bowler: reset.bowler, dismissal: reset.dismissal, wicketType: reset.wicketType, updatedAt: reset.updatedAt });
                next.imageUri = null; next.imageCredit = ''; next.playerPhotoId = undefined;
            }
            next.sourceUrls = rebound.sourceUrls; next.fixtureId = rebound.fixtureId;
        }
    }
    return applyPlayerPortrait(next);
}
