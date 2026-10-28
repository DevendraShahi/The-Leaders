import { defaultPostDesign, type PostDesign, type PostFormat } from './types';
export const newsStyles = [
    { id: 'daily', title: 'Daily News', description: 'Headline-first newspaper typography with a framed photograph.' },
    { id: 'hot', title: 'Hot News', description: 'Full-bleed photography, oversized type and a sharp red accent.' },
    { id: 'report', title: 'News Report', description: 'A crisp editorial panel layered over your news photograph.' },
] as const;
export type NewsStyle = typeof newsStyles[number]['id'];
export const newsCopy = { headline: 120, summary: 240 };
export function createNewsDesign(style: NewsStyle, format: PostFormat = 'portrait', language: 'en' | 'ne' = 'en'): PostDesign {
    const ne = language === 'ne';
    return { ...structuredClone(defaultPostDesign), template: 'breaking', newsStyle: style, format,
        category: ne ? 'समाचार' : 'NEWS', eyebrow: style === 'daily' ? ne ? 'आजको समाचार' : 'DAILY NEWS' : style === 'hot' ? ne ? 'ताजा खबर' : 'HOT NEWS' : ne ? 'समाचार' : 'NEWS REPORT',
        headline: '', summary: '', author: ne ? 'द लिडर्स समाचार डेस्क' : 'The Leaders News Desk', imageUri: null,
        accent: '#b71c1c', imageFit: 'cover', imageZoom: 1, backgroundColor: style === 'daily' ? '#f4efe5' : '#0c1820',
    };
}
export function newsSample(style: NewsStyle, format: PostFormat, language: 'en' | 'ne') {
    return { ...createNewsDesign(style, format, language),
        headline: language === 'ne' ? 'आजको प्रमुख समाचार यहाँ प्रस्तुत गर्नुहोस्' : 'The story that matters, clearly told.',
        summary: language === 'ne' ? 'के भयो, कहाँ भयो र पाठकका लागि किन महत्त्वपूर्ण छ भन्ने कुरा पुष्टि भएका तथ्यका आधारमा लेख्नुहोस्।' : 'Explain what happened, where it happened and why it matters. Use confirmed facts and give readers the context they need.',
    };
}
