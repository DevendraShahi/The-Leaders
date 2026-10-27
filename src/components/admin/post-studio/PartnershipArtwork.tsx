"use client";

import { forwardRef, type CSSProperties } from 'react';
import { nplTeam, nplTournamentLogo, teamLogo, teamName } from '@/lib/post-studio/cricket-catalog';
import { blankCricketData, cricketNumber, cricketScore, strikeRate } from '@/lib/post-studio/cricket-data';
import { phaseIssues } from '@/lib/post-studio/phase-posts';
import { matchingPortraitFor, portraitIsCurrent } from '@/lib/post-studio/player-portraits';
import { matchdayBackgrounds } from '@/lib/post-studio/matchday';
import { postOutputDimensions, type PostLayer } from '@/lib/post-studio/types';
import { hasDevanagari } from '@/lib/post-studio/typography';
import { FittedArtworkText } from './FittedArtworkText';
import { ArtworkPlacedImages } from './ArtworkPlacedImages';
import type { CricketArtworkProps } from './CricketArtwork';
import base from './FixturesArtwork.module.css';
import s from './PartnershipArtwork.module.css';

export const PartnershipArtwork = forwardRef<HTMLDivElement, CricketArtworkProps>(({ design, onSelect, selected, guides, selectedPlacedImageId, onSelectPlacedImage }, ref) => {
 const data = design.cricket ?? blankCricketData('partnership'), wide = design.format === 'landscape', paper = design.cricketStyle === 'editorial';
 const [w,h] = postOutputDimensions[design.format], height = 360*h/w;
 const t = (en:string,ne:string) => data.language === 'ne' ? ne : en;
 const n = (value:string|number|null) => cricketNumber(value,data.language);
 const text = (value:string,className:string,max:number,min:number,group?:string) => <FittedArtworkText text={value} className={className} max={max} min={min} fitGroup={group} lineHeight={/^[0-9०-९/—]+$/.test(value)?1.2:hasDevanagari(value)?1.65:1.2} style={{fontFamily:hasDevanagari(value)?'Hind_700Bold':'Onest_700Bold'}}/>;
 const select = (layer:PostLayer) => onSelect&&!design.lockedLayers.includes(layer)?{role:'button',tabIndex:0,'aria-label':`Select ${layer}`,'data-selected':selected===layer||undefined,onClick:()=>onSelect(layer),onKeyDown:(event:React.KeyboardEvent)=>{if(['Enter',' '].includes(event.key)){event.preventDefault();onSelect(layer);}}}:{};
 const visible = data.showPlayerPhoto!==false&&!design.hiddenLayers.includes('visual');
 const current = portraitIsCurrent(design), primary = matchingPortraitFor(data.batter.name,data.teamId), secondary = matchingPortraitFor(data.secondBatter.name,data.teamId);
 const photos = [visible&&current?design.imageUri:null,visible?secondary?.photo?.url:null];
 const owners = [...new Set([photos[0]?(design.playerPhotoId?primary?.photo?.credit:design.imageCredit):'',photos[1]?secondary?.photo?.credit:'',...(design.placedImages??[]).filter(item=>!item.hidden).map(item=>item.credit)].filter(Boolean))];
 const credit = owners.length?`${t('PHOTOS','तस्बिर')} · ${owners.join(' / ')}`:'';
 const background = matchdayBackgrounds.find(item=>item.id===data.matchdayBackground)??matchdayBackgrounds[wide?0:4];
 const source = data.sourceUrl||design.sourceUrls?.[0]||'';let host='';try{host=source?new URL(source).hostname.replace(/^www\./,''):'';}catch{/* Missing provenance is handled by preflight. */}
 const issues = [...phaseIssues(design),...(visible&&design.imageUri&&!current?['Choose a portrait matching the first batter.']:[])];
 const detailed = [data.batter,data.secondBatter].some(batter=>batter.runs!==null||batter.balls!==null);
 const partnershipRate = data.partnershipRuns!==null&&data.partnershipBalls!==null&&data.partnershipBalls>0?(data.partnershipRuns*6/data.partnershipBalls).toFixed(2):'—';
 return <div ref={ref} className={`${base.artwork} ${s.artwork} ${paper?base.paper:''}`} style={{width:360,height,'--accent':design.accent} as CSSProperties} data-testid="post-artwork" data-cricket-template="partnership" data-format={design.format} data-language={data.language} data-detailed={detailed} data-managed-layout="true" data-export-error={issues.join(' ')}>
  <img className={base.background} src={paper?'/studio/cricket/backgrounds/paper-001.jpg':background.src} alt=""/>
  <div className={base.overlays}>{(['back','middle','front'] as const).map(layer=><ArtworkPlacedImages key={layer} layerFilter={layer} images={design.placedImages} canvasWidth={360} canvasHeight={height} selectedId={selectedPlacedImageId} onSelectImage={onSelectPlacedImage} isInteractive={Boolean(onSelectPlacedImage)}/>)}</div><div className={base.scrim}/><div className={s.shade}/>
  <div className={s.content}>
   <header className={base.header}><div className={base.brand}><img src="/studio/leaders.png" alt="The Leaders"/><span>THE LEADERS<small>{t('SPORTS DESK','खेलकुद डेस्क')}</small></span></div><img className={base.npl} src={nplTournamentLogo} alt="Nepal Premier League"/></header>
   <div className={s.context}>{text(`${teamName(nplTeam(data.teamId),data.language)} vs ${teamName(nplTeam(data.opponentId),data.language)}`,s.fill,wide?6:8,wide?4:5)}{text(`${t('OVER','ओभर')} ${n(data.overs)}`,s.contextOvers,wide?6:8,wide?4:5)}</div>
   <div className={s.title} {...select('headline')}>{!design.hiddenLayers.includes('headline')&&text(design.headline,s.fill,wide?30:42,wide?13:18)}{text(t('RUNS','रन'),s.titleRuns,wide?17:24,wide?7:8)}</div>
   <main className={s.arena}>
    <div className={s.players} {...select('visual')}>{[data.batter,data.secondBatter].map((batter,index)=><div className={s.portrait} key={index}><img data-testid={photos[index]?`partnership-photo-${index}`:undefined} src={photos[index]||teamLogo(data.teamId)} alt={photos[index]?batter.name:nplTeam(data.teamId).name} style={index===0&&photos[index]?{objectFit:design.imageFit,transform:`translate(${design.imageOffsetX}px,${design.imageOffsetY}px) scale(${design.imageZoom})`}:undefined}/></div>)}</div>
    <div className={s.stand} role="group" aria-label={t('Shared partnership figures for both batters','दुवै ब्याटरको संयुक्त साझेदारी')} data-testid="partnership-shared-stat">{text(n(data.partnershipRuns),s.sharedStat,wide?86:124,wide?30:45)}{text(t('RUN PARTNERSHIP','रनको साझेदारी'),s.standLabel,wide?7:10,wide?4:6)}</div>
   </main>
   <div className={s.cards}>{[data.batter,data.secondBatter].map((batter,index)=><div className={s.card} key={index}>{text(batter.name||t('Batter to confirm','ब्याटर पुष्टि हुन बाँकी'),s.playerName,wide?9:13,wide?5:7,'partnership-names')}{detailed&&<><div className={s.innings}>{batter.runs!==null&&batter.balls!==null&&text(`${n(batter.runs)}${batter.notOut?'*':''} (${n(batter.balls)})`,s.fill,wide?22:32,wide?10:14,'partnership-innings')}</div>{text([batter.fours!==null?`${n(batter.fours)} × 4`:'',batter.sixes!==null?`${n(batter.sixes)} × 6`:'',batter.runs!==null&&batter.balls!==null&&batter.balls>0?`SR ${n(strikeRate(batter.runs,batter.balls))}`:''].filter(Boolean).join(' · '),s.batterMeta,wide?5:7,wide?3.5:4.5)}</>}</div>)}</div>
   <div className={s.standStrip}>{text(`${t('OFF','कुल')} ${n(data.partnershipBalls)} ${t('BALLS','बल')}`,s.fill,wide?11:16,wide?6:9)}{text(`${t('PARTNERSHIP RATE','साझेदारी रन रेट')} ${n(partnershipRate)}`,s.rate,wide?8:11,wide?5:7)}</div>
   <div className={s.score}>{text(`${nplTeam(data.teamId).short} ${n(cricketScore(data.runs,data.wickets))}`,s.fill,wide?12:16,wide?6:8)}{text(`${n(data.overs)} ${t('OVERS','ओभर')}`,s.overs,wide?9:12,wide?5:7)}</div>
   <div className={s.notes} {...select('supporting')}>{text([data.matchDate,host?`${t('SOURCE','स्रोत')}: ${host}`:''].filter(Boolean).join(' · '),s.meta,wide?4.5:6,wide?3:3)}{!design.hiddenLayers.includes('supporting')&&design.summary&&text(design.summary,s.fill,wide?5:7,wide?3.5:4.5)}{credit&&text(credit,s.credit,wide?3.5:4.5,wide?2.5:3)}</div>
   <footer className={base.footer} {...select('footer')}>{text(design.hiddenLayers.includes('footer')?'':design.author,base.author,wide?4.5:6,3.5)}{text('NPL 2026 | Cricket',base.footerLabel,wide?4.5:6,3.5)}</footer>
  </div>{guides&&<div className={base.guides} aria-hidden="true"/>}
 </div>;
});
PartnershipArtwork.displayName='PartnershipArtwork';
