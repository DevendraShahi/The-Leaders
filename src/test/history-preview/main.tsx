import { useEffect, useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Artwork } from '@/components/admin/post-studio/Artwork';
import CricketStudio from '@/components/admin/post-studio/CricketStudio';
import HistoryStudio from '@/components/admin/post-studio/HistoryStudio';
import { createHistoryDesign, createHistoryParagraphDesign } from '@/lib/post-studio/history-design';
import { historyTemplateIds, type HistoryTemplateId } from '@/lib/post-studio/history-catalog';
import { artworkFitIssues } from '@/lib/post-studio/artwork-fit';
import { artworkBytes } from '@/lib/post-studio/export';
import type { PostDesign, PostFormat } from '@/lib/post-studio/types';

declare global { interface Window {
    renderHistoryExample?: (id: HistoryTemplateId, format: PostFormat, language: 'en' | 'ne', stress?: boolean, photo?: boolean, paragraph?: boolean) => void;
    checkHistoryExample?: () => { error: string; overflow: string[]; fonts: boolean };
    exportHistoryExample?: () => Promise<string>;
} }
function Preview() {
    const [design, setDesign] = useState<PostDesign>(() => createHistoryDesign('on-this-day'));
    useEffect(() => {
        window.renderHistoryExample = (id, format, language, stress = false, photo = false, paragraph = false) => {
            const next = createHistoryDesign(id, format, language);
            if (stress) {
                next.headline = language === 'ne' ? 'इतिहासको महत्त्वपूर्ण घटनाको सम्झना र त्यसको ऐतिहासिक प्रभाव' : 'Remembering an event and its lasting place in history';
                next.summary = language === 'ne' ? 'इतिहासका अभिलेखमा उल्लेख गरिएको घटनाले समाज र संस्कृतिमा पारेको प्रभावलाई तथ्य र सन्दर्भका आधारमा सम्झने एउटा प्रयास।' : 'The recorded event shaped society and culture, leaving a legacy that readers can understand through its historical context and the surviving archival evidence.';
                next.history!.subject = language === 'ne' ? 'अभिलेखमा उल्लिखित ऐतिहासिक घटनाको पूरा विवरण र सम्बन्धित व्यक्तित्व' : 'A deliberately long historical subject with its complete archival name and title';
                next.history!.fact = language === 'ne' ? 'सुरक्षित अभिलेख र ऐतिहासिक स्रोतहरूमा उल्लेख भएका तथ्यहरूको आधारमा यो घटनाको मिति र त्यसबेला भएको विकासक्रमलाई सन्दर्भसहित प्रस्तुत गरिएको छ।' : 'Surviving historical records describe the event in its original context and distinguish the date of the announcement from the later changes it inspired across the community.';
                next.history!.lifespan = '1800 – 1900';
            }
            if (photo) next.imageUri = '/studio/cricket/players/dipendra-singh-airee.webp';
            const prose = language === 'ne' ? 'यस घटनाको ऐतिहासिक पृष्ठभूमि र त्यसले समाजमा पारेको प्रभावलाई सन्दर्भसहित प्रस्तुत गरिएको छ। ' : 'The surviving records explain the background of this event and its significance for the community. ';
            const page = paragraph ? createHistoryParagraphDesign(next, stress ? prose.repeat(20).slice(0, 900) : prose.repeat(3), language === 'ne' ? 'घटनाको पृष्ठभूमि' : 'The story behind the date') : next;
            flushSync(() => setDesign(page));
        };
        return () => { delete window.renderHistoryExample; };
    }, []);
    return <div style={{ padding: 20, width: 400, boxSizing: 'border-box', background: '#ddd' }}><Artwork design={design} /></div>;
}
window.checkHistoryExample = () => {
    const root = document.querySelector<HTMLElement>('[data-history-template]')!;
    return { error: root.dataset.exportError ?? '', overflow: artworkFitIssues(root).map(node => `${node.className}: ${node.textContent?.slice(0, 70)}`), fonts: document.fonts.check('16px Lora_700Bold') && document.fonts.check('16px Hind_700Bold') };
};
window.exportHistoryExample = async () => {
    const root = document.querySelector<HTMLElement>('[data-history-template]')!;
    const bytes = await artworkBytes(root, root.dataset.format as PostFormat);
    return await new Promise<string>(resolve => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.readAsDataURL(new Blob([new Uint8Array(bytes).buffer], { type: 'image/png' })); });
};
const desk = new URLSearchParams(location.search).has('desk');
const cricket = new URLSearchParams(location.search).has('cricket');
createRoot(document.getElementById('root')!).render(cricket ? <CricketStudio scope="history-preview" onBack={() => {}} onOpenDraft={() => {}} /> : desk ? <HistoryStudio scope="history-preview" onBack={() => {}} onOpenDraft={() => {}} /> : <Preview />);
export { historyTemplateIds };
