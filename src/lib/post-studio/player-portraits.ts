import { resolveNplPlayer, playerPhotoCredit, type NplPlayer } from './cricket-players';
import { bowlerCreditedTypes } from './moment-posts';
import type { PostDesign } from './types';
import type { NplTeamId } from './cricket-catalog';
import { reconcileEditedPlayerTeams } from './cricket-team-context';

export function playerPhotoSubject(design: PostDesign): { role: 'batter' | 'bowler'; name: string; teamId: NplTeamId } | null {
    const data = design.cricket;
    if (design.template !== 'cricket' || !data) return null;
    if (data.template === 'wicket') {
        const credited = data.wicketType && bowlerCreditedTypes.includes(data.wicketType);
        const role = credited && data.momentPhotoRole !== 'batter' ? 'bowler' : 'batter';
        return { role, name: data[role].name, teamId: role === 'bowler' ? data.opponentId : data.teamId };
    }
    if (['four', 'six', 'partnership', 'batting', 'fifty', 'century'].includes(data.template) || (data.template === 'player-of-match' && data.awardPerformance !== 'bowling')) return { role: 'batter', name: data.batter.name, teamId: data.teamId };
    if (['bowling', 'five-for', 'hat-trick', 'player-of-match'].includes(data.template)) return { role: 'bowler', name: data.bowler.name, teamId: data.teamId };
    return null;
}
export function matchingPlayerPhoto(design: PostDesign): NplPlayer | undefined {
    const subject = playerPhotoSubject(design);
    if (!subject?.name.trim()) return undefined;
    return matchingPortraitFor(subject.name, subject.teamId);
}
export function matchingPortraitFor(name: string, teamId: NplTeamId): NplPlayer | undefined {
    if (!name.trim()) return undefined;
    const player = resolveNplPlayer(name, teamId);
    return player?.photo?.url ? player : undefined;
}
/** Only unique full-name, alias or initial matches on the correct team are automatic. */
export function applyPlayerPortrait(design: PostDesign): PostDesign {
    const subject = playerPhotoSubject(design);
    if (!subject || design.cricket?.showPlayerPhoto === false || design.lockedLayers.includes('visual')) return design;
    if (design.imageUri && !design.playerPhotoId) return design;
    const match = matchingPlayerPhoto(design);
    if (!match?.photo?.url) return design.playerPhotoId ? { ...design, imageUri: null, imageCredit: '', playerPhotoId: undefined } : design;
    if (design.playerPhotoId === match.id && design.imageUri
        && (!design.imageUri.startsWith('/studio/cricket/players/') || design.imageUri === match.photo.url)) return design;
    return { ...design, imageUri: match.photo.url, imageCredit: playerPhotoCredit(match), playerPhotoId: match.id, imageFit: 'contain', imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0, imageTone: 'clear' };
}
export function portraitIsCurrent(design: PostDesign): boolean {
    if (!design.playerPhotoId) return true;
    const subject = playerPhotoSubject(design);
    return Boolean(subject && resolveNplPlayer(subject.name, subject.teamId)?.id === design.playerPhotoId);
}
export function selectPlayerPortrait(design: PostDesign, player: NplPlayer, uri = player.photo?.url): PostDesign {
    const subject = playerPhotoSubject(design);
    if (!subject || !uri || ![design.cricket!.teamId, design.cricket!.opponentId].includes(player.teamId) || design.lockedLayers.includes('visual')) return design;
    const data = design.cricket!;
    const next = reconcileEditedPlayerTeams(design, { ...design, cricket: { ...data, [subject.role]: { ...data[subject.role], name: player.name } } });
    const resolved = playerPhotoSubject(next);
    if (resolved?.teamId !== player.teamId) return design;
    return { ...next, imageUri: uri, imageCredit: playerPhotoCredit(player), playerPhotoId: player.id, imageFit: 'contain', imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0, imageTone: 'clear', cricket: { ...next.cricket!, showPlayerPhoto: true } };
}
