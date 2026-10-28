import { defaultPostDesign, type PostDesign, type PostFormat } from './types';
export const newsStyles = [
    { id: 'daily', title: 'Daily News', description: 'Headline-first newspaper typography with a framed photograph.' },
    { id: 'hot', title: 'Hot News', description: 'A framed photograph, oversized type and a sharp red accent on paper.' },
    { id: 'report', title: 'News Report', description: 'A crisp paper editorial panel paired with your news photograph.' },
    { id: 'do-you-know', title: 'Do You Know?', description: 'A curiosity-led question, a clear answer and an optional photograph on warm paper.' },
    { id: 'interesting-facts', title: 'Interesting Facts', description: 'One remarkable fact with its explanation in a clean, paper editorial layout.' },
] as const;
export type NewsStyle = typeof newsStyles[number]['id'];
export const isFactStyle = (style?: string) => style === 'do-you-know' || style === 'interesting-facts';
export const newsCopy = { headline: 120, summary: 240 };
export function createNewsDesign(style: NewsStyle, format: PostFormat = 'portrait', language: 'en' | 'ne' = 'en'): PostDesign {
    const ne = language === 'ne';
    const fact = isFactStyle(style);
    const label = style === 'do-you-know' ? ne ? 'के तपाईंलाई थाहा छ?' : 'DO YOU KNOW?' : ne ? 'रोचक तथ्य' : 'INTERESTING FACTS';
    return { ...structuredClone(defaultPostDesign), template: 'breaking', newsStyle: style, format, contentLanguage: language,
        category: fact ? ne ? 'ज्ञान र जिज्ञासा' : 'KNOWLEDGE & CURIOSITY' : ne ? 'समाचार' : 'NEWS', eyebrow: fact ? label : style === 'daily' ? ne ? 'आजको समाचार' : 'DAILY NEWS' : style === 'hot' ? ne ? 'ताजा खबर' : 'HOT NEWS' : ne ? 'समाचार' : 'NEWS REPORT',
        headline: '', summary: '', author: fact ? ne ? 'द लिडर्स · ज्ञान र जिज्ञासा' : 'The Leaders · Knowledge & Curiosity' : ne ? 'द लिडर्स समाचार डेस्क' : 'The Leaders News Desk', imageUri: null,
        accent: fact ? '#d7aa46' : '#b71c1c', imageFit: 'cover', imageZoom: 1, backgroundColor: '#f4efe5',
    };
}
export function newsSample(style: NewsStyle, format: PostFormat, language: 'en' | 'ne') {
    if (isFactStyle(style)) return { ...createNewsDesign(style, format, language),
        headline: language === 'ne' ? style === 'do-you-know' ? 'एउटा प्रश्नले नयाँ संसार खोल्न सक्छ।' : 'साना तथ्य, फराकिलो दृष्टिकोण।' : style === 'do-you-know' ? 'One question can open a whole new world.' : 'Small facts. A bigger perspective.',
        summary: language === 'ne' ? 'आफ्नो पुष्टि भएको तथ्य यहाँ राख्नुहोस्। यसको अर्थ सरल भाषामा खुलाउनुहोस् र स्रोतको लिङ्क मस्यौदामा राख्नुहोस्।' : 'Place your verified fact here. Explain what makes it surprising, add the context that matters, and keep a source link with your draft.',
    };
    return { ...createNewsDesign(style, format, language),
        headline: language === 'ne' ? 'आजको प्रमुख समाचार यहाँ प्रस्तुत गर्नुहोस्' : 'The story that matters, clearly told.',
        summary: language === 'ne' ? 'के भयो, कहाँ भयो र पाठकका लागि किन महत्त्वपूर्ण छ भन्ने कुरा पुष्टि भएका तथ्यका आधारमा लेख्नुहोस्।' : 'Explain what happened, where it happened and why it matters. Use confirmed facts and give readers the context they need.',
    };
}
