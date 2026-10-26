import type { PostDesign, PostTextLayer } from './types';

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
const backgroundKeys = ['imageUri', 'imageCredit', 'imageFit', 'imageZoom', 'imageOffsetX', 'imageOffsetY', 'backgroundColor', 'backgroundGradient', ...effectKeys] as const;
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
        const src = source.cricket, prev = previous?.cricket;
        const keys = ['teamId', 'opponentId', 'competition', 'matchLabel', 'venue', 'matchDate', 'startTime', 'theme', 'language', 'teamLogoUri', 'opponentLogoUri'] as const;
        const copyContext = <K extends typeof keys[number]>(key: K) => {
            if (target.lockedLayers.includes('visual') && (key === 'teamLogoUri' || key === 'opponentLogoUri' || key === 'theme' || key === 'teamId' || key === 'opponentId')) return;
            if (!prev || changed(prev[key], src[key])) next.cricket![key] = src[key];
        };
        for (const key of keys) copyContext(key);
        if (!target.lockedLayers.includes('visual') && (!prev || prev.teamId !== src.teamId || prev.theme !== src.theme)) {
            copy('accent', true);
            if (!target.lockedLayers.includes('visual')) { copy('backgroundColor', true); copy('backgroundGradient', true); }
        }
    }
    return next;
}
