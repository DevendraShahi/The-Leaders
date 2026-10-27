import type { MetadataRoute } from 'next';
import dbConnect from '@/lib/db';
import Article from '@/models/Article';
import Leader from '@/models/Leader';
export const revalidate = 86400;
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://the-leadersnp.com';
    const pages: MetadataRoute.Sitemap = ['','/articles','/leaders','/about','/contact','/privacy-policy','/terms'].map(path => ({url: base + path}));
    await dbConnect();
    const [articles, leaders] = await Promise.all([
        Article.find({status:'published'}).select('slug updatedAt').sort({updatedAt:-1}).limit(1000).lean(),
        Leader.find({status:'published'}).select('slug updatedAt').sort({updatedAt:-1}).limit(1000).lean(),
    ]);
    for (const [prefix, rows] of [['/articles/',articles],['/leaders/',leaders]] as const) for (const row of rows) if(row.slug) pages.push({url:base+prefix+row.slug,lastModified:(row as {updatedAt?: Date}).updatedAt});
    return pages;
}
