export interface NamedPlayer {
    id: string;
    name: string;
    aliases?: readonly string[];
}

/** Normalize scorecard punctuation without removing Nepali vowel marks. */
export function playerNameKey(name: string): string {
    return name.normalize('NFKD').replace(/[\u0300-\u036f]/g, '')
        .replace(/\((?:c|capt(?:ain)?|w\/?k)(?:\s*[/,&]\s*(?:c|w\/?k))?\)/gi, ' ')
        .replace(/['’`]/g, '').replace(/[^\p{L}\p{M}\p{N}]+/gu, ' ')
        .trim().toLowerCase().replace(/\s+/g, ' ');
}

function abbreviationMatches(query: string, fullName: string): boolean {
    const input = query.split(' '), full = fullName.split(' ');
    // A first name, surname or initials alone are too weak for automatic selection.
    if (input.length < 2 || full.length < 2 || input.at(-1) !== full.at(-1)) return false;
    let given = input.slice(0, -1);
    const names = full.slice(0, -1);
    // Scorecards also concatenate initials: "DS Airee".
    if (given.length === 1 && given[0].length > 1 && /^[a-z]+$/.test(given[0])
        && given[0] === names.map(part => part[0]).join('')) given = [...given[0]];
    const matches = (short: string, complete: string) => short === complete || (short.length === 1 && complete.startsWith(short));
    if (!matches(given[0], names[0])) return false;
    let cursor = 1;
    for (const part of given.slice(1)) {
        while (cursor < names.length && !matches(part, names[cursor])) cursor++;
        if (cursor === names.length) return false;
        cursor++;
    }
    return true;
}

export function playerNameMatchScore(query: string, player: NamedPlayer): number {
    const key = playerNameKey(query);
    if (!key) return 0;
    let score = 0;
    for (const name of [player.name, ...(player.aliases ?? [])]) {
        const candidate = playerNameKey(name);
        if (!candidate) continue;
        if (key === candidate || key.replaceAll(' ', '') === candidate.replaceAll(' ', '')) return 2;
        if (abbreviationMatches(key, candidate)) score = 1;
    }
    return score;
}

/** Keep ties visible: callers must disambiguate them using the post team or picker. */
export function bestPlayerNameMatches<T extends NamedPlayer>(query: string, players: readonly T[]): T[] {
    const ranked = players.map(player => ({ player, score: playerNameMatchScore(query, player) }));
    const best = Math.max(0, ...ranked.map(row => row.score));
    return best ? ranked.filter(row => row.score === best).map(row => row.player) : [];
}
