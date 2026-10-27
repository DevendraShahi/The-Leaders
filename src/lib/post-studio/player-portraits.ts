import { findPlayers, nplPlayers, playerPhotoCredit, type NplPlayer } from './cricket-players';
import { bowlerCreditedTypes } from './moment-posts';
import type { PostDesign } from './types';
import type { NplTeamId } from './cricket-catalog';

const identity = (name: string) => name.normalize('NFKC').trim().replace(/\s+/g, ' ').toLocaleLowerCase();
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
    const matches = findPlayers(teamId).filter(player => identity(player.name) === identity(name));
    return matches.length === 1 ? matches[0] : undefined;
}
/** Only exact name + team matches are automatic. A generic user-uploaded image is not replaced. */
export function applyPlayerPortrait(design: PostDesign): PostDesign {
    const subject = playerPhotoSubject(design);
    if (!subject || design.cricket?.showPlayerPhoto === false || design.lockedLayers.includes('visual')) return design;
    if (design.imageUri && !design.playerPhotoId) return design;
    const match = matchingPlayerPhoto(design);
    if (!match?.photo?.url) return design.playerPhotoId ? { ...design, imageUri: null, imageCredit: '', playerPhotoId: undefined } : design;
    if (design.playerPhotoId === match.id && design.imageUri) return design;
    return { ...design, imageUri: match.photo.url, imageCredit: playerPhotoCredit(match), playerPhotoId: match.id, imageFit: 'contain', imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0, imageTone: 'clear' };
}
export function portraitIsCurrent(design: PostDesign): boolean {
    if (!design.playerPhotoId) return true;
    const subject = playerPhotoSubject(design), player = nplPlayers.find(item => item.id === design.playerPhotoId);
    return Boolean(subject && player && player.teamId === subject.teamId && identity(player.name) === identity(subject.name));
}
export function selectPlayerPortrait(design: PostDesign, player: NplPlayer, uri = player.photo?.url): PostDesign {
    const subject = playerPhotoSubject(design);
    if (!subject || !uri || player.teamId !== subject.teamId || design.lockedLayers.includes('visual')) return design;
    const data = design.cricket!;
    return { ...design, imageUri: uri, imageCredit: playerPhotoCredit(player), playerPhotoId: player.id, imageFit: 'contain', imageZoom: 1, imageOffsetX: 0, imageOffsetY: 0, imageTone: 'clear', cricket: { ...data, showPlayerPhoto: true, [subject.role]: { ...data[subject.role], name: player.name } } };
}
