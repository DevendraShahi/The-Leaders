import catalog from '../../../public/studio/cricket/players/catalog.json';
import type { NplTeamId } from './cricket-catalog';
import { bestPlayerNameMatches, playerNameKey, playerNameMatchScore } from './player-names';

export interface PlayerPhoto {
    originalUrl: string; sourceUrl: string; credit: string; license: string; licenseUrl?: string;
    kind: string; checkedAt: string; note?: string; url?: string; thumbnailUrl?: string; width?: number; height?: number;
}
export interface NplPlayer {
    id: string; name: string; teamId: NplTeamId; role: string; profileUrl: string; photo?: PlayerPhoto; aliases?: string[];
    rosterReview?: { sourceUrl: string; checkedAt: string; status: "listed" | "not-listed" };
}
export const playerCatalogDate = catalog.checkedAt;
export const playerRosterSource = catalog.rosterSource;
export const nplPlayers = catalog.players as NplPlayer[];
/** Rank against the whole roster before scoping, so a wrong-team exact name cannot fall back to someone else. */
export function resolveNplPlayer(name: string, teams?: NplTeamId | readonly NplTeamId[]): NplPlayer | undefined {
    const allowed = typeof teams === 'string' ? [teams] : teams;
    const matches = bestPlayerNameMatches(name, nplPlayers).filter(player => !allowed || allowed.includes(player.teamId));
    return matches.length === 1 ? matches[0] : undefined;
}
export function samePlayerName(left: string, right: string, teamId?: NplTeamId): boolean {
    if (playerNameKey(left) === playerNameKey(right)) return true;
    const player = resolveNplPlayer(left, teamId);
    return Boolean(player && player.id === resolveNplPlayer(right, teamId)?.id);
}
export function playerPhotoCredit(player: NplPlayer): string {
    if (!player.photo) return '';
    const photo = player.photo;
    return `Photo: ${player.name} — ${photo.credit}. ${photo.license}. Resized for Studio.\n${photo.sourceUrl}${photo.licenseUrl ? `\n${photo.licenseUrl}` : ''}`;
}
export function findPlayers(teamId: NplTeamId | 'all', query = '', readyOnly = true): NplPlayer[] {
    const term = query.trim().toLocaleLowerCase();
    return nplPlayers.filter(player => (teamId === 'all' || player.teamId === teamId)
        && (!readyOnly || Boolean(player.photo?.url))
        && (!term || `${player.name} ${player.role} ${(player.aliases ?? []).join(" ")}`.toLocaleLowerCase().includes(term) || playerNameMatchScore(query, player) > 0))
        .sort((a, b) => Number(Boolean(b.photo?.url)) - Number(Boolean(a.photo?.url)) || a.name.localeCompare(b.name));
}
