import catalog from '../../../public/studio/cricket/players/catalog.json';
import type { NplTeamId } from './cricket-catalog';

export interface PlayerPhoto {
    originalUrl: string; sourceUrl: string; credit: string; license: string; licenseUrl?: string;
    kind: string; checkedAt: string; note?: string; url?: string; thumbnailUrl?: string; width?: number; height?: number;
}
export interface NplPlayer {
    id: string; name: string; teamId: NplTeamId; role: string; profileUrl: string; photo?: PlayerPhoto;
}
export const playerCatalogDate = catalog.checkedAt;
export const playerRosterSource = catalog.rosterSource;
export const nplPlayers = catalog.players as NplPlayer[];
export function playerPhotoCredit(player: NplPlayer): string {
    if (!player.photo) return '';
    const photo = player.photo;
    return `Photo: ${player.name} — ${photo.credit}. ${photo.license}. Resized for Studio.\n${photo.sourceUrl}${photo.licenseUrl ? `\n${photo.licenseUrl}` : ''}`;
}
export function findPlayers(teamId: NplTeamId | 'all', query = '', readyOnly = true): NplPlayer[] {
    const term = query.trim().toLocaleLowerCase();
    return nplPlayers.filter(player => (teamId === 'all' || player.teamId === teamId)
        && (!readyOnly || Boolean(player.photo?.url))
        && (!term || `${player.name} ${player.role}`.toLocaleLowerCase().includes(term)))
        .sort((a, b) => Number(Boolean(b.photo?.url)) - Number(Boolean(a.photo?.url)) || a.name.localeCompare(b.name));
}
