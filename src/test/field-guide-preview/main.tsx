import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import '@/app/globals.css';
import { Artwork } from '@/components/admin/post-studio/Artwork';
import type { TemplateExample } from '@/lib/post-studio/template-examples';
import type { PostFormat } from '@/lib/post-studio/types';
import { artworkFitIssues } from '@/lib/post-studio/artwork-fit';
import { artworkBytes } from '@/lib/post-studio/export';
import { cricketTemplate } from '@/lib/post-studio/cricket-catalog';
import { fixturesHeadline } from '@/lib/post-studio/fixtures-post';
import { applyPlayerPortrait } from '@/lib/post-studio/player-portraits';
import { headToHeadHeadline } from '@/lib/post-studio/head-to-head';
declare global { interface Window { renderTemplateExample?: (index: number, format?: PostFormat, language?: 'en' | 'ne', paper?: boolean, withoutMetadata?: boolean, scorecardRows?: [number, number], withoutSummary?: boolean) => void; exportTemplateExample?: (includeImage?: boolean) => Promise<{ width: number; height: number; bytes: number; dataUrl?: string }>; checkTemplateExample?: () => { error: string; overflow: string[]; regions: { name: string; x: number; y: number; w: number; h: number }[] }; } }
function Preview({ examples }: { examples: TemplateExample[] }) {
    const [config, setConfig] = useState({ index: 0, format: 'portrait' as PostFormat, language: 'en' as 'en' | 'ne', paper: false, withoutMetadata: false, scorecardRows: undefined as [number, number] | undefined, withoutSummary: false });
    useEffect(() => { window.renderTemplateExample = (index, format = 'portrait', language = 'en', paper = false, withoutMetadata = false, scorecardRows, withoutSummary = false) => flushSync(() => setConfig({ index, format, language, paper, withoutMetadata, scorecardRows, withoutSummary })); return () => { delete window.renderTemplateExample; }; }, []);
    const design = structuredClone(examples[config.index].design);
    design.format = config.format;
    if (design.cricket) {
        if (config.withoutMetadata) {
            design.cricket.matchDate = '';
            if (design.cricket.template === 'innings') Object.assign(design.cricket, { teamId: 'chitwan', opponentId: 'sudurpaschim', runs: 157, wickets: 3, overs: '20', target: 158, batter: { ...design.cricket.batter, name: '' }, secondBatter: { ...design.cricket.secondBatter, name: '' } });
        }
        if (config.scorecardRows && design.cricket.template === 'scorecard') {
            Object.assign(design.cricket, { runs: 200, wickets: 10, overs: '20', sample: true });
            const longName = config.language === 'ne' ? 'अन्तर्राष्ट्रिय क्रिकेट प्रतियोगिताका नमुना खेलाडीको पूरा लामो नाम' : 'Illustrative international cricket player with a deliberately long published full name';
            design.cricket.batting = Array.from({ length: config.scorecardRows[0] }, (_, i) => ({ name: `${i + 1} ${longName}`.slice(0, 90), runs: 10, balls: 10, fours: 1, sixes: 0, notOut: false }));
            design.cricket.bowling = Array.from({ length: config.scorecardRows[1] }, (_, i) => ({ name: `${i + 1} ${longName}`.slice(0, 90), overs: '1', maidens: 0, runs: 10, wickets: 0 }));
        }
        design.cricket.language = config.language; design.cricketStyle = config.paper ? 'editorial' : 'stadium';
        if (config.language === 'ne') {
            design.headline = design.cricket.template === 'fixtures' ? fixturesHeadline('ne') : design.cricket.template === 'head-to-head' ? headToHeadHeadline('ne') : cricketTemplate(design.cricket.template).headlineNe;
            design.summary = 'अभ्यासका लागि नमुना तथ्याङ्क। प्रकाशनअघि परिवर्तन गर्नुहोस्।';
        }
        if (config.scorecardRows?.[1] === 6) design.summary = '';
    }
    if (design.cricket?.template === 'wicket' && new URLSearchParams(window.location.search).has('short-wicket')) {
        Object.assign(design.cricket, { teamId: 'pokhara', opponentId: 'sudurpaschim', momentPhotoRole: 'bowler' });
        design.cricket.bowler.name = 'Aarif Sheikh'; design.cricket.batter.name = 'Aakash Chand';
        design.imageUri = null; design.playerPhotoId = undefined;
        Object.assign(design, applyPlayerPortrait(design));
    }
    if (config.withoutSummary) design.summary = '';
    useEffect(() => { window.exportTemplateExample = async (includeImage = false) => { const bytes = await artworkBytes(document.querySelector('[data-testid="post-artwork"]') as HTMLElement, config.format); const bitmap = await createImageBitmap(new Blob([bytes as BlobPart], { type: 'image/png' })); const dataUrl = includeImage ? await new Promise<string>(resolve => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(new Blob([bytes as BlobPart], { type: 'image/png' })); }) : undefined; const result = { width: bitmap.width, height: bitmap.height, bytes: bytes.length, ...(dataUrl ? { dataUrl } : {}) }; bitmap.close(); return result; }; return () => { delete window.exportTemplateExample; }; }, [config.format]);
    return <div style={{ padding: 30, background: '#d4d5d4', minHeight: '100vh' }}><Artwork design={design} /></div>;
}
window.checkTemplateExample = () => {
    const root = document.querySelector<HTMLElement>('[data-testid="post-artwork"]')!;
    const rect = root.getBoundingClientRect();
    const regions = [...root.querySelectorAll<HTMLElement>('[data-guide-section]')].map(node => ({ name: node.dataset.guideSection!, node }));
    const fallbacks: [string, string][] = [
        ['brand', 'header'], ['headline', '[data-testid="artwork-headline"]'], ['identity', '[class*="_teams_"],[class*="_identity_"],[class*="_comparison_"],[class*="_pair_"]'],
        ['hero', '[class*="_hero_"],[class*="_mainScore_"],[class*="_scoreValue_"]'], ['metrics', '[class*="_facts_"],[class*="_stats_"]'], ['snapshot', '[class*="_score_"],[class*="_snapshot_"],[class*="_scoreboard_"]'],
        ['player-name', '[class*="_playerName_"]'], ['batters', '[class*="_batters_"]'], ['chase', '[class*="_chase_"]'], ['starting-xi', 'ol'], ['summary', '[class*="_summary_"],[class*="_summaryBlock_"]'], ['footer', 'footer,[class*="_artworkFooter_"]'],
    ];
    for (const [name, selector] of fallbacks) {
        if (regions.some(region => region.name === name)) continue;
        const node = root.querySelector<HTMLElement>(selector);
        if (node && node.clientWidth && node.clientHeight) regions.push({ name, node });
    }
    return { error: root.dataset.exportError ?? '', overflow: artworkFitIssues(root).map(node => `${node.className}: ${node.textContent?.slice(0, 70)}`), regions: regions.map(({ name, node }) => { const box = node.getBoundingClientRect(); return { name, x: (box.x - rect.x) / rect.width, y: (box.y - rect.y) / rect.height, w: box.width / rect.width, h: box.height / rect.height }; }) };
};
void fetch('/studio/template-guide/manifest.json').then(response => response.json()).then(({ examples }: { examples: TemplateExample[] }) => createRoot(document.getElementById('root')!).render(<Preview examples={examples} />));
