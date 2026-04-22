import dbConnect from "@/lib/db";
import Article, { IArticle } from "@/models/Article";
import { unstable_cache } from "next/cache";
import { logger } from "@/lib/logger";

// Cache the result globally using unstable_cache
export const getArticles = unstable_cache(
    async (limit: number = 3) => {
        try {
            await dbConnect();
            const articles = await Article.find({ status: "published" })
                .sort({ publishedDate: -1 })
                .limit(limit)
                .lean();

            return JSON.parse(JSON.stringify(articles)) as IArticle[];
        } catch (error) {
            logger.error("Failed to fetch articles", { error, limit });
            return [];
        }
    },
    ['articles-list'],
    { tags: ['articles'] }
);

export const getArticleBySlug = unstable_cache(
    async (slug: string) => {
        try {
            await dbConnect();
            const article = await Article.findOne({ slug, status: "published" }).lean();
            if (!article) return null;
            return JSON.parse(JSON.stringify(article)) as IArticle;
        } catch (error) {
            logger.error("Failed to fetch article by slug", { error, slug });
            return null;
        }
    },
    ['article-by-slug'],
    { tags: ['articles'] }
);
