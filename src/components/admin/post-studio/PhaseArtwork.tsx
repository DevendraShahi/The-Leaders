"use client";

import { forwardRef, type CSSProperties } from 'react';
import { nplTeam, nplTournamentLogo, teamLogo, teamName } from '@/lib/post-studio/cricket-catalog';
import { blankCricketData, cricketNumber, cricketScore, runRate } from '@/lib/post-studio/cricket-data';
import { phaseIssues } from '@/lib/post-studio/phase-posts';
import { matchingPortraitFor, portraitIsCurrent } from '@/lib/post-studio/player-portraits';
import { playerPhotoCredit } from '@/lib/post-studio/cricket-players';
import { matchdayBackgrounds } from '@/lib/post-studio/matchday';
import { postOutputDimensions, type PostLayer } from '@/lib/post-studio/types';
import { hasDevanagari } from '@/lib/post-studio/typography';
import { FittedArtworkText } from './FittedArtworkText';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import { ArtworkPhoto } from './ArtworkPhoto';
import type { CricketArtworkProps } from './CricketArtwork';
import base from './FixturesArtwork.module.css';
import s from './PhaseArtwork.module.css';

export const PhaseArtwork = forwardRef<HTMLDivElement, CricketArtworkProps>(({ design, onSelect, selected, guides, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
 const data = design.cricket ?? blankCricketData('powerplay'), pair = data.template === 'partnership', wide = design.format === 'landscape', paper = design.cricketStyle === 'editorial';
 const [w,h] = postOutputDimensions[design.format], height = 360*h/w;
 const t = (en: string, ne: string) => data.language === 'ne' ? ne : en;
 const n = (value: string | number | null) => cricketNumber(value, data.language);
 const text = (value: string, className: string, max: number, min: number, group?: string) => <FittedArtworkText text={value} className={className} max={max} min={min} fitGroup={group} lineHeight={hasDevanagari(value) ? 1.65 : 1.3} style={{ fontFamily: hasDevanagari(value) ? 'Hind_700Bold' : 'Onest_700Bold' }} />;
 const select = (layer: PostLayer) => onSelect && !design.lockedLayers.includes(layer) ? { role:'button', tabIndex:0, 'aria-label':`Select ${layer}`, 'data-selected':selected === layer || undefined, onClick:()=>onSelect(layer), onKeyDown:(event:React.KeyboardEvent)=>{if(['Enter',' '].includes(event.key)){event.preventDefault();onSelect(layer);}} } : {};
 const background = matchdayBackgrounds.find(item=>item.id === data.matchdayBackground) ?? matchdayBackgrounds[wide?0:4];
 const portraitsVisible = pair && data.showPlayerPhoto !== false && !design.hiddenLayers.includes('visual');
 const firstPhoto = portraitsVisible && portraitIsCurrent(design) ? design.imageUri : null;
 const backgroundPhoto = !pair && design.imageUri && !design.hiddenLayers.includes('visual');
 const secondPlayer = portraitsVisible ? matchingPortraitFor(data.secondBatter.name,data.teamId) : undefined;
 const credits = [firstPhoto || backgroundPhoto ? design.imageCredit : '',secondPlayer ? playerPhotoCredit(secondPlayer) : '',...(design.placedImages??[]).filter(item=>!item.hidden).map(item=>item.credit)].filter(Boolean).join(' · ');
 const source = data.sourceUrl || design.sourceUrls?.[0] || ''; let host='';try{host=source?new URL(source).hostname.replace(/^www\./,''):'';}catch{/* Preflight requests provenance. */}
 const issues = [...phaseIssues(design),...(portraitsVisible && design.imageUri && !portraitIsCurrent(design) ? ['Choose a portrait matching the first batter.'] : [])];
 return <div ref={ref} className={`${base.artwork} ${s.artwork} ${paper?base.paper:''}`} style={{width:360,height,'--accent':design.accent} as CSSProperties} data-testid="post-artwork" data-cricket-template={data.template} data-format={design.format} data-language={data.language} data-pair={pair} data-managed-layout="true" data-export-error={issues.join(' ')}>
  <img className={base.background} src={paper?'/studio/cricket/backgrounds/paper-001.jpg':background.src} alt="" />
  {backgroundPhoto && <div className={base.photo}><ArtworkPhoto design={design} height={height}/></div>}
  <div className={base.overlays}>{(['back','middle','front'] as const).map(layer=><ArtworkPlacedImages key={layer} layerFilter={layer} images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)} />)}</div><div className={base.scrim}/>
  <div className={s.content}>
   <header className={base.header}><div className={base.brand}><img src="/studio/leaders.png" alt="The Leaders"/><span>THE LEADERS<small>{t('SPORTS DESK','खेलकुद डेस्क')}</small></span></div><img className={base.npl} src={nplTournamentLogo} alt="Nepal Premier League"/></header>
   <div className={s.title} {...select('headline')}>{text([data.matchLabel,data.matchDate].filter(Boolean).join(' · '),s.matchLabel,wide?5:6,4)}{!design.hiddenLayers.includes('headline')&&text(design.headline,s.headline,wide?22:30,wide?10:15)}</div>
   <div className={s.identities}>{[data.teamId,data.opponentId].map((id,index)=><div key={id} className={s.team}><img src={(index===0?data.teamLogoUri:data.opponentLogoUri)||teamLogo(id)} alt=""/>{text(teamName(nplTeam(id),data.language),s.teamName,wide?8:11,wide?5:7,'phase-teams')}</div>)}</div>
   <main className={s.heroBlock}>{text(n(pair?data.partnershipRuns:cricketScore(data.runs,data.wickets)),s.hero,wide?55:90,wide?16:20)}{text(pair?`${n(data.partnershipBalls)} ${t('BALLS · PARTNERSHIP','बल · साझेदारी')}`:`${n(data.powerplayOvers||'—')} ${t('OVERS · POWERPLAY','ओभर · पावरप्ले')}`,s.heroMeta,wide?7:10,wide?5:6)}</main>
   <div className={s.feature} {...select('visual')}>{pair?[data.batter,data.secondBatter].map((batter,index)=>{const uri=index===0?firstPhoto:secondPlayer?.photo?.url;return <div className={s.player} key={index}><div className={s.portrait}><img data-testid={uri?`partnership-photo-${index}`:undefined} src={uri||teamLogo(data.teamId)} alt={uri?batter.name:nplTeam(data.teamId).name} style={index===0&&uri?{objectFit:design.imageFit,transform:`translate(${design.imageOffsetX}px,${design.imageOffsetY}px) scale(${design.imageZoom})`}:undefined}/></div>{text(batter.name||t('Batter to confirm','ब्याटर पुष्टि हुन बाँकी'),s.playerName,wide?9:14,wide?5:8,'partnership-names')}</div>;}):<div className={s.phaseNote}>{text(t('AT THE END OF THE POWERPLAY','पावरप्लेको अन्त्यमा'),s.note,wide?13:23,wide?7:12)}{text(`${t('RUN RATE','रन रेट')} · ${n(runRate(data.runs,data.overs))}`,s.rate,wide?12:20,wide?7:11)}</div>}</div>
   <div className={s.snapshot}>{text(pair?`${nplTeam(data.teamId).short} ${n(cricketScore(data.runs,data.wickets))} · ${n(data.overs)} ${t('OVERS','ओभर')}`:t('CONFIRMED PHASE SNAPSHOT','पुष्टि भएको चरणको स्कोर'),s.snapshotMain,wide?9:15,wide?4.5:7)}{text(pair?t('TEAM SCORE AT THIS MOMENT','यस क्षणमा टोलीको स्कोर'):t('BATTING TEAM SCORE','ब्याटिङ टोलीको स्कोर'),s.snapshotMeta,wide?4.5:6,wide?3.5:4.5)}</div>
   <div className={s.source}>{text(host?`${t('SOURCE','स्रोत')} · ${host}`:t('SOURCE TO CONFIRM','स्रोत पुष्टि हुन बाँकी'),s.fill,wide?4.5:6,wide?3.5:4)}</div>
   <div className={s.summary} {...select('supporting')}>{!design.hiddenLayers.includes('supporting')&&text(design.summary,s.fill,wide?5:7,wide?3.5:4.5)}</div>
   <div className={s.credit}>{credits&&text(credits,s.fill,wide?3.5:4.5,wide?2.5:2.8)}</div>
   <footer className={base.footer} {...select('footer')}>{text(design.hiddenLayers.includes('footer')?'':design.author,base.author,wide?4.5:6,3.5)}{text('NPL 2026 | Cricket',base.footerLabel,wide?4.5:6,3.5)}</footer>
  </div>{guides&&<div className={base.guides} aria-hidden="true"/>}
 </div>;
});
PhaseArtwork.displayName='PhaseArtwork';
