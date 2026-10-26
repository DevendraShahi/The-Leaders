"use client";

import { useState } from 'react';
import { Check, ExternalLink, ImagePlus, Search, Users } from 'lucide-react';
import { nplTeams, nplTeam, teamLogo, type NplTeamId } from '@/lib/post-studio/cricket-catalog';
import { findPlayers, nplPlayers, playerCatalogDate, playerRosterSource, type NplPlayer } from '@/lib/post-studio/cricket-players';
import styles from './CricketPlayerLibrary.module.css';

export default function CricketPlayerLibrary({ initialTeam, disabled, selectedPhoto, onSelect, onSearch }: {
    initialTeam: NplTeamId; disabled: boolean; selectedPhoto?: string;
    onSelect: (player: NplPlayer) => Promise<void>; onSearch: (name: string) => void;
}) {
    const [team, setTeam] = useState<NplTeamId | 'all'>(initialTeam);
    const [query, setQuery] = useState('');
    const [readyOnly, setReadyOnly] = useState(true);
    const [failed, setFailed] = useState<string[]>([]);
    const players = findPlayers(team, query, readyOnly);
    const readyCount = findPlayers(team).length;
    return <section className={styles.library} aria-label="Team player photos">
        <div className={styles.heading}><Users size={18} /><div><h3>Player photos</h3><p>Choose a team, then insert a player’s portrait.</p></div></div>
        <label className={styles.field}><span>Player team</span><select value={team} disabled={disabled} onChange={event => { setTeam(event.target.value as NplTeamId | 'all'); setQuery(''); }}>
            <option value="all">All eight teams</option>{nplTeams.map(item => <option key={item.id} value={item.id}>{item.name} ({findPlayers(item.id).length})</option>)}
        </select></label>
        <label className={styles.search}><Search size={16} /><input aria-label="Search players" value={query} placeholder="Search player name or role…" disabled={disabled} onChange={event => setQuery(event.target.value)} /></label>
        <div className={styles.meta}><span>{players.length} {readyOnly ? 'photos' : 'players'}</span><label><input type="checkbox" checked={readyOnly} disabled={disabled} onChange={event => setReadyOnly(event.target.checked)} />Photos ready</label></div>
        {!players.length && <p className={styles.empty}>No players match. Try another name, team, or turn off Photos ready to browse the full roster.</p>}
        <div className={styles.grid}>{players.map(player => {
            const available = Boolean(player.photo?.url) && !failed.includes(player.id);
            const selected = selectedPhoto === player.id;
            return <article className={styles.card} key={player.id}>
                <div className={styles.portrait} style={{ backgroundColor: nplTeam(player.teamId).dark }}>
                    <img className={styles.crest} src={teamLogo(player.teamId)} alt="" />
                    {available ? <img className={styles.player} src={player.photo!.thumbnailUrl} alt={player.name} loading="lazy" onError={() => setFailed(current => [...current, player.id])} /> : <span className={styles.initials}>{player.name.split(' ').map(part => part[0]).slice(0, 2).join('')}</span>}
                    <span className={styles.team}>{nplTeam(player.teamId).short}</span>
                </div>
                <div className={styles.details}><h4>{player.name}</h4><p>{player.role === 'Player' ? nplTeam(player.teamId).name : player.role}</p>
                    {available ? <button disabled={disabled} onClick={() => void onSelect(player)} aria-label={`Use photo of ${player.name}`}>{selected ? <Check size={14} /> : <ImagePlus size={14} />}{selected ? 'Inserted' : 'Use photo'}</button> : <button disabled={disabled} onClick={() => onSearch(player.name)} aria-label={`Find photo of ${player.name}`}><Search size={14} />Find photo</button>}
                    <a href={player.photo?.sourceUrl || player.profileUrl} target="_blank" rel="noopener noreferrer" title={player.photo ? `${player.photo.credit} · ${player.photo.license}` : 'Player profile'}><ExternalLink size={11} />{player.photo?.kind === 'commons' ? player.photo.license : player.photo ? 'Photo source' : 'Player profile'}</a>
                    {player.photo?.note && <p>{player.photo.note}</p>}
                </div>
            </article>;
        })}</div>
        <p className={styles.note}>{readyCount} portraits ready for {team === 'all' ? 'all teams' : nplTeam(team).name}. Some players do not yet have a bundled portrait; use Find photo in the full roster.</p>
        <details className={styles.credits}><summary>Sources & credits</summary><p>Team assignments checked {playerCatalogDate} against the <a href={playerRosterSource} target="_blank" rel="noopener noreferrer">league directory</a> ({nplPlayers.length} players). Photos can show earlier-season or national-team kits. Team photos retain their owners’ rights; individual source links show provenance. Commons photos retain their listed licenses and credits.</p><a href="/studio/cricket/players/catalog.json" target="_blank" rel="noopener noreferrer">Full photo credits</a></details>
    </section>;
}
