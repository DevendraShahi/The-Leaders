import { useState } from 'react';
import { flushSync } from 'react-dom';
import { createRoot } from 'react-dom/client';
import { Artwork } from '@/components/admin/post-studio/Artwork';
import NewsStudio from '@/components/admin/post-studio/NewsStudio';
import { newsSample, type NewsStyle } from '@/lib/post-studio/news-design';
import type { PostFormat } from '@/lib/post-studio/types';
import { artworkFitIssues } from '@/lib/post-studio/artwork-fit';
import { artworkBytes } from '@/lib/post-studio/export';
function Preview() {
    const [design, setDesign] = useState(() => newsSample('daily', 'portrait', 'en'));
    Object.assign(window, {
        renderNews: (style: NewsStyle, format: PostFormat, language: 'en' | 'ne', stress = false) => {
            const design = newsSample(style, format, language); design.imageUri = '/studio/cricket/backgrounds/stadium-01.jpg';
            if (stress) { design.headline = (language === 'ne' ? 'समाचारको तथ्य र सन्दर्भ स्पष्ट रूपमा प्रस्तुत गरौँ ' : 'A confirmed development with important context for readers ').repeat(4).slice(0, 120); design.summary = (language === 'ne' ? 'यो घटनाका पुष्टि भएका तथ्य र त्यसको महत्त्व पाठकलाई स्पष्ट र सरल भाषामा प्रस्तुत गरिएको छ। ' : 'The confirmed facts explain what happened and why this development matters to readers. ').repeat(5).slice(0, 240); }
            flushSync(() => setDesign(design));
        },
        setNewsVariant: (variant: number) => flushSync(() => setDesign(current => ({ ...current, echo11Variant: variant }))),
        checkNews: () => {
            const root = document.querySelector<HTMLElement>('[data-news-style]')!;
            const issues = artworkFitIssues(root).map(node => node.textContent);
            const footer = root.querySelector('footer')!.getBoundingClientRect();
            const banner = root.querySelector('[data-testid="echo11-promotion"]')?.getBoundingClientRect();
            if (!banner || footer.bottom > banner.top + 1) issues.push('News content overlaps the echo11 advertisement');
            return issues;
        },
        exportNews: async () => { const result = await artworkBytes(document.querySelector('[data-news-style]')!, design.format); return Array.from(result); },
    });
    return <Artwork design={design} />;
}
createRoot(document.getElementById('root')!).render(location.search ? <NewsStudio scope="news-check" onBack={() => {}} onOpenDraft={() => {}} /> : <Preview />);
