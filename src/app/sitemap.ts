import { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Leader from '@/models/Leader';
import History from '@/models/History';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://theleaders.com.np';
    const currentDate = new Date();

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/about`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/history`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.8,
        },
        {
            url: `${baseUrl}/articles`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/leaders`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/election-2026`,
            lastModified: currentDate,
            changeFrequency: 'daily',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/election-2026/pr-candidates`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/election-2026/profiles`,
            lastModified: currentDate,
            changeFrequency: 'weekly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/parties`,
            lastModified: currentDate,
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/contact`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.5,
        },
        {
            url: `${baseUrl}/privacy-policy`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/terms`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/cookie-policy`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
        {
            url: `${baseUrl}/accessibility`,
            lastModified: currentDate,
            changeFrequency: 'yearly',
            priority: 0.3,
        },
    ];

    try {
        await dbConnect();

        // Fetch articles
        const articles = await Article.find({}).select('slug updatedAt').lean();
        const articlePages: MetadataRoute.Sitemap = articles.map((article: any) => ({
            url: `${baseUrl}/articles/${article.slug}`,
            lastModified: article.updatedAt || currentDate,
            changeFrequency: 'weekly' as const,
            priority: 0.7,
        }));

        // Fetch leaders
        const leaders = await Leader.find({}).select('slug updatedAt').lean();
        const leaderPages: MetadataRoute.Sitemap = leaders.map((leader: any) => ({
            url: `${baseUrl}/leaders/${leader.slug}`,
            lastModified: leader.updatedAt || currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.8,
        }));

        // Fetch history entries - note: History model might not have slug, using _id or title as fallback
        const historyEntries = await History.find({}).select('_id title updatedAt').lean();
        const historyPages: MetadataRoute.Sitemap = historyEntries.map((entry: any) => ({
            url: `${baseUrl}/history/${entry._id}`,
            lastModified: entry.updatedAt || currentDate,
            changeFrequency: 'monthly' as const,
            priority: 0.6,
        }));

        return [...staticPages, ...articlePages, ...leaderPages, ...historyPages];
    } catch (error) {
        // If database fails, return static pages only
        console.error('Failed to generate full sitemap:', error);
        return staticPages;
    }
}
