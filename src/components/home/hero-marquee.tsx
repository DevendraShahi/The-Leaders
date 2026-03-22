import { getArticles } from "@/lib/data";
import { getLeaders } from "@/lib/leaders-db";
import { HeroMarqueeClient, MarqueeItem } from "./hero-marquee-client";

export async function HeroMarquee() {
    const [articles, leaders] = await Promise.all([
        getArticles(10), // Limit non-election articles
        getLeaders()
    ]);

    const items: MarqueeItem[] = [];
    const maxLength = Math.max(articles.length, leaders.length);
    
    // Mix them up by interleaving them
    for (let i = 0; i < maxLength; i++) {
        if (i < articles.length) {
            items.push({
                type: 'article',
                titleEn: articles[i].title?.en || articles[i].title?.ne || '',
                titleNe: articles[i].title?.ne || articles[i].title?.en || '',
                link: `/articles/${articles[i].slug}`
            });
        }
        if (i < leaders.length) {
            items.push({
                type: 'leader',
                titleEn: leaders[i].name?.en || leaders[i].name?.ne || '',
                titleNe: leaders[i].name?.ne || leaders[i].name?.en || '',
                link: `/leaders/${leaders[i].slug}`
            });
        }
    }

    return <HeroMarqueeClient items={items} />;
}
