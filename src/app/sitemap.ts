import { MetadataRoute } from "next";
import dbConnect from "@/lib/db";
import Article from "@/models/Article";
import Leader from "@/models/Leader";
import History from "@/models/History";
import {
  DailyBrief,
  FactCheck,
  ElectionArticle,
} from "@/models/ElectionContent";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://the-leadersnp.com";
  const currentDate = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/history`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/articles`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/leaders`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/election-2026`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/election-2026/analyses`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/election-2026/daily-brief`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/election-2026/fact-checks`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/election-2026/map-v2`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.75,
    },
    {
      url: `${baseUrl}/election-2026/snapshot`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/election-2026/timeline`,
      lastModified: currentDate,
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/election-2026/manifesto`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.78,
    },
    {
      url: `${baseUrl}/election-2026/profiles`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/election-2026/parties`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/subscribe`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/cookie-policy`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/accessibility`,
      lastModified: currentDate,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  try {
    await dbConnect();

    // Fetch articles
    const articles = await Article.find({ status: "published" })
      .select("slug updatedAt")
      .lean();
    const articlePages: MetadataRoute.Sitemap = articles.map(
      (article: any) => ({
        url: `${baseUrl}/articles/${article.slug}`,
        lastModified: article.updatedAt || currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      }),
    );

    // Fetch leaders
    const leaders = await Leader.find({ status: "published" })
      .select("slug updatedAt")
      .lean();
    const leaderPages: MetadataRoute.Sitemap = leaders.map((leader: any) => ({
      url: `${baseUrl}/leaders/${leader.slug}`,
      lastModified: leader.updatedAt || currentDate,
      changeFrequency: "monthly" as const,
      priority: 0.8,
    }));

    // Election content detail pages
    const [electionArticles, dailyBriefs, factChecks] = await Promise.all([
      ElectionArticle.find({ status: "published" })
        .select("slug updatedAt")
        .lean(),
      DailyBrief.find({ status: "published" }).select("slug updatedAt").lean(),
      FactCheck.find({ status: "published" }).select("slug updatedAt").lean(),
    ]);

    const electionArticlePages: MetadataRoute.Sitemap = electionArticles
      .filter((item: any) => item.slug)
      .map((item: any) => ({
        url: `${baseUrl}/election-2026/analyses/${item.slug}`,
        lastModified: item.updatedAt || currentDate,
        changeFrequency: "weekly" as const,
        priority: 0.75,
      }));

    const dailyBriefPages: MetadataRoute.Sitemap = dailyBriefs
      .filter((item: any) => item.slug)
      .map((item: any) => ({
        url: `${baseUrl}/election-2026/daily-brief/${item.slug}`,
        lastModified: item.updatedAt || currentDate,
        changeFrequency: "daily" as const,
        priority: 0.75,
      }));

    const factCheckPages: MetadataRoute.Sitemap = factChecks
      .filter((item: any) => item.slug)
      .map((item: any) => ({
        url: `${baseUrl}/election-2026/fact-checks/${item.slug}`,
        lastModified: item.updatedAt || currentDate,
        changeFrequency: "daily" as const,
        priority: 0.75,
      }));

    return [
      ...staticPages,
      ...articlePages,
      ...leaderPages,
      ...electionArticlePages,
      ...dailyBriefPages,
      ...factCheckPages,
    ];
  } catch (error) {
    // If database fails, return static pages only
    console.error("Failed to generate full sitemap:", error);
    return staticPages;
  }
}
